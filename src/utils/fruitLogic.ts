// Fruit tier system — defaults
export const FRUIT_TIERS = [
  { tier: 1, name: "Cherry", emoji: "🍒", value: 25, color: "#e74c3c" },
  { tier: 2, name: "Strawberry", emoji: "🍓", value: 50, color: "#e84393" },
  { tier: 3, name: "Orange", emoji: "🍊", value: 100, color: "#f39c12" },
  { tier: 4, name: "Mango", emoji: "🥭", value: 200, color: "#fdcb6e" },
  { tier: 5, name: "Dragon Fruit", emoji: "🍈", value: 400, color: "#a855f7" },
] as const;

export const AVAILABLE_FRUIT_EMOJIS = [
  "🍓", "🍒", "🍎", "🍉", "🍑", "🍊", "🥭", "🍍", "🍌", "🍋",
  "🍈", "🍐", "🍏", "🥝", "🥑", "🫐", "🍇", "🥥",
];

export const MYSTERY_FRUITS = [
  { type: "golden", name: "Golden Fruit", emoji: "⭐", color: "#ffd700" },
  { type: "fusion", name: "Fusion Fruit", emoji: "🌈", color: "#ff6b6b" },
  { type: "mystic", name: "Mystic Fruit", emoji: "🔮", color: "#9b59b6" },
] as const;

export type FruitData = {
  id: string;
  goal_id: string;
  tier: number;
  value: number;
  is_special?: boolean;
  special_type?: string | null;
};

export type CustomFruitValues = { [tier: number]: number };
export type CustomFruitEmojis = string[]; // 3-5 emojis mapped to tiers 1-5

export function getGoalFruitTiers(
  customValues?: CustomFruitValues | null,
  customEmojis?: CustomFruitEmojis | null
) {
  return FRUIT_TIERS.map((ft, i) => ({
    ...ft,
    value: customValues?.[ft.tier] ?? ft.value,
    emoji: customEmojis?.[i] ?? ft.emoji,
    name: customEmojis?.[i] ? `Tier ${ft.tier}` : ft.name,
  }));
}

export function getFruitInfo(
  tier: number,
  customValues?: CustomFruitValues | null,
  customEmojis?: CustomFruitEmojis | null
) {
  const tiers = getGoalFruitTiers(customValues, customEmojis);
  return tiers.find((f) => f.tier === tier) ?? tiers[0];
}

export function getMysteryFruitInfo(specialType: string) {
  return MYSTERY_FRUITS.find((m) => m.type === specialType) ?? MYSTERY_FRUITS[0];
}

// Check if mystery fruit should be awarded (5% random chance)
export function shouldAwardMysteryFruit(): { award: boolean; type: string } {
  const roll = Math.random();
  if (roll < 0.05) {
    const types = MYSTERY_FRUITS.map((m) => m.type);
    const type = types[Math.floor(Math.random() * types.length)];
    return { award: true, type };
  }
  return { award: false, type: "" };
}

// Merge logic: while 2 fruits of same tier exist, merge them
export function mergeFruits(fruits: FruitData[], customValues?: CustomFruitValues | null): FruitData[] {
  const tiers = getGoalFruitTiers(customValues);
  const result = [...fruits].filter((f) => !f.is_special); // don't merge special fruits
  const specials = fruits.filter((f) => f.is_special);
  let merged = true;

  while (merged) {
    merged = false;
    for (let tier = 1; tier <= 4; tier++) {
      const sameTier = result.filter((f) => f.tier === tier);
      if (sameTier.length >= 2) {
        const [a, b] = sameTier;
        const idxA = result.indexOf(a);
        result.splice(idxA, 1);
        const idxB = result.indexOf(b);
        result.splice(idxB, 1);
        
        const nextTier = tiers.find((ft) => ft.tier === tier + 1)!;
        result.push({
          id: crypto.randomUUID(),
          goal_id: a.goal_id,
          tier: nextTier.tier,
          value: nextTier.value,
        });
        merged = true;
        break;
      }
    }
  }

  return [...result, ...specials];
}

// Deposit: convert amount to cherries
export function depositToFruits(
  existingFruits: FruitData[],
  amount: number,
  goalId: string,
  customValues?: CustomFruitValues | null
): FruitData[] {
  const tiers = getGoalFruitTiers(customValues);
  const tier1Value = tiers[0].value;
  const cherryCount = Math.floor(amount / tier1Value);
  const newCherries: FruitData[] = Array.from({ length: cherryCount }, () => ({
    id: crypto.randomUUID(),
    goal_id: goalId,
    tier: 1,
    value: tier1Value,
  }));

  return [...existingFruits, ...newCherries];
}

// Merge two specific same-tier fruits into one higher-tier fruit
export function mergeTwoFruits(
  existingFruits: FruitData[],
  fruitAId: string,
  fruitBId: string,
  customValues?: CustomFruitValues | null
): { fruits: FruitData[]; mergedFruit: FruitData | null } {
  const tiers = getGoalFruitTiers(customValues);
  const a = existingFruits.find((f) => f.id === fruitAId);
  const b = existingFruits.find((f) => f.id === fruitBId);

  if (!a || !b || a.tier !== b.tier || a.tier >= 5 || a.is_special || b.is_special) {
    return { fruits: existingFruits, mergedFruit: null };
  }

  const nextTier = tiers.find((ft) => ft.tier === a.tier + 1)!;
  const mergedFruit: FruitData = {
    id: crypto.randomUUID(),
    goal_id: a.goal_id,
    tier: nextTier.tier,
    value: nextTier.value,
  };

  const remaining = existingFruits.filter((f) => f.id !== fruitAId && f.id !== fruitBId);
  return { fruits: [...remaining, mergedFruit], mergedFruit };
}

// Withdrawal: remove lowest tier first, break if needed
export function withdrawFromFruits(
  existingFruits: FruitData[],
  amount: number,
  customValues?: CustomFruitValues | null
): FruitData[] {
  const tiers = getGoalFruitTiers(customValues);
  let remaining = amount;
  const result = [...existingFruits].filter((f) => !f.is_special);
  const specials = existingFruits.filter((f) => f.is_special);

  while (remaining > 0 && result.length > 0) {
    result.sort((a, b) => a.tier - b.tier);
    const lowest = result[0];

    if (lowest.value <= remaining) {
      remaining -= lowest.value;
      result.splice(0, 1);
    } else {
      result.splice(0, 1);
      if (lowest.tier > 1) {
        const lowerTier = tiers.find((f) => f.tier === lowest.tier - 1)!;
        result.push(
          { id: crypto.randomUUID(), goal_id: lowest.goal_id, tier: lowerTier.tier, value: lowerTier.value },
          { id: crypto.randomUUID(), goal_id: lowest.goal_id, tier: lowerTier.tier, value: lowerTier.value }
        );
      } else {
        remaining = 0;
      }
    }
  }

  return [...result, ...specials];
}

// Calculate total value of fruits (excluding special/mystery)
export function totalFruitValue(fruits: FruitData[]): number {
  return fruits.filter((f) => !f.is_special).reduce((sum, f) => sum + f.value, 0);
}

// Evolution stage based on precise progress percentage
// Tier 1 → 0–25%, Tier 2 → 25–50%, Tier 3 → 50–75%, Tier 4 → 75–100%
export interface EvolutionInfo {
  stage: number;       // 1-4
  label: string;
  progressPct: number; // exact decimal percentage
  nextStageAt: number; // percentage needed for next stage
}

export function getEvolutionStage(currentAmount: number, targetAmount: number): EvolutionInfo {
  if (targetAmount <= 0) return { stage: 1, label: "Seedling 🌱", progressPct: 0, nextStageAt: 25 };
  
  const pct = (currentAmount / targetAmount) * 100; // precise, no rounding
  
  if (pct >= 75) return { stage: 4, label: "Blooming 🌸", progressPct: pct, nextStageAt: 100 };
  if (pct >= 50) return { stage: 3, label: "Growing 🌿", progressPct: pct, nextStageAt: 75 };
  if (pct >= 25) return { stage: 2, label: "Sprouting 🌾", progressPct: pct, nextStageAt: 50 };
  return { stage: 1, label: "Seedling 🌱", progressPct: pct, nextStageAt: 25 };
}

// Map market item names to image asset keys
export const MARKET_ITEM_IMAGE_MAP: Record<string, string> = {
  "Golden Cherry": "golden-cherry",
  "Golden Strawberry": "golden-strawberry",
  "Apple Peach Fusion": "peach",
  "Raspberry Guava": "golden-guava",
  "Starfruit": "starfruit",
  "Custard Apple": "custard-apple",
  "Mystical Grapes": "grape",
  "Golden Fruit": "golden-cherry",
};
