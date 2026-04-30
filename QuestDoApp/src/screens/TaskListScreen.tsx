import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTasks } from "../context/TaskContext";

export default function TaskListScreen() {
  const router = useRouter();
  const { tasks, addTask, deleteTask, toggleTaskCompleted } = useTasks();

  const [sortBy, setSortBy] = useState<"none" | "priority" | "dueDate">("none");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const priorityOrder = { low: 1, medium: 2, high: 3 };

  const sortedTasks = [...tasks].sort((a, b) => {
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

  const addSampleTask = () => {
    addTask({
      id: Date.now().toString(),
      title: "New Task",
      completed: false,
      priority: "medium",
      dueDate: new Date().toISOString(),
    });
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "#f8f8fb" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>
        Manage Tasks
      </Text>

      <Pressable
        onPress={addSampleTask}
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
            <Text>
              {sortDirection === "asc" ? "Ascending ↑" : "Descending ↓"}
            </Text>
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
            backgroundColor: "white",
            padding: 14,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "#eee",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>{task.title}</Text>

          <Text style={{ marginTop: 4 }}>
            Status: {task.completed ? "Completed" : "Incomplete"}
          </Text>

          <Text>Priority: {task.priority || "medium"}</Text>

          <Text>
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
              onPress={() => toggleTaskCompleted(task.id)}
              style={{
                flex: 1,
                backgroundColor: "#2d9cdb",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white" }}>Toggle</Text>
            </Pressable>

            <Pressable
              onPress={() => deleteTask(task.id)}
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