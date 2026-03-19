import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FruitData, totalFruitValue, mergeTwoFruits, getGoalFruitTiers, shouldAwardMysteryFruit } from "@/utils/fruitLogic";

export function useCircleGoalFruits(circleGoalId: string | undefined) {
  return useQuery({
    queryKey: ["circle-goal-fruits", circleGoalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("circle_goal_fruits" as any)
        .select("*")
        .eq("circle_goal_id", circleGoalId!)
        .order("tier", { ascending: true });
      if (error) throw error;
      return (data as any[]).map((d: any) => ({
        id: d.id,
        goal_id: d.circle_goal_id,
        tier: d.tier,
        value: d.value,
        is_special: d.is_special,
        special_type: d.special_type,
      })) as FruitData[];
    },
    enabled: !!circleGoalId,
  });
}

export function useCircleGoalDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ circleGoalId, amount, existingFruits }: { circleGoalId: string; amount: number; existingFruits: FruitData[] }) => {
      const tiers = getGoalFruitTiers();
      const tier1Value = tiers[0].value;

      // Get current goal amount
      const { data: goalData } = await supabase
        .from("circle_goals")
        .select("current_amount")
        .eq("id", circleGoalId)
        .single();
      const currentAmount = (goalData?.current_amount || 0) + amount;
      const currentFruitValue = totalFruitValue(existingFruits);
      const unaccounted = currentAmount - currentFruitValue;
      const cherryCount = Math.floor(unaccounted / tier1Value);

      const newCherries: FruitData[] = Array.from({ length: cherryCount }, () => ({
        id: crypto.randomUUID(),
        goal_id: circleGoalId,
        tier: 1,
        value: tier1Value,
      }));

      const mystery = shouldAwardMysteryFruit();
      const mysteryFruit: FruitData | null = mystery.award ? {
        id: crypto.randomUUID(),
        goal_id: circleGoalId,
        tier: 1,
        value: 0,
        is_special: true,
        special_type: mystery.type,
      } : null;

      const newFruits = [...existingFruits, ...newCherries, ...(mysteryFruit ? [mysteryFruit] : [])];

      // Replace all fruits
      await supabase.from("circle_goal_fruits" as any).delete().eq("circle_goal_id", circleGoalId);

      if (newFruits.length > 0) {
        const { error } = await supabase.from("circle_goal_fruits" as any).insert(
          newFruits.map((f) => ({
            circle_goal_id: circleGoalId,
            tier: f.tier,
            value: f.value,
            is_special: f.is_special ?? false,
            special_type: f.special_type ?? null,
          }))
        );
        if (error) throw error;
      }

      return { newFruits, mysteryFruit };
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["circle-goal-fruits", vars.circleGoalId] });
    },
  });
}

export function useCircleGoalManualMerge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ circleGoalId, fruitAId, fruitBId, existingFruits }: { circleGoalId: string; fruitAId: string; fruitBId: string; existingFruits: FruitData[] }) => {
      const { fruits: newFruits, mergedFruit } = mergeTwoFruits(existingFruits, fruitAId, fruitBId);
      if (!mergedFruit) throw new Error("Cannot merge these fruits");

      await supabase.from("circle_goal_fruits" as any).delete().eq("circle_goal_id", circleGoalId);

      if (newFruits.length > 0) {
        const { error } = await supabase.from("circle_goal_fruits" as any).insert(
          newFruits.map((f) => ({
            circle_goal_id: circleGoalId,
            tier: f.tier,
            value: f.value,
            is_special: f.is_special ?? false,
            special_type: f.special_type ?? null,
          }))
        );
        if (error) throw error;
      }

      return { newFruits, mergedFruit };
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["circle-goal-fruits", vars.circleGoalId] });
    },
  });
}
