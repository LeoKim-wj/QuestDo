import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CosmeticItem } from "@/src/types/cosmetics";

type Props = {
  equippedAccessory?: CosmeticItem | null;
  furColor?: string | null;
  size?: "small" | "large";
};

export function BunnyMascot({ equippedAccessory, furColor, size = "large" }: Props) {
  const isLarge = size === "large";
  const circleSize = isLarge ? 96 : 54;
  const bunnyFontSize = isLarge ? 56 : 32;
  const accessoryFontSize = isLarge ? 30 : 18;

  return (
    <View style={styles.container}>
      <Text
        style={[styles.accessorySlot, { fontSize: accessoryFontSize, lineHeight: accessoryFontSize + 4 }]}
      >
        {equippedAccessory ? equippedAccessory.emoji : " "}
      </Text>
      <View
        style={[
          styles.bunnyCircle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            backgroundColor: furColor ?? "transparent",
          },
        ]}
      >
        <Text style={{ fontSize: bunnyFontSize, lineHeight: bunnyFontSize + 8 }}>🐰</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  accessorySlot: {
    textAlign: "center",
    marginBottom: -6,
  },
  bunnyCircle: {
    alignItems: "center",
    justifyContent: "center",
  },
});
