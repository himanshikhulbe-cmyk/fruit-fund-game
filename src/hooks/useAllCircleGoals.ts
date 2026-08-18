import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { CircleGoal } from "./useCircleGoals";

export interface CircleGoalWithInfo extends CircleGoal {
  circle_name: string;
  member_count: number;
}

export function useAllCircleGoals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["all-circle-goals", user?.id],
    queryFn: async () => {
      // Get user's circle IDs (RLS restricts rows to the current user's memberships)
      const { data: memberships } = await supabase
        .from("circle_members")
        .select("circle_id")
        .eq("user_id", user!.id);
      const circleIds = (memberships ?? []).map((m) => m.circle_id);
      if (circleIds.length === 0) return [];

      // Get circles info
      const { data: circles } = await supabase
        .from("circles")
        .select("id, name")
        .in("id", circleIds);

      // Get all circle goals
      const { data: goals, error } = await supabase
        .from("circle_goals")
        .select("*")
        .in("circle_id", circleIds)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Get member counts
      const { data: members } = await supabase
        .from("circle_members")
        .select("circle_id")
        .in("circle_id", circleIds);

      const memberCounts: Record<string, number> = {};
      members?.forEach((m) => { memberCounts[m.circle_id] = (memberCounts[m.circle_id] || 0) + 1; });

      const circleMap: Record<string, string> = {};
      circles?.forEach((c) => { circleMap[c.id] = c.name; });

      return (goals ?? []).map((g: any) => ({
        ...g,
        circle_name: circleMap[g.circle_id] ?? "Circle",
        member_count: memberCounts[g.circle_id] ?? 0,
      })) as CircleGoalWithInfo[];
    },
    enabled: !!user,
  });
}
