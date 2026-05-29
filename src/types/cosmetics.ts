export type CosmeticType = "accessory" | "furColor" | "background";

export type CosmeticItem = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  pointsRequired: number;
  type: CosmeticType;
  furColor?: string; // hex — only for furColor type
  bgColor?: string;  // hex — only for background type
};

export type EquippedCosmetics = {
  accessory: string | null;
  furColor: string | null;
  background: string | null;
};
