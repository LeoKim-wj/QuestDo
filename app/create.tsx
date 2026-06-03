import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useTasks } from "../src/context/TaskContext";
import { scheduleTaskNotification } from "../src/services/NotificationService";
import { breakdownGoal, DetailLevel } from "../src/services/geminiService";
import { RecurrenceFrequency, Subtask, Task, TaskPriority } from "../src/types/task";
import { estimateTaskDuration, formatDuration } from "../src/utils/estimateDuration";

export default function CreateTaskScreen() {
  const router = useRouter();
  const { addCategory, addTask, categories } = useTasks();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0] || "Study");
  const [customCategory, setCustomCategory] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [recurrence, setRecurrence] = useState<RecurrenceFrequency>("none");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [reminderMode, setReminderMode] = useState<"time" | "offset">("time");
  const [reminderHour, setReminderHour] = useState(9);
  const [reminderMinute, setReminderMinute] = useState(0);
  const [offsetHours, setOffsetHours] = useState(1);
  const [offsetMinutes, setOffsetMinutes] = useState(0);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("detailed");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [error, setError] = useState("");
  const [pendingTask, setPendingTask] = useState<Task | null>(null);

  const estimate = useMemo(() => {
    if (!title.trim()) {
      return { minutes: 0, matchedKeywords: [] };
    }

    return estimateTaskDuration({
      title,
      description,
      category: customCategory.trim() || category,
      priority,
    });
  }, [title, description, customCategory, category, priority]);

  const handleBreakdown = async () => {
    if (!title.trim()) {
      setAiError("Enter a goal title first.");
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
      setAiError(err?.message ?? "Failed to get suggestions. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const removeSubtask = (subtaskId: string) => {
    setSubtasks((current) => current.filter((subtask) => subtask.id !== subtaskId));
  };

  const saveTask = async () => {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanCategory = (customCategory.trim() || category).trim();
    const parsedDate = new Date(dueDate);

    setError("");
    setPendingTask(null);

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

    const task: Task = {
      id: Date.now().toString(),
      title: cleanTitle,
      description: cleanDescription,
      category: cleanCategory,
      completed: false,
      priority,
      dueDate: parsedDate.toISOString(),
      createdDate: new Date().toISOString(),
      reminderTime,
      estimatedMinutes: estimate.minutes,
      notificationId: null,
      recurrence: recurrence !== "none" ? recurrence : undefined,
      subtasks: subtasks.map((subtask) => ({
        id: subtask.id,
        title: subtask.title,
        completed: subtask.completed,
      })),
    };

    const notificationId = await scheduleTaskNotification(task);
    const taskWithNotification = { ...task, notificationId };
    const result = await addTask(taskWithNotification);

    if (!result.success && result.reason === "duplicate") {
      setPendingTask(taskWithNotification);
      return;
    }

    addCategory(cleanCategory);
    router.back();
  };

  const handleCreateAnyway = async () => {
    if (!pendingTask) {
      return;
    }

    const taskToSave = pendingTask;
    setPendingTask(null);
    await addTask(taskToSave, true);
    addCategory(taskToSave.category);
    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "#f8f8fb" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>
        Add Goal
      </Text>

      <View style={card}>
        <Text style={label}>Goal Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter your goal"
          placeholderTextColor="gray"
          style={input}
        />
      </View>

      <View style={card}>
        <Text style={label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your goal in more detail"
          placeholderTextColor="gray"
          multiline
          style={[input, { minHeight: 90 }]}
        />
      </View>

      <View style={[card, { borderWidth: 1.5, borderColor: "#8a008a" }]}>
        <Text style={label}>Break Down with AI</Text>
        <Text style={{ color: "#555", fontSize: 13, marginBottom: 12 }}>
          Choose how detailed you want the steps to be, then tap the button.
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
              Suggested Steps ({subtasks.length})
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
                <Text style={{ flex: 1, color: "#333" }}>{subtask.title}</Text>
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
                backgroundColor: !customCategory && category === item ? "#8a008a" : "#e8e8ef",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: !customCategory && category === item ? "white" : "black" }}>
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
        <Text style={label}>Reminder</Text>
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
                <Pressable onPress={() => setReminderHour((hour) => (hour + 1) % 24)} style={spinnerBtn}>
                  <Text style={{ fontSize: 18 }}>+</Text>
                </Pressable>
                <Text style={{ fontSize: 28, fontWeight: "bold", minWidth: 44, textAlign: "center" }}>
                  {String(reminderHour).padStart(2, "0")}
                </Text>
                <Pressable onPress={() => setReminderHour((hour) => (hour - 1 + 24) % 24)} style={spinnerBtn}>
                  <Text style={{ fontSize: 18 }}>-</Text>
                </Pressable>
              </View>
              <Text style={{ fontSize: 28, fontWeight: "bold" }}>:</Text>
              <View style={{ alignItems: "center", gap: 6 }}>
                <Pressable onPress={() => setReminderMinute((minute) => (minute + 5) % 60)} style={spinnerBtn}>
                  <Text style={{ fontSize: 18 }}>+</Text>
                </Pressable>
                <Text style={{ fontSize: 28, fontWeight: "bold", minWidth: 44, textAlign: "center" }}>
                  {String(reminderMinute).padStart(2, "0")}
                </Text>
                <Pressable onPress={() => setReminderMinute((minute) => (minute - 5 + 60) % 60)} style={spinnerBtn}>
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
                <Pressable onPress={() => setOffsetHours((hours) => Math.min(hours + 1, 72))} style={spinnerBtn}>
                  <Text style={{ fontSize: 18 }}>+</Text>
                </Pressable>
                <Text style={{ fontSize: 28, fontWeight: "bold", minWidth: 44, textAlign: "center" }}>{offsetHours}</Text>
                <Pressable onPress={() => setOffsetHours((hours) => Math.max(hours - 1, 0))} style={spinnerBtn}>
                  <Text style={{ fontSize: 18 }}>-</Text>
                </Pressable>
                <Text style={{ color: "#555" }}>hrs</Text>
              </View>
              <View style={{ alignItems: "center", gap: 6 }}>
                <Pressable onPress={() => setOffsetMinutes((minutes) => (minutes + 5) % 60)} style={spinnerBtn}>
                  <Text style={{ fontSize: 18 }}>+</Text>
                </Pressable>
                <Text style={{ fontSize: 28, fontWeight: "bold", minWidth: 44, textAlign: "center" }}>
                  {String(offsetMinutes).padStart(2, "0")}
                </Text>
                <Pressable onPress={() => setOffsetMinutes((minutes) => (minutes - 5 + 60) % 60)} style={spinnerBtn}>
                  <Text style={{ fontSize: 18 }}>-</Text>
                </Pressable>
                <Text style={{ color: "#555" }}>min</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={card}>
        <Text style={label}>Due Date</Text>
        <TextInput
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="gray"
          style={input}
        />
      </View>

      <View
        style={{
          backgroundColor: "#f3e8ff",
          padding: 14,
          borderRadius: 12,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: "#e0c3fc",
        }}
      >
        <Text style={{ fontWeight: "bold", marginBottom: 4, color: "#5b005b" }}>
          Estimated time to complete
        </Text>
        {title.trim() ? (
          <>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#8a008a" }}>
              {formatDuration(estimate.minutes)}
            </Text>
            <Text style={{ color: "#7a5c7a", marginTop: 4, fontSize: 12 }}>
              {estimate.matchedKeywords.length > 0
                ? `Based on: ${estimate.matchedKeywords.slice(0, 4).join(", ")}`
                : "General estimate - add details for a sharper guess"}
            </Text>
          </>
        ) : (
          <Text style={{ color: "#7a5c7a", marginTop: 4, fontSize: 13 }}>
            Enter a task name to see an estimate
          </Text>
        )}
      </View>

      {error ? (
        <Text style={{ color: "#eb5757", fontWeight: "bold", marginBottom: 12 }}>{error}</Text>
      ) : null}

      {pendingTask ? (
        <View
          style={{
            backgroundColor: "#fef2f2",
            borderColor: "#fca5a5",
            borderWidth: 1,
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#dc2626", fontWeight: "bold", fontSize: 14 }}>
            Duplicate Task
          </Text>
          <Text style={{ color: "#555", marginTop: 6 }}>
            A task named {pendingTask.title} already exists.
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <Pressable
              onPress={() => setPendingTask(null)}
              style={{
                flex: 1,
                backgroundColor: "#e8e8ef",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "bold", color: "#333" }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleCreateAnyway}
              style={{
                flex: 1,
                backgroundColor: "#8a008a",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "bold", color: "white" }}>Create Anyway</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <Pressable
        onPress={saveTask}
        style={{ backgroundColor: "#8a008a", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 30 }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Save Goal</Text>
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
