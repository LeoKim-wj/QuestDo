import React from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTasks } from "../context/TaskContext";

export default function ProgressScreen() {
  const router = useRouter();
  const { tasks } = useTasks();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const incompleteTasks = totalTasks - completedTasks;
  const completionPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity
  onPress={() => router.back()}
  style={styles.backButton}
>
  <Text style={styles.backButtonText}>← Back</Text>
</TouchableOpacity>
      <Text style={styles.projectTitle}>QuestDo</Text>
      <Text style={styles.title}>My Progress</Text>
      <Text style={styles.subtitle}>
        Track your own task completion without comparing against others.
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Completion</Text>
        <Text style={styles.percentage}>{completionPercentage}%</Text>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${completionPercentage}%` },
            ]}
          />
        </View>

        <Text style={styles.progressText}>
          {completedTasks} of {totalTasks} tasks completed
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Total Tasks" value={totalTasks} />
        <StatCard label="Completed" value={completedTasks} />
        <StatCard label="Incomplete" value={incompleteTasks} />
      </View>

      {totalTasks === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No tasks yet</Text>
          <Text style={styles.emptyText}>
            Add a task first, then come back here to see your progress.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8fb",
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  projectTitle: {
    color: "#8a008a",
    fontSize: 28,
    fontWeight: "bold",
  },
  backButton: {
  alignSelf: "flex-start",
  backgroundColor: "#e8e8ef",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
  marginBottom: 12,
},

backButtonText: {
  fontWeight: "bold",
},
  title: {
    color: "#11181C",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  subtitle: {
    color: "#555",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 18,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderColor: "#eee",
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  summaryLabel: {
    color: "#555",
    fontSize: 14,
    fontWeight: "600",
  },
  percentage: {
    color: "#8a008a",
    fontSize: 44,
    fontWeight: "bold",
    marginTop: 6,
  },
  progressTrack: {
    backgroundColor: "#eaddea",
    borderRadius: 999,
    height: 14,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: "#8a008a",
    borderRadius: 999,
    height: "100%",
  },
  progressText: {
    color: "#555",
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: "#fff",
    borderColor: "#eee",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  statValue: {
    color: "#11181C",
    fontSize: 26,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#555",
    fontSize: 13,
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderColor: "#eee",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  emptyTitle: {
    color: "#11181C",
    fontSize: 17,
    fontWeight: "bold",
  },
  emptyText: {
    color: "#555",
    lineHeight: 21,
    marginTop: 6,
  },
});
