export type BonusReward = {
  id: string;
  milestone: number;
  points: number;
  title: string;
  description: string;
};

export const bonusRewards: BonusReward[] = [
  {
    id: "small-bonus",
    milestone: 3,
    points: 5,
    title: "Small Bonus",
    description: "Complete 3 tasks",
  },
  {
    id: "medium-bonus",
    milestone: 5,
    points: 10,
    title: "Medium Bonus",
    description: "Complete 5 tasks",
  },
  {
    id: "big-bonus",
    milestone: 10,
    points: 25,
    title: "Big Bonus",
    description: "Complete 10 tasks",
  },
];
