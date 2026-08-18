import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Circle {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  display_name: string;
  joined_at: string;
}

export interface CircleDeposit {
  id: string;
  circle_id: string;
  user_id: string;
  amount: number;
  deposited_at: string;
}

export function useMyCircles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["circles", user?.id],
    queryFn: async () => {
      // First get all circle_ids where user is a member
      const { data: memberships, error: memErr } = await supabase
        .from("circle_members")
        .select("circle_id")
        .eq("user_id", user!.id);
      if (memErr) throw memErr;

      const circleIds = memberships?.map((m) => m.circle_id) ?? [];
      if (circleIds.length === 0) {
        // Also check circles created by user (creator auto-joins, but handle edge case)
        const { data: created, error: crErr } = await supabase
          .from("circles")
          .select("*")
          .eq("created_by", user!.id);
        if (crErr) throw crErr;
        return (created ?? []) as Circle[];
      }

      const { data: circles, error } = await supabase
        .from("circles")
        .select("*")
        .in("id", circleIds);
      if (error) throw error;
      return (circles ?? []) as Circle[];
    },
    enabled: !!user,
  });
}

export function useCircleMembers(circleId: string | undefined) {
  return useQuery({
    queryKey: ["circle-members", circleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("circle_members")
        .select("*")
        .eq("circle_id", circleId!);
      if (error) throw error;
      return data as CircleMember[];
    },
    enabled: !!circleId,
  });
}

export function useCircleDeposits(circleId: string | undefined) {
  return useQuery({
    queryKey: ["circle-deposits", circleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("circle_deposits")
        .select("*")
        .eq("circle_id", circleId!)
        .order("deposited_at", { ascending: false });
      if (error) throw error;
      return data as CircleDeposit[];
    },
    enabled: !!circleId,
  });
}

export function useCreateCircle() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ name, displayName }: { name: string; displayName: string }) => {
      // Create circle
      const { data: circle, error } = await supabase
        .from("circles")
        .insert({ name, created_by: user!.id })
        .select()
        .single();
      if (error) throw error;

      // Auto-join creator as member
      const { error: joinErr } = await supabase.from("circle_members").insert({
        circle_id: circle.id,
        user_id: user!.id,
        display_name: displayName,
      });
      if (joinErr) throw joinErr;

      return circle as Circle;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["circles"] });
      qc.invalidateQueries({ queryKey: ["circle-members"] });
    },
  });
}

export function useJoinCircle() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ inviteCode, displayName }: { inviteCode: string; displayName: string }) => {
      // Use security definer function to find circle (bypasses RLS)
      const { data: circles, error: findError } = await supabase
        .rpc("find_circle_by_invite_code", { _invite_code: inviteCode.trim() });
      
      if (findError) throw new Error("Could not look up invite code");
      if (!circles || circles.length === 0) throw new Error("Invalid invite code");
      
      const circle = circles[0];

      // Check if already a member
      const { data: existingMembership } = await supabase
        .from("circle_members")
        .select("id")
        .eq("circle_id", circle.id)
        .eq("user_id", user!.id)
        .maybeSingle();

      if (existingMembership) throw new Error("You're already a member of this circle");

      // Join
      const { error } = await supabase.from("circle_members").insert({
        circle_id: circle.id,
        user_id: user!.id,
        display_name: displayName,
      });
      if (error) {
        if (error.code === "23505") throw new Error("Already a member");
        throw error;
      }

      return circle as Circle;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["circles"] });
      qc.invalidateQueries({ queryKey: ["circle-members"] });
    },
  });
}

export function useLogCircleDeposit() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ circleId, amount }: { circleId: string; amount: number }) => {
      const { error } = await supabase.from("circle_deposits").insert({
        circle_id: circleId,
        user_id: user!.id,
        amount,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["circle-deposits", vars.circleId] });
      qc.invalidateQueries({ queryKey: ["circle-members", vars.circleId] });
    },
  });
}
