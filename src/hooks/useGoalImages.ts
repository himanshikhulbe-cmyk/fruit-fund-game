import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GoalImage } from "./useGoals";

export function useGoalImages(goalId: string | undefined) {
  return useQuery({
    queryKey: ["goal-images", goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goal_images")
        .select("*")
        .eq("goal_id", goalId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as GoalImage[];
    },
    enabled: !!goalId,
  });
}

export function useUploadGoalImages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ goalId, files }: { goalId: string; files: File[] }) => {
      const uploaded: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${goalId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("goal-images")
          .upload(path, file);
        if (uploadError) throw uploadError;
        uploaded.push(path);
      }
      // Insert records
      if (uploaded.length > 0) {
        const { error } = await supabase.from("goal_images").insert(
          uploaded.map((p) => ({ goal_id: goalId, image_path: p }))
        );
        if (error) throw error;
      }
      return uploaded;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["goal-images", vars.goalId] });
    },
  });
}

export function getGoalImageUrl(imagePath: string) {
  const { data } = supabase.storage.from("goal-images").getPublicUrl(imagePath);
  return data.publicUrl;
}
