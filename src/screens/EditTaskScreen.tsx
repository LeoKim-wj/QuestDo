import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTasks } from "../context/TaskContext";
import { cancelTaskNotification, scheduleTaskNotification } from "../services/NotificationService";
import { breakdownGoal, DetailLevel } from "../services/geminiService";
import { RecurrenceFrequency, Subtask, TaskPriority } from "../types/task";

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
  const [recurrence, setRecurrence] = useState<RecurrenceFrequency>(task?.recurrence ?? "none");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? task.dueDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );

  const existingTime = task?.reminderTime ?? "09:00";
  const isOffset = existingTime.startsWith("offset:");
  const [reminderMode, setReminderMode] = useState<"time" | "offset">(isOffset ? "offset" : "time");
  const [reminderHour, setReminderHour] = useState(isOffset ? 9 : Number(existingTime.split(":")[0]) || 9);
  const [reminderMinute, setReminderMinute] = useState(isOffset ? 0 : Number(existingTime.split(":")[1]) || 0);
  const existingOffsetMins = isOffset ? Number(existingTime.slice(7)) || 60 : 60;
  const [offsetHours, setOffsetHours] = useState(Math.floor(existingOffsetMins / 60));
  const [offsetMinutes, setOffsetMinutes] = useState(existingOffsetMins % 60);

  const [subtasks, setSubtasks] = useState<Subtask[]>(
    task?.subtasks?.map((subtask) => ({ ...subtask })) ?? []
  );
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("detailed");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [error, setError] = useState("");

  if (!task || !id) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Task not found</Text>
      </View>
    );
  }

  const handleBreakdown = async () => {
    if (!title.trim()) {
      setAiError("Enter a task title first.");
      return;
    }

    setAiLoading(true);
    setAiError("");

    try {
      const suggestions = await breakdownGoal(title.trim(), description.trim(), detailLevel);
      setSubtasks(
        suggestions.map((suggestion, index) => ({
          id: `${Date.now()}-${index}`,
          title: suggestion,
          completed: false,
        }))
      );
    } catch (err: any) {
      setAiError(err?.message ?? "Failed to generate subtasks. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const updateSubtaskTitle = (subtaskId: string, nextTitle: string) => {
    setSubtasks((current) =>
      current.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, title: nextTitle } : subtask
      )
    );
  };

  const removeSubtask = (subtaskId: string) => {
    setSubtasks((current) => current.filter((subtask) => subtask.id !== subtaskId));
  };

  const saveTask = async () => {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanCategory = (customCategory.trim() || category).trim();
    const parsedDate = new Date(dueDate);
    const cleanSubtasks = subtasks
      .map((subtask) => ({
        id: subtask.id,
        title: subtask.title.trim(),
        completed: subtask.completed,
      }))
      .filter((subtask) => subtask.title);

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
      recurrence: recurrence !== "none" ? recurrence : undefined,
      dueDate: parsedDate.toISOString(),
      reminderTime,
      notificationId: null,
      subtasks: cleanSubtasks,
    };
    const notificationId = await scheduleTaskNotification(updatedTask);

    addCategory(cleanCategory);
    await updateTask(id, {
      title: cleanTitle,
      description: cleanDescription,
      category: cleanCategory,
      priority,
      recurrence: recurrence !== "none" ? recurrence : undefined,
      dueDate: parsedDate.toISOString(),
      reminderTime,
      notificationId,
      subtasks: cleanSubtasks,
    });

    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "#f8f8fb" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>
        Edit Task
      </Text>

      <View style={card}>
        <Text style={label}>Task Name</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter task title"
          placeholderTextColor="gray"
          style={input}
        />
      </View>

      <View style={card}>
        <Text style={label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Enter task details"
          placeholderTextColor="gray"
          multiline
          style={[input, { minHeight: 90 }]}
        />
      </View>

      <View style={[card, { borderWidth: 1.5, borderColor: "#8a008a" }]}>
        <Text style={label}>Break Down with AI</Text>
        <Text style={{ color: "#555", fontSize: 13, marginBottom: 12 }}>
          Keep existing steps, edit them below, or generate a fresh breakdown.
        </Text>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
          {(["simple", "detailed", "step-by-step"] as DetailLevel[]).map((level) => (
            <Pressable
              key={level}
              onPress={() => setDetailLevel(level)}
              style={{
                flex: 1,
                backgroundColor: detailLevel === level ? "#8a008a" : "#e8e8ef",
                padding: 8,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: detailLevel === level ? "white" : "black", fontSize: 12, fontWeight: "600" }}>
                {level === "simple" ? "Simple" : level === "detailed" ? "Detailed" : "Step-by-Step"}
              </Text>
              <Text style={{ color: detailLevel === level ? "#eee" : "#888", fontSize: 11 }}>
                {level === "simple" ? "3-4 steps" : level === "detailed" ? "5-6 steps" : "7-10 steps"}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={handleBreakdown}
          disabled={aiLoading}
          style={{
            backgroundColor: aiLoading ? "#c080c0" : "#8a008a",
            padding: 12,
            borderRadius: 8,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {aiLoading ? <ActivityIndicator color="white" size="small" /> : null}
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {aiLoading ? "Breaking down..." : "Break Down with AI"}
          </Text>
        </Pressable>

        {aiError ? (
          <Text style={{ color: "#eb5757", marginTop: 8, fontSize: 13 }}>{aiError}</Text>
        ) : null}

        {subtasks.length > 0 ? (
          <View style={{ marginTop: 14 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
              Steps ({subtasks.length})
            </Text>
            {subtasks.map((subtask, index) => (
              <View
                key={subtask.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#f8f0f8",
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 6,
                  gap: 8,
                }}
              >
                <Text style={{ color: "#8a008a", fontWeight: "bold", width: 20 }}>
                  {index + 1}.
                </Text>
                <TextInput
                  value={subtask.title}
                  onChangeText={(nextTitle) => updateSubtaskTitle(subtask.id, nextTitle)}
                  placeholder="Subtask"
                  placeholderTextColor="gray"
                  style={{ ...input, flex: 1, padding: 8 }}
                />
                <Pressable onPress={() => removeSubtask(subtask.id)}>
                  <Text style={{ color: "#eb5757", fontWeight: "bold", fontSize: 13 }}>Remove</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={card}>
        <Text style={label}>Category</Text>
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
          style={input}
        />
      </View>

      <View style={card}>
        <Text style={label}>Priority</Text>
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

      <View style={card}>
        <Text style={label}>Repeat Task</Text>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {(["none", "daily", "weekly", "monthly"] as const).map((freq) => (
            <Pressable
              key={freq}
              onPress={() => setRecurrence(freq)}
              style={{
                flex: 1,
                backgroundColor: recurrence === freq ? "#8a008a" : "#e8e8ef",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: recurrence === freq ? "white" : "black", fontSize: 12, fontWeight: "500" }}>
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={card}>
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
                <Pressable onPress={() => setReminderHour((h) => (h + 1) % 24)} style={spinnerBtn}>
                  <Text style={{ fontSize: 18 }}>+</Text>
                </Pressable>
                <Text style={{ fontSize: 28, fontWeight: "bold", minWidth: 44, textAlign: "center" }}>
                  {String(reminderHour).padStart(2, "0")}
                </Text>
                <Pressable onPress={() => setReminderHour((h) => (h - 1 + 24) % 24)} style={spinnerBtn}>
                  <Text style={{ fontSize: 18 }}>-</Text>
                </Pressable>
              </View>
              <Text style={{ fontSize: 28, fontWeight: "bold" }}>:</Text>
              <View style={{ alignItems: "center", gap: 6 }}>
                <Pressable onPress={() => setReminderMinute((m) => (m + 5) % 60)} style={spinnerBtn}>
                  <Text style={{ fontSize: 18 }}>+</Text>
                </Pressable>
                <Text style={{ fontSize: 28, fontWeight: "bold", minWidth: 44, textAlign: "center" }}>
                  {String(reminderMinute).padStart(2, "0")}
                </Text>
                <Pressable onPress={() => setReminderMinute((m) => (m - 5 + 60) % 60)} style={spinnerBtn}>
                  <Text style={{ fontSize: 18 }}>-</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#555", marginBottom: 10 }}>How long before the deadline</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ alignItems: "center", gap: 6 }}>
                <Pressable onPress={() => setOffsetHours((h) => Math.min(h + 1, 72))} style={spinnerBtn}>
                  <Text style={{ fontSize: 18 }}>+</Text>
                </Pressable>
                <Text style={{ fontSize: 28, fontWeight: "bold", minWidth: 44, textAlign: "center" }}>{offsetHours}</Text>
                <Pressable onPress={() => setOffsetHours((h) => Math.max(h - 1, 0))} style={spinnerBtn}>
                  <Text style={{ fontSize: 18 }}>-</Text>
                </Pressable>
                <Text style={{ color: "#555" }}>hrs</Text>
              </View>
              <View style={{ alignItems: "center", gap: 6 }}>
                <Pressable onPress={() => setOffsetMinutes((m) => (m + 5) % 60)} style={spinnerBtn}>
                  <Text style={{ fontSize: 18 }}>+</Text>
                </Pressable>
                <Text style={{ fontSize: 28, fontWeight: "bold", minWidth: 44, textAlign: "center" }}>
                  {String(offsetMinutes).padStart(2, "0")}
                </Text>
                <Pressable onPress={() => setOffsetMinutes((m) => (m - 5 + 60) % 60)} style={spinnerBtn}>
                  <Text style={{ fontSize: 18 }}>-</Text>
                </Pressable>
                <Text style={{ color: "#555" }}>min</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={card}>
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

const card = {
  backgroundColor: "white",
  padding: 14,
  borderRadius: 12,
  marginBottom: 16,
};

const label = {
  fontWeight: "bold" as const,
  marginBottom: 8,
};

const input = {
  borderWidth: 1,
  borderColor: "#ddd",
  padding: 12,
  borderRadius: 8,
  color: "black",
  backgroundColor: "white",
};

const spinnerBtn = {
  backgroundColor: "#e8e8ef",
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 8,
};
