import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTasks } from "@/src/context/TaskContext";
import { accessoryItems, furColorItems } from "@/src/rewards/cosmeticItems";
import { CosmeticItem } from "@/src/types/cosmetics";
import { BunnyMascot } from "@/components/BunnyMascot";

export default function CosmeticsScreen() {
  const { totalPoints, unlockedCosmeticIds, equippedCosmetics, equipCosmetic } = useTasks();

  const equippedAccessory = accessoryItems.find((item) => item.id === equippedCosmetics.accessory) ?? null;
  const equippedFurItem = furColorItems.find((item) => item.id === equippedCosmetics.furColor) ?? null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Cosmetics</Text>
      <Text style={styles.subtitle}>Dress up your bunny!</Text>

      <View style={styles.mascotCard}>
        <BunnyMascot
          equippedAccessory={equippedAccessory}
          furColor={equippedFurItem?.furColor}
          size="large"
        />
        <View style={styles.equippedInfo}>
          {equippedAccessory && (
            <Text style={styles.equippedLabel}>
              {equippedAccessory.emoji} {equippedAccessory.name}
            </Text>
          )}
          {equippedFurItem && (
            <Text style={styles.equippedLabel}>
              {equippedFurItem.emoji} {equippedFurItem.name} fur
            </Text>
          )}
          {!equippedAccessory && !equippedFurItem && (
            <Text style={styles.equippedNone}>Plain bunny — unlock and equip cosmetics below!</Text>
          )}
        </View>
      </View>

      <View style={styles.pointsBadge}>
        <Text style={styles.pointsText}>{totalPoints} pts earned</Text>
      </View>

      {/* Accessories */}
      <Text style={styles.sectionTitle}>Accessories</Text>
      <View style={styles.grid}>
        {accessoryItems.map((item) => (
          <CosmeticCard
            key={item.id}
            item={item}
            isUnlocked={unlockedCosmeticIds.includes(item.id)}
            isEquipped={equippedCosmetics.accessory === item.id}
            onPress={() =>
              equipCosmetic("accessory", equippedCosmetics.accessory === item.id ? null : item.id)
            }
          />
        ))}
      </View>

      {/* Fur Colours */}
      <Text style={styles.sectionTitle}>Fur Colours</Text>
      <View style={styles.grid}>
        {furColorItems.map((item) => (
          <CosmeticCard
            key={item.id}
            item={item}
            isUnlocked={unlockedCosmeticIds.includes(item.id)}
            isEquipped={equippedCosmetics.furColor === item.id}
            onPress={() =>
              equipCosmetic("furColor", equippedCosmetics.furColor === item.id ? null : item.id)
            }
          />
        ))}
      </View>
    </ScrollView>
  );
}

function CosmeticCard({
  item,
  isUnlocked,
  isEquipped,
  onPress,
}: {
  item: CosmeticItem;
  isUnlocked: boolean;
  isEquipped: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      disabled={!isUnlocked}
      activeOpacity={isUnlocked ? 0.7 : 1}
      onPress={onPress}
      style={[
        styles.cosmeticCard,
        isUnlocked ? styles.unlockedCard : styles.lockedCard,
        isEquipped && styles.equippedCard,
      ]}
    >
      {item.type === "furColor" ? (
        <View
          style={[
            styles.furPreviewCircle,
            { backgroundColor: isUnlocked ? (item.furColor ?? "#eee") : "#ddd" },
          ]}
        >
          <Text style={styles.furPreviewBunny}>🐰</Text>
        </View>
      ) : (
        <Text style={[styles.cosmeticEmoji, !isUnlocked && styles.dimmed]}>
          {isUnlocked ? item.emoji : "🔒"}
        </Text>
      )}
      <Text style={[styles.cosmeticName, !isUnlocked && styles.lockedText]} numberOfLines={1}>
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
    gap: 12,
  },
  equippedInfo: {
    alignItems: "center",
    gap: 4,
  },
  equippedLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8a008a",
  },
  equippedNone: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
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
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
  },
  cosmeticCard: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    padding: 14,
    width: "47%",
    gap: 4,
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
  },
  dimmed: {
    opacity: 0.4,
  },
  furPreviewCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  furPreviewBunny: {
    fontSize: 30,
    lineHeight: 36,
  },
  cosmeticName: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
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
