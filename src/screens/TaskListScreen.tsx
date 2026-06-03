import React, { useRef, useState } from "react";
import { Animated, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useTasks } from "../context/TaskContext";
import { cancelTaskNotification } from "../services/NotificationService";
import { Task } from "../types/task";
import { formatDuration } from "../utils/estimateDuration";

function formatRecurrence(recurrence: Task["recurrence"]) {
  if (!recurrence) {
    return "None";
  }

  return recurrence.charAt(0).toUpperCase() + recurrence.slice(1);
}

export default function TaskListScreen() {
  const router = useRouter();
  const { categories, tasks, deleteTask, toggleTaskCompleted, updateTask } = useTasks();

  const [sortBy, setSortBy] = useState<"none" | "priority" | "dueDate">("none");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [flashingTaskId, setFlashingTaskId] = useState<string | null>(null);
  const flashOpacity = useRef(new Animated.Value(0)).current;

  // Migrate feature state
  const [migrateOpenId, setMigrateOpenId] = useState<string | null>(null);
  const [migrateFlashId, setMigrateFlashId] = useState<string | null>(null);
  const [migrateFlashText, setMigrateFlashText] = useState("");
  const migrateFlashOpacity = useRef(new Animated.Value(0)).current;

  // Per-task error messages for action validation and rapid completion feedback
  const [taskErrors, setTaskErrors] = useState<Record<string, string>>({});

  const showTaskError = (taskId: string, message: string) => {
    setTaskErrors((current) => ({ ...current, [taskId]: message }));
    setTimeout(() => {
      setTaskErrors((current) => {
        const next = { ...current };
        delete next[taskId];
        return next;
      });
    }, 4000);
  };

  const handleToggle = async (taskId: string, currentlyCompleted: boolean) => {
    const result = await toggleTaskCompleted(taskId);

    if (!result.success) {
      if (result.reason) {
        showTaskError(taskId, result.reason);
      }
      return;
    }

    if (!currentlyCompleted) {
      setFlashingTaskId(taskId);
      flashOpacity.setValue(1);
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }).start(() => setFlashingTaskId(null));
    }
  };

  const handleDelete = async (taskId: string, notificationId?: string | null) => {
    const result = await deleteTask(taskId);

    if (!result.success) {
      if (result.reason) {
        showTaskError(taskId, result.reason);
      }
      return;
    }

    await cancelTaskNotification(notificationId);
  };

  const handleMigrate = async (task: Task, days: number) => {
    const base = task.dueDate ? new Date(task.dueDate) : new Date();
    base.setDate(base.getDate() + days);
    const newDueDate = base.toISOString();

    await updateTask(task.id, { dueDate: newDueDate });

    const label = base.toLocaleDateString("en-NZ");
    setMigrateFlashText(`Moved to ${label}`);
    setMigrateFlashId(task.id);
    setMigrateOpenId(null);
    migrateFlashOpacity.setValue(1);
    Animated.timing(migrateFlashOpacity, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => setMigrateFlashId(null));
  };

  const priorityOrder = { low: 1, medium: 2, high: 3 };
  const query = searchQuery.trim().toLowerCase();

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory =
      selectedCategory === "All" || task.category === selectedCategory;
    const matchesSearch =
      query === "" || task.title.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    if (sortBy === "priority") {
      const result =
        priorityOrder[a.priority || "medium"] -
        priorityOrder[b.priority || "medium"];

      return sortDirection === "asc" ? result : -result;
    }

    if (sortBy === "dueDate") {
      const result =
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();

      return sortDirection === "asc" ? result : -result;
    }

    return getDueDateTime(a.dueDate) - getDueDateTime(b.dueDate);
  });

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "#f8f8fb" }}>
      <Pressable
        onPress={() => router.back()}
        style={{
          alignSelf: "flex-start",
          backgroundColor: "#e8e8ef",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          marginBottom: 12,
        }}
      >
        <Text style={{ fontWeight: "bold" }}>Back</Text>
      </Pressable>

      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>
        Manage Tasks
      </Text>

      <Pressable
        onPress={() => router.push("/create")}
        style={{
          backgroundColor: "#8a008a",
          padding: 14,
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Add Task</Text>
      </Pressable>

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search tasks..."
        placeholderTextColor="#9ca3af"
        style={{
          backgroundColor: "white",
          padding: 12,
          borderRadius: 10,
          marginBottom: 14,
          fontSize: 16,
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }}
      />

      <View
        style={{
          backgroundColor: "white",
          padding: 12,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Categories</Text>

        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {["All", ...categories].map((category) => (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={{
                backgroundColor:
                  selectedCategory === category ? "#8a008a" : "#e8e8ef",
                padding: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: selectedCategory === category ? "white" : "black" }}>
                {category}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View
        style={{
          backgroundColor: "white",
          padding: 12,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Sort Tasks</Text>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          <Pressable
            onPress={() => setSortBy("priority")}
            style={{
              flex: 1,
              backgroundColor: sortBy === "priority" ? "#8a008a" : "#e8e8ef",
              padding: 10,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: sortBy === "priority" ? "white" : "black" }}>
              Priority
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSortBy("dueDate")}
            style={{
              flex: 1,
              backgroundColor: sortBy === "dueDate" ? "#8a008a" : "#e8e8ef",
              padding: 10,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: sortBy === "dueDate" ? "white" : "black" }}>
              Due Date
            </Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable
            onPress={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
            style={{
              flex: 1,
              backgroundColor: "#e8e8ef",
              padding: 10,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text>{sortDirection === "asc" ? "Ascending" : "Descending"}</Text>
          </Pressable>

          <Pressable
            onPress={() => setSortBy("none")}
            style={{
              flex: 1,
              backgroundColor: "#e8e8ef",
              padding: 10,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text>Clear</Text>
          </Pressable>
        </View>
      </View>

      {sortedTasks.length === 0 ? (
        <Text style={{ textAlign: "center", color: "#9ca3af", marginTop: 24 }}>
          No tasks match your search.
        </Text>
      ) : null}

      {sortedTasks.map((task) => (
        <View
          key={task.id}
          style={{
            backgroundColor: task.completed ? "#f0fdf4" : "white",
            padding: 14,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: task.completed ? "#86efac" : "#eee",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                textDecorationLine: task.completed ? "line-through" : "none",
                color: task.completed ? "#6b7280" : "#000",
                flex: 1,
              }}
            >
              {task.title}
            </Text>
            {flashingTaskId === task.id ? (
              <Animated.Text
                style={{
                  opacity: flashOpacity,
                  color: "#16a34a",
                  fontWeight: "bold",
                  fontSize: 15,
                  marginLeft: 8,
                }}
              >
                +5 pts!
              </Animated.Text>
            ) : null}
            {task.completed && flashingTaskId !== task.id ? (
              <Text style={{ color: "#16a34a", fontWeight: "bold", fontSize: 13 }}>
                +5 pts
              </Text>
            ) : null}
            {migrateFlashId === task.id ? (
              <Animated.Text
                style={{
                  opacity: migrateFlashOpacity,
                  color: "#8a008a",
                  fontWeight: "bold",
                  fontSize: 13,
                  marginLeft: 8,
                }}
              >
                {migrateFlashText}
              </Animated.Text>
            ) : null}
          </View>

          <Text style={{ marginTop: 4, color: task.completed ? "#6b7280" : "#000" }}>
            Status: {task.completed ? "Completed" : "Incomplete"}
          </Text>
          {taskErrors[task.id] ? (
            <View
              style={{
                backgroundColor: "#fef2f2",
                borderRadius: 8,
                padding: 10,
                marginTop: 8,
                borderWidth: 1,
                borderColor: "#fca5a5",
              }}
            >
              <Text style={{ color: "#dc2626", fontSize: 13, fontWeight: "600" }}>
                {taskErrors[task.id]}
              </Text>
            </View>
          ) : null}
          {task.generatedFromTaskId ? (
            <Text style={{ color: "#16a34a", fontWeight: "bold" }}>
              Next repeat
            </Text>
          ) : null}

          <Text style={{ color: task.completed ? "#6b7280" : "#000" }}>Priority: {task.priority || "medium"}</Text>
          <Text style={{ color: task.completed ? "#6b7280" : "#000" }}>Category: {task.category || "Uncategorized"}</Text>
          {task.recurrence ? (
            <Text style={{ color: task.completed ? "#6b7280" : "#000" }}>
              Repeat: {formatRecurrence(task.recurrence)}
            </Text>
          ) : null}

          {task.description ? (
            <Text style={{ marginTop: 4, color: task.completed ? "#6b7280" : "#000" }}>{task.description}</Text>
          ) : null}

          <Text style={{ color: task.completed ? "#6b7280" : "#000" }}>
            Due:{" "}
            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString("en-NZ")
              : "Not set"}
          </Text>

          {migrateOpenId === task.id ? (
            <View style={{
              marginTop: 10,
              backgroundColor: "#f5f0ff",
              borderRadius: 8,
              padding: 10,
              borderWidth: 1,
              borderColor: "#c4b5fd",
            }}>
              <Text style={{ color: "#6b21a8", fontWeight: "bold", fontSize: 13, marginBottom: 8 }}>
                Migrate to:
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={() => handleMigrate(task, 1)}
                  style={{
                    flex: 1,
                    backgroundColor: "#8a008a",
                    padding: 10,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold", fontSize: 13 }}>Tomorrow</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleMigrate(task, 7)}
                  style={{
                    flex: 1,
                    backgroundColor: "#8a008a",
                    padding: 10,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold", fontSize: 13 }}>Next Week</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {task.estimatedMinutes ? (
            <Text style={{ color: task.completed ? "#6b7280" : "#8a008a", fontWeight: "600" }}>
              Estimated time: {formatDuration(task.estimatedMinutes)}
            </Text>
          ) : null}

          {task.subtasks && task.subtasks.length > 0 ? (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontWeight: "bold", fontSize: 13, color: task.completed ? "#6b7280" : "#333", marginBottom: 6 }}>
                Steps: {task.subtasks.filter((subtask) => subtask.completed).length}/{task.subtasks.length} done
              </Text>
              {task.subtasks.map((subtask) => (
                <Pressable
                  key={subtask.id}
                  onPress={() => {
                    const updatedSubtasks = task.subtasks!.map((item) =>
                      item.id === subtask.id ? { ...item, completed: !item.completed } : item
                    );
                    updateTask(task.id, { subtasks: updatedSubtasks });
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingVertical: 4,
                  }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: subtask.completed ? "#8a008a" : "#aaa",
                      backgroundColor: subtask.completed ? "#8a008a" : "white",
                    }}
                  />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: subtask.completed ? "#6b7280" : "#333",
                      textDecorationLine: subtask.completed ? "line-through" : "none",
                    }}
                  >
                    {subtask.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/edit",
                  params: { taskId: task.id },
                })
              }
              style={{
                flex: 1,
                backgroundColor: "#8a008a",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white" }}>Edit</Text>
            </Pressable>

            <Pressable
              onPress={() => handleToggle(task.id, task.completed)}
              style={{
                flex: 1,
                backgroundColor: task.completed ? "#6b7280" : "#2d9cdb",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white" }}>
                {task.completed ? "Undo" : "Mark Done"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleDelete(task.id, task.notificationId)}
              style={{
                flex: 1,
                backgroundColor: "#eb5757",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white" }}>Delete</Text>
            </Pressable>
          </View>

          {!task.completed && (
            <Pressable
              onPress={() => setMigrateOpenId(migrateOpenId === task.id ? null : task.id)}
              style={{
                marginTop: 8,
                backgroundColor: migrateOpenId === task.id ? "#e9d5ff" : "#f5f0ff",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#c4b5fd",
              }}
            >
              <Text style={{ color: "#6b21a8", fontWeight: "bold", fontSize: 13 }}>
                {migrateOpenId === task.id ? "✕ Cancel Migrate" : "📅 Migrate"}
              </Text>
            </Pressable>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

function getDueDateTime(dueDate: string) {
  const dateTime = new Date(dueDate).getTime();

  return Number.isNaN(dateTime) ? Number.MAX_SAFE_INTEGER : dateTime;
}
