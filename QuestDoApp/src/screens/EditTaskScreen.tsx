import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { Calendar } from "react-native-calendars";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTasks } from "../context/TaskContext";

export default function EditTaskScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams();
  const { tasks, updateTask } = useTasks();

  const id = Array.isArray(taskId) ? taskId[0] : taskId;
  const task = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState(task?.title || "");
  const [priority, setPriority] = useState<"high" | "medium" | "low">(
    task?.priority || "medium"
  );
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? task.dueDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );

  if (!task || !id) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Task not found</Text>
      </View>
    );
  }

  const saveTask = () => {
    updateTask(id, {
      title,
      priority,
      dueDate: new Date(dueDate).toISOString(),
    });

    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "#f8f8fb" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>
        Edit Task
      </Text>

      <View
        style={{
          backgroundColor: "white",
          padding: 14,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Task Name</Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter task title"
          placeholderTextColor="gray"
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            padding: 12,
            borderRadius: 8,
            color: "black",
            backgroundColor: "white",
          }}
        />
      </View>

      <View
        style={{
          backgroundColor: "white",
          padding: 14,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Priority</Text>

        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["high", "medium", "low"] as const).map((level) => (
            <Pressable
              key={level}
              onPress={() => setPriority(level)}
              style={{
                flex: 1,
                backgroundColor: priority === level ? "#8a008a" : "#e8e8ef",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: priority === level ? "white" : "black" }}>
                {level.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View
        style={{
          backgroundColor: "white",
          padding: 14,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
          Due Date: {new Date(dueDate).toLocaleDateString("en-NZ")}
        </Text>

        <Calendar
          current={dueDate}
          onDayPress={(day) => setDueDate(day.dateString)}
          markedDates={{
            [dueDate]: {
              selected: true,
              selectedColor: "#8a008a",
            },
          }}
        />
      </View>

      <Pressable
        onPress={saveTask}
        style={{
          backgroundColor: "#8a008a",
          padding: 14,
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Save Changes</Text>
      </Pressable>
    </ScrollView>
  );
}