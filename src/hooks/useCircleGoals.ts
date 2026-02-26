import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CircleGoal {
  id: string;
  circle_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  icon: string;
  created_by: string;
  created_at: string;
  deadline: string | null;
}

export interface CircleGoalContribution {
  id: string;
  circle_goal_id: string;
  user_id: string;
  amount: number;
  contributed_at: string;
}

export function useCircleGoals(circleId: string | undefined) {
  return useQuery({
    queryKey: ["circle-goals", circleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("circle_goals")
        .select("*")
        .eq("circle_id", circleId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as CircleGoal[];
    },
    enabled: !!circleId,
  });
}

export function useCircleGoalContributions(goalId: string | undefined) {
  return useQuery({
    queryKey: ["circle-goal-contributions", goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("circle_goal_contributions")
        .select("*")
        .eq("circle_goal_id", goalId!)
        .order("contributed_at", { ascending: false });
      if (error) throw error;
      return data as unknown as CircleGoalContribution[];
    },
    enabled: !!goalId,
  });
}

export function useCreateCircleGoal() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ circleId, name, targetAmount, icon, deadline }: { circleId: string; name: string; targetAmount: number; icon: string; deadline?: string }) => {
      const { data, error } = await supabase
        .from("circle_goals")
        .insert({
          circle_id: circleId,
          name,
          target_amount: targetAmount,
          icon,
          created_by: user!.id,
          ...(deadline ? { deadline } : {}),
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CircleGoal;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["circle-goals", vars.circleId] });
    },
  });
}

export function useContributeToCircleGoal() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ circleGoalId, amount, circleId }: { circleGoalId: string; amount: number; circleId: string }) => {
      // Add contribution record
      const { error } = await supabase.from("circle_goal_contributions").insert({
        circle_goal_id: circleGoalId,
        user_id: user!.id,
        amount,
      } as any);
      if (error) throw error;

      // Update goal total atomically
      const { data: goal } = await supabase
        .from("circle_goals")
        .select("current_amount")
        .eq("id", circleGoalId)
        .single();
      
      const newAmount = (goal?.current_amount || 0) + amount;
      await supabase
        .from("circle_goals")
        .update({ current_amount: newAmount } as any)
        .eq("id", circleGoalId);

      return { newAmount };
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["circle-goals", vars.circleId] });
      qc.invalidateQueries({ queryKey: ["circle-goal-contributions"] });
      qc.invalidateQueries({ queryKey: ["circle-deposits"] });
    },
  });
}
