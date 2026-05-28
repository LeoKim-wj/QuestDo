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
        style={{ fontSize: accessoryFontSize, lineHeight: accessoryFontSize + 4, textAlign: "center", marginBottom: -8 }}
      >
        {equippedAccessory ? equippedAccessory.emoji : " "}
      </Text>
      <View
        style={[
          styles.imageWrapper,
          { width: imageSize, height: imageSize, borderRadius: imageSize / 2 },
          furColor ? { backgroundColor: furColor } : null,
        ]}
      >
        <Image
          source={bunnySource}
          style={{ width: imageSize, height: imageSize }}
          contentFit="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  imageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
