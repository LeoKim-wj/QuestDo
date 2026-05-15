import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { Calendar } from "react-native-calendars";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTasks } from "../context/TaskContext";
import { cancelTaskNotification, scheduleTaskNotification } from "../services/NotificationService";
import { TaskPriority } from "../types/task";

export default function EditTaskScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams();
  const { addCategory, categories, tasks, updateTask } = useTasks();

  const id = Array.isArray(taskId) ? taskId[0] : taskId;
  const task = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [category, setCategory] = useState(task?.category || categories[0] || "Study");
  const [customCategory, setCustomCategory] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || "medium");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? task.dueDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const existingTime = task?.reminderTime ?? "09:00";
  const [reminderHour, setReminderHour] = useState(Number(existingTime.split(":")[0]));
  const [reminderMinute, setReminderMinute] = useState(Number(existingTime.split(":")[1]));
  const [error, setError] = useState("");

  if (!task || !id) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Task not found</Text>
      </View>
    );
  }

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

    await cancelTaskNotification(task.notificationId);

    const updatedTask = {
      ...task,
      title: cleanTitle,
      description: cleanDescription,
      category: cleanCategory,
      priority,
      dueDate: parsedDate.toISOString(),
      notificationId: null,
    };
    const notificationId = await scheduleTaskNotification(updatedTask);

    addCategory(cleanCategory);
    await updateTask(id, {
      title: cleanTitle,
      description: cleanDescription,
      category: cleanCategory,
      priority,
      dueDate: parsedDate.toISOString(),
      notificationId,
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

        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {categories.map((item) => (
            <Pressable
              key={item}
              onPress={() => {
                setCategory(item);
                setCustomCategory("");
              }}
              style={{
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
        <Text style={{ color: "white", fontWeight: "bold" }}>Save Changes</Text>
      </Pressable>
    </ScrollView>
  );
}
