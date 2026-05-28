export type CosmeticType = "accessory" | "furColor";

export type CosmeticItem = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  pointsRequired: number;
  type: CosmeticType;
  furColor?: string; // hex color — only present for furColor type
};

export type EquippedCosmetics = {
  accessory: string | null;
  furColor: string | null;
};
