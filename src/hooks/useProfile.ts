import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// ---- REDEEMED CODES ----
const VALID_CODES: Record<string, { reward_type: string; reward_value: string; label: string }> = {
  FINCODE2026: { reward_type: "golden_fruit", reward_value: "1", label: "1 Golden Fruit" },
  CAMPUSVIP: { reward_type: "premium", reward_value: "30", label: "30 Days Premium Access" },
};

export function useRedeemedCodes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["redeemed-codes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("redeemed_codes").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data as { id: string; code: string; reward_type: string; reward_value: string; redeemed_at: string }[];
    },
    enabled: !!user,
  });
}

export function useRedeemCode() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (code: string) => {
      const upper = code.trim().toUpperCase();
      const valid = VALID_CODES[upper];
      if (!valid) throw new Error("Invalid code");

      const { error } = await supabase.from("redeemed_codes").insert({
        user_id: user!.id,
        code: upper,
        reward_type: valid.reward_type,
        reward_value: valid.reward_value,
      } as any);
      if (error) {
        if (error.code === "23505") throw new Error("Code already redeemed");
        throw error;
      }

      // If golden fruit, add to market inventory
      if (valid.reward_type === "golden_fruit") {
        await supabase.from("market_inventory").insert({
          user_id: user!.id,
          item_type: "golden_fruit",
          item_name: "Golden Fruit",
          item_emoji: "⭐",
        } as any);
      }

      return { ...valid, code: upper };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["redeemed-codes"] });
      qc.invalidateQueries({ queryKey: ["market-inventory"] });
    },
  });
}

export function getValidCodes() {
  return VALID_CODES;
}

// ---- TOKENS ----
export function useUserTokens() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-tokens", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_tokens").select("*").eq("user_id", user!.id);
      if (error) throw error;
      const total = (data as any[]).reduce((s: number, t: any) => s + (t.amount || 0), 0);
      return { tokens: data as any[], total };
    },
    enabled: !!user,
  });
}

export function useEarnTokens() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ goalId, amount, reason }: { goalId?: string; amount: number; reason: string }) => {
      const { error } = await supabase.from("user_tokens").insert({
        user_id: user!.id,
        goal_id: goalId ?? null,
        amount,
        reason,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-tokens"] }),
  });
}

// ---- MARKET INVENTORY ----
export function useMarketInventory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["market-inventory", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("market_inventory").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data as { id: string; item_type: string; item_name: string; item_emoji: string; purchased_at: string }[];
    },
    enabled: !!user,
  });
}

export function usePurchaseMarketItem() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ itemType, itemName, itemEmoji, tokenCost }: { itemType: string; itemName: string; itemEmoji: string; tokenCost: number }) => {
      // Deduct tokens (negative amount)
      await supabase.from("user_tokens").insert({
        user_id: user!.id,
        amount: -tokenCost,
        reason: `Purchased ${itemName}`,
      } as any);
      // Add to inventory
      const { error } = await supabase.from("market_inventory").insert({
        user_id: user!.id,
        item_type: itemType,
        item_name: itemName,
        item_emoji: itemEmoji,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["market-inventory"] });
      qc.invalidateQueries({ queryKey: ["user-tokens"] });
    },
  });
}

// ---- WISHLISTS ----
export function useWishlists() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wishlists", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("wishlists").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data as { id: string; title: string; description: string | null; image_url: string | null; link_url: string | null; goal_id: string | null; created_at: string }[];
    },
    enabled: !!user,
  });
}

export function useAddWishlistItem() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (item: { title: string; description?: string; image_url?: string; link_url?: string; goal_id?: string }) => {
      const { error } = await supabase.from("wishlists").insert({ ...item, user_id: user!.id } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlists"] }),
  });
}

export function useDeleteWishlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("wishlists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlists"] }),
  });
}

// ---- DRAFT GOALS ----
export function useDraftGoals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["draft-goals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("draft_goals").select("*").eq("user_id", user!.id).order("updated_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });
}

export function useSaveDraft() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (draft: any) => {
      if (draft.id) {
        const { error } = await supabase.from("draft_goals").update({ ...draft, updated_at: new Date().toISOString() } as any).eq("id", draft.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("draft_goals").insert({ ...draft, user_id: user!.id } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["draft-goals"] }),
  });
}

export function useDeleteDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("draft_goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["draft-goals"] }),
  });
}

// ---- PREMIUM STATUS (UI only, based on redeemed codes) ----
export function useIsPremium() {
  const { data: codes } = useRedeemedCodes();
  if (!codes) return false;
  const premiumCode = codes.find((c) => c.reward_type === "premium");
  if (!premiumCode) return false;
  const redeemed = new Date(premiumCode.redeemed_at);
  const days = parseInt(premiumCode.reward_value) || 30;
  const expiry = new Date(redeemed.getTime() + days * 24 * 60 * 60 * 1000);
  return expiry > new Date();
}
