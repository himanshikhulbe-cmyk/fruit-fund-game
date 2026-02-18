// Fruit tier system
export const FRUIT_TIERS = [
  { tier: 1, name: "Cherry", emoji: "🍒", value: 25, color: "#e74c3c" },
  { tier: 2, name: "Strawberry", emoji: "🍓", value: 50, color: "#e84393" },
  { tier: 3, name: "Orange", emoji: "🍊", value: 100, color: "#f39c12" },
  { tier: 4, name: "Mango", emoji: "🥭", value: 200, color: "#fdcb6e" },
  { tier: 5, name: "Dragon Fruit", emoji: "🍈", value: 400, color: "#a855f7" },
] as const;

export type FruitData = { id: string; goal_id: string; tier: number; value: number };

export function getFruitInfo(tier: number) {
  return FRUIT_TIERS.find((f) => f.tier === tier) ?? FRUIT_TIERS[0];
}

// Merge logic: while 2 fruits of same tier exist, merge them
export function mergeFruits(fruits: FruitData[]): FruitData[] {
  const result = [...fruits];
  let merged = true;

  while (merged) {
    merged = false;
    for (let tier = 1; tier <= 4; tier++) {
      const sameTier = result.filter((f) => f.tier === tier);
      if (sameTier.length >= 2) {
        // Remove 2, add 1 of next tier
        const [a, b] = sameTier;
        const idxA = result.indexOf(a);
        result.splice(idxA, 1);
        const idxB = result.indexOf(b);
        result.splice(idxB, 1);
        
        const nextTier = FRUIT_TIERS.find((ft) => ft.tier === tier + 1)!;
        result.push({
          id: crypto.randomUUID(),
          goal_id: a.goal_id,
          tier: nextTier.tier,
          value: nextTier.value,
        });
        merged = true;
        break; // restart the loop
      }
    }
  }

  return result;
}

// Deposit: convert amount to cherries (no auto-merge, user merges manually)
export function depositToFruits(
  existingFruits: FruitData[],
  amount: number,
  goalId: string
): FruitData[] {
  const cherryCount = Math.floor(amount / 25);
  const newCherries: FruitData[] = Array.from({ length: cherryCount }, () => ({
    id: crypto.randomUUID(),
    goal_id: goalId,
    tier: 1,
    value: 25,
  }));

  return [...existingFruits, ...newCherries];
}

// Merge two specific same-tier fruits into one higher-tier fruit
export function mergeTwoFruits(
  existingFruits: FruitData[],
  fruitAId: string,
  fruitBId: string
): { fruits: FruitData[]; mergedFruit: FruitData | null } {
  const a = existingFruits.find((f) => f.id === fruitAId);
  const b = existingFruits.find((f) => f.id === fruitBId);

  if (!a || !b || a.tier !== b.tier || a.tier >= 5) {
    return { fruits: existingFruits, mergedFruit: null };
  }

  const nextTier = FRUIT_TIERS.find((ft) => ft.tier === a.tier + 1)!;
  const mergedFruit: FruitData = {
    id: crypto.randomUUID(),
    goal_id: a.goal_id,
    tier: nextTier.tier,
    value: nextTier.value,
  };

  const remaining = existingFruits.filter((f) => f.id !== fruitAId && f.id !== fruitBId);
  return { fruits: [...remaining, mergedFruit], mergedFruit };
}

// Withdrawal: remove highest tier first, break if needed
export function withdrawFromFruits(
  existingFruits: FruitData[],
  amount: number
): FruitData[] {
  let remaining = amount;
  const result = [...existingFruits];

  while (remaining > 0 && result.length > 0) {
    // Sort descending by tier
    result.sort((a, b) => b.tier - a.tier);
    const highest = result[0];

    if (highest.value <= remaining) {
      // Remove it
      remaining -= highest.value;
      result.splice(0, 1);
    } else {
      // Break it down: remove 1 high tier, add 2 of lower tier
      result.splice(0, 1);
      if (highest.tier > 1) {
        const lowerTier = FRUIT_TIERS.find((f) => f.tier === highest.tier - 1)!;
        result.push(
          { id: crypto.randomUUID(), goal_id: highest.goal_id, tier: lowerTier.tier, value: lowerTier.value },
          { id: crypto.randomUUID(), goal_id: highest.goal_id, tier: lowerTier.tier, value: lowerTier.value }
        );
      } else {
        // It's a cherry worth 25, but we need less. Just remove it and lose the remainder
        remaining = 0;
      }
    }
  }

  return result;
}

// Calculate total value of fruits
export function totalFruitValue(fruits: FruitData[]): number {
  return fruits.reduce((sum, f) => sum + f.value, 0);
}
