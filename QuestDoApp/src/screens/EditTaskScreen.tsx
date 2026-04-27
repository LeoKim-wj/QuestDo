import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTasks } from "../context/TaskContext";

export default function EditTaskScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams();

  const { tasks, updateTask } = useTasks();

  const id = Array.isArray(taskId) ? taskId[0] : taskId;

  const task = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState(task?.title || "");

  if (!task || !id) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Task not found</Text>
      </View>
    );
  }

  return (
  <View style={{ flex: 1, padding: 20, backgroundColor: "white" }}>
    <Text style={{ fontSize: 24, marginBottom: 20, color: "black" }}>
      Edit Task
    </Text>

    <TextInput
      value={title}
      onChangeText={setTitle}
      placeholder="Edit task title"
      placeholderTextColor="gray"
      style={{
        borderWidth: 1,
        borderColor: "gray",
        padding: 10,
        marginBottom: 20,
        color: "black",
        backgroundColor: "white",
      }}
    />

    <Button
      title="Save"
      onPress={() => {
        updateTask(id, { title });
        router.back();
      }}
    />
  </View>
);
}