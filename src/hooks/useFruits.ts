import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FruitData, depositToFruits, withdrawFromFruits, totalFruitValue } from "@/utils/fruitLogic";

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
      const newFruits = depositToFruits(existingFruits, amount, goalId);

      // Delete all old fruits for this goal
      await supabase.from("fruits").delete().eq("goal_id", goalId);

      // Insert new fruits
      if (newFruits.length > 0) {
        const { error } = await supabase.from("fruits").insert(
          newFruits.map((f) => ({ goal_id: goalId, tier: f.tier, value: f.value }))
        );
        if (error) throw error;
      }

      // Update goal amount
      const newTotal = totalFruitValue(newFruits);
      await supabase.from("goals").update({ current_amount: newTotal }).eq("id", goalId);

      return { newFruits, newTotal };
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

      const newTotal = totalFruitValue(newFruits);
      await supabase.from("goals").update({ current_amount: newTotal }).eq("id", goalId);

      return { newFruits, newTotal };
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["fruits", vars.goalId] });
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}
