// Component: StreakCounter
// Purpose: Display the student's current daily streak

import React from "react";
import { StyleSheet, Text, View } from "react-native";

// Type: StreakCounterProps
// Purpose: Defines the data this component receives
type StreakCounterProps = {
  streak: number;
};

// Function: StreakCounter
// Purpose: Shows the streak count on the screen
export default function StreakCounter({ streak }: StreakCounterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Current Streak</Text>

      <Text style={styles.streakValue}>{streak} days</Text>

      <Text style={styles.description}>
        Complete tasks daily to keep your streak going.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eeeeee",
    padding: 18,
    marginBottom: 16,
  },
  title: {
    color: "#555555",
    fontSize: 14,
    fontWeight: "600",
  },
  streakValue: {
    color: "#8a008a",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 8,
  },
  description: {
    color: "#555555",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
});