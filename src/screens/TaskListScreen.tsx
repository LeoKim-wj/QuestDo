import React, { useState, useRef } from "react";
import { View, Text, Pressable, ScrollView, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useTasks } from "../context/TaskContext";
import { cancelTaskNotification } from "../services/NotificationService";

export default function TaskListScreen() {
  const router = useRouter();
  const { categories, tasks, deleteTask, toggleTaskCompleted } = useTasks();

  const [sortBy, setSortBy] = useState<"none" | "priority" | "dueDate">("none");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [flashingTaskId, setFlashingTaskId] = useState<string | null>(null);
  const flashOpacity = useRef(new Animated.Value(0)).current;

  const handleToggle = async (taskId: string, currentlyCompleted: boolean) => {
    await toggleTaskCompleted(taskId);
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

  const priorityOrder = { low: 1, medium: 2, high: 3 };

  const filteredTasks =
    selectedCategory === "All"
      ? tasks
      : tasks.filter((task) => task.category === selectedCategory);

  const sortedTasks = [...filteredTasks].sort((a, b) => {
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

    return 0;
  });

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "#f8f8fb" }}>
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
              <Text
                style={{
                  color: selectedCategory === category ? "white" : "black",
                }}
              >
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
            {flashingTaskId === task.id && (
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
            )}
            {task.completed && flashingTaskId !== task.id && (
              <Text style={{ color: "#16a34a", fontWeight: "bold", fontSize: 13 }}>
                +5 pts
              </Text>
            )}
          </View>

          <Text style={{ marginTop: 4, color: task.completed ? "#6b7280" : "#000" }}>
            Status: {task.completed ? "Completed" : "Incomplete"}
          </Text>

          <Text style={{ color: task.completed ? "#6b7280" : "#000" }}>Priority: {task.priority || "medium"}</Text>
          <Text style={{ color: task.completed ? "#6b7280" : "#000" }}>Category: {task.category || "Uncategorized"}</Text>

          {task.description ? (
            <Text style={{ marginTop: 4, color: task.completed ? "#6b7280" : "#000" }}>{task.description}</Text>
          ) : null}

          <Text style={{ color: task.completed ? "#6b7280" : "#000" }}>
            Due:{" "}
            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString("en-NZ")
              : "Not set"}
          </Text>

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
              onPress={async () => {
                await cancelTaskNotification(task.notificationId);
                await deleteTask(task.id);
              }}
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
        </View>
      ))}
    </ScrollView>
  );
}
