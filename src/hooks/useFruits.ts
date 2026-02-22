import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FruitData, totalFruitValue, mergeTwoFruits, withdrawFromFruits, shouldAwardMysteryFruit, CustomFruitValues, getGoalFruitTiers } from "@/utils/fruitLogic";

export function useFruits(goalId: string | undefined) {
  return useQuery({
    queryKey: ["fruits", goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fruits")
        .select("*")
        .eq("goal_id", goalId!)
        .order("tier", { ascending: true });
      if (error) throw error;
      return data as FruitData[];
    },
    enabled: !!goalId,
  });
}

export function useDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ goalId, amount, existingFruits, customFruitValues }: { goalId: string; amount: number; existingFruits: FruitData[]; customFruitValues?: CustomFruitValues | null }) => {
      const tiers = getGoalFruitTiers(customFruitValues);
      const tier1Value = tiers[0].value;

      const { data: goalData } = await supabase.from("goals").select("current_amount").eq("id", goalId).single();
      const currentAmount = (goalData?.current_amount || 0) + amount;
      const currentFruitValue = totalFruitValue(existingFruits);
      const unaccounted = currentAmount - currentFruitValue;
      const cherryCount = Math.floor(unaccounted / tier1Value);
      
      const newCherries: FruitData[] = Array.from({ length: cherryCount }, () => ({
        id: crypto.randomUUID(),
        goal_id: goalId,
        tier: 1,
        value: tier1Value,
      }));

      // Mystery fruit check
      const mystery = shouldAwardMysteryFruit();
      const mysteryFruit: FruitData | null = mystery.award ? {
        id: crypto.randomUUID(),
        goal_id: goalId,
        tier: 1,
        value: 0,
        is_special: true,
        special_type: mystery.type,
      } : null;

      const newFruits = [...existingFruits, ...newCherries, ...(mysteryFruit ? [mysteryFruit] : [])];

      await supabase.from("fruits").delete().eq("goal_id", goalId);

      if (newFruits.length > 0) {
        const { error } = await supabase.from("fruits").insert(
          newFruits.map((f) => ({
            goal_id: goalId,
            tier: f.tier,
            value: f.value,
            is_special: f.is_special ?? false,
            special_type: f.special_type ?? null,
          }))
        );
        if (error) throw error;
      }

      await supabase.from("goals").update({ current_amount: currentAmount }).eq("id", goalId);

      return { newFruits, newTotal: currentAmount, mysteryFruit };
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["fruits", vars.goalId] });
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useManualMerge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ goalId, fruitAId, fruitBId, existingFruits, customFruitValues }: { goalId: string; fruitAId: string; fruitBId: string; existingFruits: FruitData[]; customFruitValues?: CustomFruitValues | null }) => {
      const { fruits: newFruits, mergedFruit } = mergeTwoFruits(existingFruits, fruitAId, fruitBId, customFruitValues);
      if (!mergedFruit) throw new Error("Cannot merge these fruits");

      await supabase.from("fruits").delete().eq("goal_id", goalId);

      if (newFruits.length > 0) {
        const { error } = await supabase.from("fruits").insert(
          newFruits.map((f) => ({
            goal_id: goalId,
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
      qc.invalidateQueries({ queryKey: ["fruits", vars.goalId] });
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useWithdraw() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ goalId, amount, existingFruits, customFruitValues }: { goalId: string; amount: number; existingFruits: FruitData[]; customFruitValues?: CustomFruitValues | null }) => {
      const newFruits = withdrawFromFruits(existingFruits, amount, customFruitValues);

      await supabase.from("fruits").delete().eq("goal_id", goalId);

      if (newFruits.length > 0) {
        const { error } = await supabase.from("fruits").insert(
          newFruits.map((f) => ({
            goal_id: goalId,
            tier: f.tier,
            value: f.value,
            is_special: f.is_special ?? false,
            special_type: f.special_type ?? null,
          }))
        );
        if (error) throw error;
      }

      const { data: goalData } = await supabase.from("goals").select("current_amount").eq("id", goalId).single();
      const newTotal = Math.max(0, (goalData?.current_amount || 0) - amount);
      await supabase.from("goals").update({ current_amount: newTotal }).eq("id", goalId);

      return { newFruits, newTotal };
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["fruits", vars.goalId] });
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}
