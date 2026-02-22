import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { CustomFruitValues, CustomFruitEmojis } from "@/utils/fruitLogic";

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  icon: string;
  created_at: string;
  deadline: string | null;
  priority: number;
  motivation_text: string | null;
  is_fun_fund: boolean;
  custom_fruit_values: CustomFruitValues | null;
  custom_fruit_emojis: CustomFruitEmojis | null;
}

export interface GoalImage {
  id: string;
  goal_id: string;
  image_path: string;
  created_at: string;
}

export function useGoals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["goals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("priority", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ name, target_amount, icon, deadline, priority, motivation_text, is_fun_fund, custom_fruit_values, custom_fruit_emojis }: {
      name: string; target_amount: number; icon: string; deadline?: string; priority?: number; motivation_text?: string;
      is_fun_fund?: boolean; custom_fruit_values?: CustomFruitValues; custom_fruit_emojis?: CustomFruitEmojis;
    }) => {
      const { data, error } = await supabase
        .from("goals")
        .insert({
          name, target_amount, icon, user_id: user!.id,
          ...(deadline ? { deadline } : {}),
          ...(priority !== undefined ? { priority } : {}),
          ...(motivation_text ? { motivation_text } : {}),
          ...(is_fun_fund !== undefined ? { is_fun_fund } : {}),
          ...(custom_fruit_values ? { custom_fruit_values: custom_fruit_values as any } : {}),
          ...(custom_fruit_emojis ? { custom_fruit_emojis: custom_fruit_emojis as any } : {}),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ goalId, updates }: { goalId: string; updates: Partial<Pick<Goal, 'target_amount' | 'deadline' | 'motivation_text' | 'custom_fruit_values' | 'custom_fruit_emojis'>> }) => {
      const { error } = await supabase
        .from("goals")
        .update(updates as any)
        .eq("id", goalId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useUpdateGoalAmount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ goalId, amount }: { goalId: string; amount: number }) => {
      const { error } = await supabase
        .from("goals")
        .update({ current_amount: amount })
        .eq("id", goalId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase.from("goals").delete().eq("id", goalId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}
