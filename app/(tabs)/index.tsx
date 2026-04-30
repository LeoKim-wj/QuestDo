import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useTasks } from "@/src/context/TaskContext";

const toDateKey = (dateString: string) => new Date(dateString).toISOString().slice(0, 10);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function HomeScreen() {
  const { tasks } = useTasks();

  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);

  const currentDate = now.toLocaleDateString("en-NZ", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const currentTime = now.toLocaleTimeString("en-NZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const todaysTasks = tasks.filter((task) => toDateKey(task.dueDate) === todayKey);
  const upcomingTasks = tasks
    .filter((task) => toDateKey(task.dueDate) > todayKey && !task.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);
  const overdueTasks = tasks
    .filter((task) => toDateKey(task.dueDate) < todayKey && !task.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const completedTodayCount = todaysTasks.filter((task) => task.completed).length;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.projectTitle}>QuestDo</Text>
      <Text style={styles.title}>Dashboard</Text>

      <Text style={styles.date}>{currentDate}</Text>
      <Text style={styles.time}>{currentTime}</Text>

      <View style={styles.streakBox}>
        <Text style={styles.streakTitle}>Current Streak</Text>
        <Text style={styles.streakText}>
          {completedTodayCount}/{todaysTasks.length || 0} tasks today
        </Text>
      </View>

      <Text style={styles.sectionTitle}>{"Today's Tasks"}</Text>
      {todaysTasks.length ? (
        todaysTasks.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskStatus}>
              {task.completed ? "Completed" : "Incomplete"} | {task.category}
            </Text>
          </View>
        ))
      ) : (
        <View style={styles.taskCard}>
          <Text style={styles.taskStatus}>No tasks due today.</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
      {upcomingTasks.length ? (
        upcomingTasks.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskStatus}>Due: {formatDate(task.dueDate)}</Text>
          </View>
        ))
      ) : (
        <View style={styles.taskCard}>
          <Text style={styles.taskStatus}>No upcoming tasks.</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Overdue Tasks</Text>
      {overdueTasks.length ? (
        overdueTasks.map((task) => (
          <View key={task.id} style={styles.overdueCard}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.overdueText}>Due: {formatDate(task.dueDate)}</Text>
          </View>
        ))
      ) : (
        <View style={styles.taskCard}>
          <Text style={styles.taskStatus}>No overdue tasks.</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Quick Links</Text>

      <View style={styles.linksRow}>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push("/tasks")}
        >
          <Text style={styles.linkText}>Manage Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push("/calendar")}
        >
          <Text style={styles.linkText}>Calendar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  projectTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#8a008a",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    color: "#555",
  },
  time: {
    fontSize: 16,
    color: "#8a008a",
    marginBottom: 20,
  },
  streakBox: {
    backgroundColor: "#8a008a",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  streakTitle: {
    color: "#fff",
    fontWeight: "bold",
  },
  streakText: {
    color: "#fff",
    fontSize: 20,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 10,
  },
  taskCard: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  overdueCard: {
    backgroundColor: "#ffe5e5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  taskTitle: {
    fontWeight: "bold",
  },
  taskStatus: {
    color: "#555",
    marginTop: 4,
  },
  overdueText: {
    color: "#b00020",
    marginTop: 4,
  },
  linksRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  linkButton: {
    flex: 1,
    backgroundColor: "#8a008a",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  linkText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
