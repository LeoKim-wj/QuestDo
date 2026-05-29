import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTasks } from "@/src/context/TaskContext";
import { accessoryItems, backgroundItems, furColorItems } from "@/src/rewards/cosmeticItems";
import { CosmeticItem } from "@/src/types/cosmetics";
import { BunnyMascot } from "@/components/BunnyMascot";
import { Image } from "expo-image";

const bunnySource = require("@/assets/images/bunny-mascot.png");

const DEFAULT_CARD_BG = "#faf0ff";
const DEFAULT_CARD_BORDER = "#e6b3e6";

export default function CosmeticsScreen() {
  const { totalPoints, unlockedCosmeticIds, equippedCosmetics, equipCosmetic } = useTasks();

  const equippedAccessory = accessoryItems.find((item) => item.id === equippedCosmetics.accessory) ?? null;
  const equippedFurItem = furColorItems.find((item) => item.id === equippedCosmetics.furColor) ?? null;
  const equippedBgItem = backgroundItems.find((item) => item.id === equippedCosmetics.background) ?? null;

  const cardBg = equippedBgItem?.bgColor ?? DEFAULT_CARD_BG;
  const isDarkBg = equippedBgItem?.bgColor ? isColorDark(equippedBgItem.bgColor) : false;
  const labelColor = isDarkBg ? "#fff" : "#8a008a";
  const noneColor = isDarkBg ? "rgba(255,255,255,0.6)" : "#999";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Cosmetics</Text>
      <Text style={styles.subtitle}>Dress up your bunny!</Text>

      <View style={[styles.mascotCard, { backgroundColor: cardBg, borderColor: isDarkBg ? "transparent" : DEFAULT_CARD_BORDER }]}>
        <BunnyMascot
          equippedAccessory={equippedAccessory}
          furColor={equippedFurItem?.furColor}
          size="large"
        />
        <View style={styles.equippedInfo}>
          {equippedAccessory && (
            <Text style={[styles.equippedLabel, { color: labelColor }]}>
              {equippedAccessory.emoji} {equippedAccessory.name}
            </Text>
          )}
          {equippedFurItem && (
            <Text style={[styles.equippedLabel, { color: labelColor }]}>
              {equippedFurItem.emoji} {equippedFurItem.name} fur
            </Text>
          )}
          {equippedBgItem && (
            <Text style={[styles.equippedLabel, { color: labelColor }]}>
              {equippedBgItem.emoji} {equippedBgItem.name}
            </Text>
          )}
          {!equippedAccessory && !equippedFurItem && !equippedBgItem && (
            <Text style={[styles.equippedNone, { color: noneColor }]}>
              Plain bunny — unlock and equip cosmetics below!
            </Text>
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

      {/* Backgrounds */}
      <Text style={styles.sectionTitle}>Backgrounds</Text>
      <View style={styles.grid}>
        {backgroundItems.map((item) => (
          <CosmeticCard
            key={item.id}
            item={item}
            isUnlocked={unlockedCosmeticIds.includes(item.id)}
            isEquipped={equippedCosmetics.background === item.id}
            onPress={() =>
              equipCosmetic("background", equippedCosmetics.background === item.id ? null : item.id)
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
        <Image
          source={bunnySource}
          style={[styles.previewBunny, !isUnlocked && styles.dimmed]}
          contentFit="contain"
          tintColor={isUnlocked ? item.furColor : "#ccc"}
        />
      ) : item.type === "background" ? (
        <View
          style={[
            styles.bgPreview,
            { backgroundColor: isUnlocked ? item.bgColor : "#ddd" },
            !isUnlocked && styles.dimmed,
          ]}
        >
          <Image source={bunnySource} style={styles.bgPreviewBunny} contentFit="contain" />
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
        <Text style={styles.unlockedBadge}>Tap to use</Text>
      ) : (
        <Text style={styles.lockedBadge}>{item.pointsRequired} pts</Text>
      )}
    </TouchableOpacity>
  );
}

function isColorDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
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
    borderRadius: 20,
    borderWidth: 2,
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
  },
  equippedNone: {
    fontSize: 13,
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
  previewBunny: {
    width: 52,
    height: 52,
  },
  bgPreview: {
    width: 60,
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  bgPreviewBunny: {
    width: 36,
    height: 36,
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
