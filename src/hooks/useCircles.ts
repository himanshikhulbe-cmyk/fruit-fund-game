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
      // Get circles where user is a member
      const { data: memberships } = await supabase
        .from("circle_members")
        .select("circle_id")
        .eq("user_id", user!.id);
      
      const circleIds = memberships?.map((m: any) => m.circle_id) ?? [];
      
      // Also get circles created by user
      const { data: created } = await supabase
        .from("circles")
        .select("*")
        .eq("created_by", user!.id);
      
      let circles = (created ?? []) as Circle[];
      
      if (circleIds.length > 0) {
        const { data: joined } = await supabase
          .from("circles")
          .select("*")
          .in("id", circleIds);
        const joinedCircles = (joined ?? []) as Circle[];
        // Merge without duplicates
        const ids = new Set(circles.map((c) => c.id));
        for (const c of joinedCircles) {
          if (!ids.has(c.id)) circles.push(c);
        }
      }
      
      return circles;
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
      const { data: circle, error } = await supabase
        .from("circles")
        .insert({ name, created_by: user!.id })
        .select()
        .single();
      if (error) throw error;
      
      // Auto-join as member
      await supabase.from("circle_members").insert({
        circle_id: circle.id,
        user_id: user!.id,
        display_name: displayName,
      });
      
      return circle as Circle;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["circles"] }),
  });
}

export function useJoinCircle() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ inviteCode, displayName }: { inviteCode: string; displayName: string }) => {
      const { data: circle, error: findError } = await supabase
        .from("circles")
        .select("*")
        .eq("invite_code", inviteCode.trim())
        .single();
      if (findError || !circle) throw new Error("Invalid invite code");
      
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
    },
  });
}
