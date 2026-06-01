import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useTasks } from "../context/TaskContext";
import {
  getWeeklySummary,
  getMonthlySummary,
  getSemesterSummary,
} from "../utils/summaryUtils";

// Function: SummaryScreen
export default function SummaryScreen() {
  const { tasks } = useTasks();

  const [selectedSummary, setSelectedSummary] =
    useState("Weekly");

  const summaryTasks =
    selectedSummary === "Weekly"
      ? getWeeklySummary(tasks)
      : selectedSummary === "Monthly"
        ? getMonthlySummary(tasks)
        : getSemesterSummary(tasks);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Task Summary</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setSelectedSummary("Weekly")}
        >
          <Text style={styles.buttonText}>Weekly</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setSelectedSummary("Monthly")}
        >
          <Text style={styles.buttonText}>Monthly</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setSelectedSummary("Semester")}
        >
          <Text style={styles.buttonText}>Semester</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.selectedText}>
        {selectedSummary} Completed Tasks
      </Text>

      {summaryTasks.length > 0 ? (
        summaryTasks.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskText}>{task.category}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>
          No completed tasks found.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#11181C",
    marginBottom: 20,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },

  button: {
    flex: 1,
    backgroundColor: "#8a008a",
    padding: 12,
    borderRadius: 8,
  },

  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "bold",
  },

  selectedText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
  },

  taskCard: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  taskTitle: {
    fontWeight: "bold",
  },

  taskText: {
    color: "#555555",
    marginTop: 4,
  },

  emptyText: {
    color: "#555555",
    marginTop: 15,
  },
});