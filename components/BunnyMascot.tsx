import { Image } from "expo-image";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CosmeticItem } from "@/src/types/cosmetics";

const bunnySource = require("@/assets/images/bunny-mascot.png");

type Props = {
  equippedAccessory?: CosmeticItem | null;
  furColor?: string | null;
  size?: "small" | "large";
};

export function BunnyMascot({ equippedAccessory, furColor, size = "large" }: Props) {
  const isLarge = size === "large";
  const imageSize = isLarge ? 100 : 56;
  const accessoryFontSize = isLarge ? 30 : 18;

  return (
    <View style={styles.container}>
      <Text
        style={{
          fontSize: accessoryFontSize,
          lineHeight: accessoryFontSize + 4,
          textAlign: "center",
          marginBottom: -8,
        }}
      >
        {equippedAccessory ? equippedAccessory.emoji : " "}
      </Text>
      <Image
        source={bunnySource}
        style={{ width: imageSize, height: imageSize }}
        contentFit="contain"
        tintColor={furColor ?? undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
});
