import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FruitData, depositToFruits, withdrawFromFruits, mergeTwoFruits, totalFruitValue } from "@/utils/fruitLogic";

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
    mutationFn: async ({ goalId, amount, existingFruits }: { goalId: string; amount: number; existingFruits: FruitData[] }) => {
      // Calculate cherries from accumulated remainder so no rupees are lost
      const { data: goalData } = await supabase.from("goals").select("current_amount").eq("id", goalId).single();
      const currentAmount = (goalData?.current_amount || 0) + amount;
      const currentFruitValue = totalFruitValue(existingFruits);
      const unaccounted = currentAmount - currentFruitValue;
      const cherryCount = Math.floor(unaccounted / 25);
      
      const newCherries: FruitData[] = Array.from({ length: cherryCount }, () => ({
        id: crypto.randomUUID(),
        goal_id: goalId,
        tier: 1,
        value: 25,
      }));
      const newFruits = [...existingFruits, ...newCherries];

      await supabase.from("fruits").delete().eq("goal_id", goalId);

      if (newFruits.length > 0) {
        const { error } = await supabase.from("fruits").insert(
          newFruits.map((f) => ({ goal_id: goalId, tier: f.tier, value: f.value }))
        );
        if (error) throw error;
      }

      await supabase.from("goals").update({ current_amount: currentAmount }).eq("id", goalId);

      return { newFruits, newTotal: currentAmount };
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
    mutationFn: async ({ goalId, fruitAId, fruitBId, existingFruits }: { goalId: string; fruitAId: string; fruitBId: string; existingFruits: FruitData[] }) => {
      const { fruits: newFruits, mergedFruit } = mergeTwoFruits(existingFruits, fruitAId, fruitBId);
      if (!mergedFruit) throw new Error("Cannot merge these fruits");

      await supabase.from("fruits").delete().eq("goal_id", goalId);

      if (newFruits.length > 0) {
        const { error } = await supabase.from("fruits").insert(
          newFruits.map((f) => ({ goal_id: goalId, tier: f.tier, value: f.value }))
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
    mutationFn: async ({ goalId, amount, existingFruits }: { goalId: string; amount: number; existingFruits: FruitData[] }) => {
      const newFruits = withdrawFromFruits(existingFruits, amount);

      await supabase.from("fruits").delete().eq("goal_id", goalId);

      if (newFruits.length > 0) {
        const { error } = await supabase.from("fruits").insert(
          newFruits.map((f) => ({ goal_id: goalId, tier: f.tier, value: f.value }))
        );
        if (error) throw error;
      }

      // Subtract actual withdrawal amount
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
