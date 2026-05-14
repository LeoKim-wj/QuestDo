import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTasks } from "../context/TaskContext";
import { scheduleTaskNotification } from "../services/NotificationService";
import { TaskPriority } from "../types/task";

export default function CreateTaskScreen() {
  const router = useRouter();
  const { addCategory, addTask, categories } = useTasks();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0] || "Study");
  const [customCategory, setCustomCategory] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");

  const saveTask = async () => {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanCategory = (customCategory.trim() || category).trim();
    const parsedDate = new Date(dueDate);

    if (!cleanTitle) {
      setError("Task title is required.");
      return;
    }

    if (!cleanCategory) {
      setError("Category is required.");
      return;
    }

    if (Number.isNaN(parsedDate.getTime())) {
      setError("Due date must be a valid date.");
      return;
    }

    const task = {
      id: Date.now().toString(),
      title: cleanTitle,
      description: cleanDescription,
      category: cleanCategory,
      completed: false,
      priority,
      dueDate: parsedDate.toISOString(),
      createdDate: new Date().toISOString(),
      notificationId: null,
    };

    const notificationId = await scheduleTaskNotification(task);

    addCategory(cleanCategory);
    await addTask({
      ...task,
      notificationId,
    });

    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "#f8f8fb" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>
        Add Task
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
        <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Enter task details"
          placeholderTextColor="gray"
          multiline
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            padding: 12,
            borderRadius: 8,
            minHeight: 90,
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
        <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Category</Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
          {categories.map((item) => (
            <Pressable
              key={item}
              onPress={() => {
                setCategory(item);
                setCustomCategory("");
              }}
              style={{
                flex: 1,
                backgroundColor:
                  !customCategory && category === item ? "#8a008a" : "#e8e8ef",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: !customCategory && category === item ? "white" : "black",
                }}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={customCategory}
          onChangeText={setCustomCategory}
          placeholder="Or type a new category"
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
        <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Due Date</Text>
        <TextInput
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD"
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

      {error ? (
        <Text style={{ color: "#eb5757", fontWeight: "bold", marginBottom: 12 }}>
          {error}
        </Text>
      ) : null}

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
        <Text style={{ color: "white", fontWeight: "bold" }}>Save Task</Text>
      </Pressable>
    </ScrollView>
  );
}
