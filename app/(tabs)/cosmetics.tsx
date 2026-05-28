import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTasks } from "@/src/context/TaskContext";
import { cosmeticItems } from "@/src/rewards/cosmeticItems";
import { BunnyMascot } from "@/components/BunnyMascot";

export default function CosmeticsScreen() {
  const { totalPoints, unlockedCosmeticIds, equippedCosmeticId, equipCosmetic } =
    useTasks();

  const equippedItem = cosmeticItems.find((item) => item.id === equippedCosmeticId) ?? null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Cosmetics</Text>
      <Text style={styles.subtitle}>Dress up your bunny!</Text>

      <View style={styles.mascotCard}>
        <BunnyMascot equippedCosmetic={equippedItem} size="large" />
        <Text style={styles.equippedLabel}>
          {equippedItem ? equippedItem.name : "No cosmetic equipped"}
        </Text>
        {equippedItem && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => equipCosmetic(null)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.pointsBadge}>
        <Text style={styles.pointsText}>{totalPoints} pts earned</Text>
      </View>

      <Text style={styles.sectionTitle}>Your Collection</Text>

      <View style={styles.grid}>
        {cosmeticItems.map((item) => {
          const isUnlocked = unlockedCosmeticIds.includes(item.id);
          const isEquipped = equippedCosmeticId === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              disabled={!isUnlocked}
              activeOpacity={isUnlocked ? 0.7 : 1}
              onPress={() => equipCosmetic(isEquipped ? null : item.id)}
              style={[
                styles.cosmeticCard,
                isUnlocked ? styles.unlockedCard : styles.lockedCard,
                isEquipped && styles.equippedCard,
              ]}
            >
              <Text style={[styles.cosmeticEmoji, !isUnlocked && styles.dimmed]}>
                {isUnlocked ? item.emoji : "🔒"}
              </Text>
              <Text
                style={[styles.cosmeticName, !isUnlocked && styles.lockedText]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              {isEquipped ? (
                <Text style={styles.equippedBadge}>Equipped ✓</Text>
              ) : isUnlocked ? (
                <Text style={styles.unlockedBadge}>Tap to wear</Text>
              ) : (
                <Text style={styles.lockedBadge}>{item.pointsRequired} pts</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#8a008a",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    marginTop: 2,
  },
  mascotCard: {
    alignItems: "center",
    backgroundColor: "#faf0ff",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#e6b3e6",
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  equippedLabel: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#8a008a",
  },
  removeButton: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#8a008a",
  },
  removeButtonText: {
    color: "#8a008a",
    fontSize: 13,
    fontWeight: "600",
  },
  pointsBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#8a008a",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  pointsText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  cosmeticCard: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    padding: 14,
    width: "47%",
  },
  unlockedCard: {
    backgroundColor: "#faf0ff",
    borderColor: "#c77dc7",
  },
  lockedCard: {
    backgroundColor: "#f5f5f5",
    borderColor: "#ddd",
  },
  equippedCard: {
    backgroundColor: "#f0fdf4",
    borderColor: "#16a34a",
  },
  cosmeticEmoji: {
    fontSize: 40,
    lineHeight: 48,
    marginBottom: 6,
  },
  dimmed: {
    opacity: 0.4,
  },
  cosmeticName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  lockedText: {
    color: "#aaa",
  },
  equippedBadge: {
    fontSize: 11,
    color: "#16a34a",
    fontWeight: "600",
  },
  unlockedBadge: {
    fontSize: 11,
    color: "#8a008a",
    fontWeight: "600",
  },
  lockedBadge: {
    fontSize: 11,
    color: "#aaa",
  },
});
