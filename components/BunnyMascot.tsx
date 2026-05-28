import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CosmeticItem } from "@/src/types/cosmetics";

type Props = {
  equippedCosmetic?: CosmeticItem | null;
  size?: "small" | "large";
};

export function BunnyMascot({ equippedCosmetic, size = "large" }: Props) {
  const isLarge = size === "large";

  return (
    <View style={styles.container}>
      <Text style={[styles.cosmeticSlot, isLarge ? styles.cosmeticLarge : styles.cosmeticSmall]}>
        {equippedCosmetic ? equippedCosmetic.emoji : " "}
      </Text>
      <Text style={isLarge ? styles.bunnyLarge : styles.bunnySmall}>🐰</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  cosmeticSlot: {
    textAlign: "center",
    lineHeight: 28,
  },
  cosmeticLarge: {
    fontSize: 28,
    marginBottom: -4,
  },
  cosmeticSmall: {
    fontSize: 16,
    marginBottom: -2,
  },
  bunnyLarge: {
    fontSize: 64,
    lineHeight: 72,
  },
  bunnySmall: {
    fontSize: 36,
    lineHeight: 42,
  },
});
