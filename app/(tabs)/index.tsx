import { calculateStreak } from "@/src/utils/streakUtils";
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useTasks } from "@/src/context/TaskContext";
import { bonusRewards } from "@/src/rewards/bonusRewards";
import { cosmeticItems } from "@/src/rewards/cosmeticItems";
import { BunnyMascot } from "@/components/BunnyMascot";

const toDateKey = (dateString: string) => new Date(dateString).toISOString().slice(0, 10);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function HomeScreen() {
  const { tasks, totalPoints, redeemedRewardIds, redeemBonusReward, equippedCosmeticId } =
    useTasks();

  const equippedCosmetic = cosmeticItems.find((item) => item.id === equippedCosmeticId) ?? null;

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

    
      <TouchableOpacity
        style={styles.mascotCard}
        onPress={() => router.push("/(tabs)/cosmetics")}
        activeOpacity={0.85}
      >
        <BunnyMascot equippedCosmetic={equippedCosmetic} size="small" />
        <View style={styles.mascotInfo}>
          <Text style={styles.mascotName}>Your Bunny</Text>
          <Text style={styles.mascotHint}>
            {equippedCosmetic ? `Wearing: ${equippedCosmetic.emoji} ${equippedCosmetic.name}` : "Tap to customise →"}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        <View style={[styles.streakBox, { flex: 1 }]}>
          <Text style={styles.streakTitle}>Current Streak</Text>
          <Text style={styles.streakText}>
            {calculateStreak(tasks)} day streak
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
          const isRedeemed = redeemedRewardIds.includes(reward.id);

          return (
            <View
              key={reward.title}
              style={[
                styles.rewardRow,
                isRedeemed || isUnlocked
                  ? styles.rewardUnlocked
                  : styles.rewardLocked,
              ]}
            >
              <View style={styles.rewardTextGroup}>
                <Text style={styles.rewardTitle}>{reward.title}</Text>
                <Text style={styles.rewardDescription}>
                  {reward.description} for +{reward.points} pts
                </Text>
              </View>
              <TouchableOpacity
                disabled={!isUnlocked || isRedeemed}
                onPress={() => redeemBonusReward(reward.id)}
                style={[
                  styles.redeemButton,
                  isRedeemed
                    ? styles.redeemedButton
                    : isUnlocked
                      ? styles.unlockedButton
                      : styles.lockedButton,
                ]}
              >
                <Text
                  style={[
                    styles.rewardStatus,
                    isRedeemed
                      ? styles.redeemedText
                      : isUnlocked
                        ? styles.unlockedButtonText
                        : styles.lockedText,
                  ]}
                >
                  {isRedeemed
                    ? "Redeemed"
                    : isUnlocked
                      ? "Redeem"
                      : "Locked"}
                </Text>
              </TouchableOpacity>
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
  mascotCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#faf0ff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e6b3e6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 14,
  },
  mascotInfo: {
    flex: 1,
  },
  mascotName: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#8a008a",
  },
  mascotHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
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
  redeemButton: {
    alignItems: "center",
    borderRadius: 8,
    minWidth: 86,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  unlockedButton: {
    backgroundColor: "#16a34a",
  },
  lockedButton: {
    backgroundColor: "#e5e7eb",
  },
  redeemedButton: {
    backgroundColor: "#d1fae5",
    borderColor: "#16a34a",
    borderWidth: 1,
  },
  unlockedButtonText: {
    color: "#fff",
  },
  redeemedText: {
    color: "#16a34a",
  },
  lockedText: {
    color: "#6b7280",
  },
});
