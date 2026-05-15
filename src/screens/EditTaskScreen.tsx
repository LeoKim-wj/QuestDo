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
  const isOffset = existingTime.startsWith("offset:");
  const [reminderMode, setReminderMode] = useState<"time" | "offset">(isOffset ? "offset" : "time");
  const [reminderHour, setReminderHour] = useState(isOffset ? 9 : Number(existingTime.split(":")[0]));
  const [reminderMinute, setReminderMinute] = useState(isOffset ? 0 : Number(existingTime.split(":")[1]));
  const existingOffsetMins = isOffset ? Number(existingTime.slice(7)) : 60;
  const [offsetHours, setOffsetHours] = useState(Math.floor(existingOffsetMins / 60));
  const [offsetMinutes, setOffsetMinutes] = useState(existingOffsetMins % 60);
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

    const reminderTime =
      reminderMode === "offset"
        ? `offset:${offsetHours * 60 + offsetMinutes}`
        : `${String(reminderHour).padStart(2, "0")}:${String(reminderMinute).padStart(2, "0")}`;

    await cancelTaskNotification(task.notificationId);

    const updatedTask = {
      ...task,
      title: cleanTitle,
      description: cleanDescription,
      category: cleanCategory,
      priority,
      dueDate: parsedDate.toISOString(),
      reminderTime,
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
      reminderTime,
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
        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Reminder</Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
          {(["time", "offset"] as const).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setReminderMode(mode)}
              style={{
                flex: 1,
                backgroundColor: reminderMode === mode ? "#8a008a" : "#e8e8ef",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: reminderMode === mode ? "white" : "black" }}>
                {mode === "time" ? "Specific Time" : "Before Deadline"}
              </Text>
            </Pressable>
          ))}
        </View>

        {reminderMode === "time" ? (
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#555", marginBottom: 10 }}>Time on the day before the deadline</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ alignItems: "center", gap: 6 }}>
                <Pressable onPress={() => setReminderHour((h) => (h + 1) % 24)} style={{ backgroundColor: "#e8e8ef", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                  <Text style={{ fontSize: 18 }}>+</Text>
                </Pressable>
                <Text style={{ fontSize: 28, fontWeight: "bold", minWidth: 44, textAlign: "center" }}>
                  {String(reminderHour).padStart(2, "0")}
                </Text>
                <Pressable onPress={() => setReminderHour((h) => (h - 1 + 24) % 24)} style={{ backgroundColor: "#e8e8ef", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                  <Text style={{ fontSize: 18 }}>−</Text>
                </Pressable>
              </View>
              <Text style={{ fontSize: 28, fontWeight: "bold" }}>:</Text>
              <View style={{ alignItems: "center", gap: 6 }}>
                <Pressable onPress={() => setReminderMinute((m) => (m + 5) % 60)} style={{ backgroundColor: "#e8e8ef", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                  <Text style={{ fontSize: 18 }}>+</Text>
                </Pressable>
                <Text style={{ fontSize: 28, fontWeight: "bold", minWidth: 44, textAlign: "center" }}>
                  {String(reminderMinute).padStart(2, "0")}
                </Text>
                <Pressable onPress={() => setReminderMinute((m) => (m - 5 + 60) % 60)} style={{ backgroundColor: "#e8e8ef", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                  <Text style={{ fontSize: 18 }}>−</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#555", marginBottom: 10 }}>How long before the deadline</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ alignItems: "center", gap: 6 }}>
                <Pressable onPress={() => setOffsetHours((h) => Math.min(h + 1, 72))} style={{ backgroundColor: "#e8e8ef", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                  <Text style={{ fontSize: 18 }}>+</Text>
                </Pressable>
                <Text style={{ fontSize: 28, fontWeight: "bold", minWidth: 44, textAlign: "center" }}>{offsetHours}</Text>
                <Pressable onPress={() => setOffsetHours((h) => Math.max(h - 1, 0))} style={{ backgroundColor: "#e8e8ef", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                  <Text style={{ fontSize: 18 }}>−</Text>
                </Pressable>
                <Text style={{ color: "#555" }}>hrs</Text>
              </View>
              <View style={{ alignItems: "center", gap: 6 }}>
                <Pressable onPress={() => setOffsetMinutes((m) => (m + 5) % 60)} style={{ backgroundColor: "#e8e8ef", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                  <Text style={{ fontSize: 18 }}>+</Text>
                </Pressable>
                <Text style={{ fontSize: 28, fontWeight: "bold", minWidth: 44, textAlign: "center" }}>
                  {String(offsetMinutes).padStart(2, "0")}
                </Text>
                <Pressable onPress={() => setOffsetMinutes((m) => (m - 5 + 60) % 60)} style={{ backgroundColor: "#e8e8ef", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                  <Text style={{ fontSize: 18 }}>−</Text>
                </Pressable>
                <Text style={{ color: "#555" }}>min</Text>
              </View>
            </View>
          </View>
        )}
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
