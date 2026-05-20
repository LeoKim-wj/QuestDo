import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useTasks } from "@/src/context/TaskContext";

const toDateKey = (dateString: string) => new Date(dateString).toISOString().slice(0, 10);

const bonusRewards = [
  { milestone: 3, title: "Small Bonus", description: "Complete 3 tasks" },
  { milestone: 5, title: "Medium Bonus", description: "Complete 5 tasks" },
  { milestone: 10, title: "Big Bonus", description: "Complete 10 tasks" },
];

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function HomeScreen() {
  const { tasks, totalPoints } = useTasks();

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
  const completedTaskCount = tasks.filter((task) => task.completed).length;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.projectTitle}>QuestDo</Text>
      <Text style={styles.title}>Dashboard</Text>

      <Text style={styles.date}>{currentDate}</Text>
      <Text style={styles.time}>{currentTime}</Text>

      <View style={styles.statsRow}>
        <View style={[styles.streakBox, { flex: 1 }]}>
          <Text style={styles.streakTitle}>Current Streak</Text>
          <Text style={styles.streakText}>
            {completedTodayCount}/{todaysTasks.length || 0} tasks today
          </Text>
        </View>

        <View style={[styles.streakBox, { flex: 1 }]}>
          <Text style={styles.streakTitle}>Total Points</Text>
          <Text style={styles.streakText}>{totalPoints} pts</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Bonus Rewards</Text>
      <View style={styles.rewardsCard}>
        {bonusRewards.map((reward) => {
          const isUnlocked = completedTaskCount >= reward.milestone;

          return (
            <View
              key={reward.title}
              style={[
                styles.rewardRow,
                isUnlocked ? styles.rewardUnlocked : styles.rewardLocked,
              ]}
            >
              <View style={styles.rewardTextGroup}>
                <Text style={styles.rewardTitle}>{reward.title}</Text>
                <Text style={styles.rewardDescription}>
                  {reward.description}
                </Text>
              </View>
              <Text
                style={[
                  styles.rewardStatus,
                  isUnlocked ? styles.unlockedText : styles.lockedText,
                ]}
              >
                {isUnlocked ? "Unlocked" : "Locked"}
              </Text>
            </View>
          );
        })}
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
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  streakBox: {
    backgroundColor: "#8a008a",
    padding: 15,
    borderRadius: 12,
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
    marginBottom: 30,
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
  rewardsCard: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  rewardRow: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    padding: 12,
  },
  rewardUnlocked: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  },
  rewardLocked: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
  },
  rewardTextGroup: {
    flex: 1,
    marginRight: 10,
  },
  rewardTitle: {
    fontWeight: "bold",
  },
  rewardDescription: {
    color: "#555",
    marginTop: 3,
  },
  rewardStatus: {
    fontWeight: "bold",
  },
  unlockedText: {
    color: "#16a34a",
  },
  lockedText: {
    color: "#6b7280",
  },
});
