import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  const currentDate = new Date().toLocaleDateString("en-NZ", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("en-NZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const todaysTasks = [
    { id: "1", title: "Finish dashboard screen", status: "In Progress" },
    { id: "2", title: "Review calendar feature", status: "Incomplete" },
  ];

  const upcomingTasks = [
    { id: "3", title: "Prepare sprint update", due: "Tomorrow" },
    { id: "4", title: "Test edit button", due: "Friday" },
  ];

  const overdueTasks = [
    { id: "5", title: "Upload UML diagram", due: "Yesterday" },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.projectTitle}>QuestDo</Text>
      <Text style={styles.title}>Dashboard</Text>

      <Text style={styles.date}>{currentDate}</Text>
      <Text style={styles.time}>{currentTime}</Text>

      <View style={styles.streakBox}>
        <Text style={styles.streakTitle}>🔥 Current Streak</Text>
        <Text style={styles.streakText}>3 days</Text>
      </View>

      <Text style={styles.sectionTitle}>Today's Tasks</Text>
      {todaysTasks.map((task) => (
        <View key={task.id} style={styles.taskCard}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskStatus}>{task.status}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
      {upcomingTasks.map((task) => (
        <View key={task.id} style={styles.taskCard}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskStatus}>Due: {task.due}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Overdue Tasks</Text>
      {overdueTasks.map((task) => (
        <View key={task.id} style={styles.overdueCard}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.overdueText}>Due: {task.due}</Text>
        </View>
      ))}

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