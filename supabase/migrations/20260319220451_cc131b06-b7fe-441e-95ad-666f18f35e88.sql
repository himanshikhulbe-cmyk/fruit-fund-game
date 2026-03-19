
-- Add image_path to circle_goals
ALTER TABLE public.circle_goals ADD COLUMN image_path text;

-- Create circle_goal_fruits table for fruit merging in circles
CREATE TABLE public.circle_goal_fruits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_goal_id uuid NOT NULL REFERENCES public.circle_goals(id) ON DELETE CASCADE,
  tier integer NOT NULL DEFAULT 1,
  value integer NOT NULL DEFAULT 25,
  is_special boolean NOT NULL DEFAULT false,
  special_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.circle_goal_fruits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view circle goal fruits"
ON public.circle_goal_fruits FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.circle_goals cg
    WHERE cg.id = circle_goal_fruits.circle_goal_id
    AND check_circle_membership(cg.circle_id, auth.uid())
  )
);

CREATE POLICY "Members can insert circle goal fruits"
ON public.circle_goal_fruits FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.circle_goals cg
    WHERE cg.id = circle_goal_fruits.circle_goal_id
    AND check_circle_membership(cg.circle_id, auth.uid())
  )
);

CREATE POLICY "Members can update circle goal fruits"
ON public.circle_goal_fruits FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.circle_goals cg
    WHERE cg.id = circle_goal_fruits.circle_goal_id
    AND check_circle_membership(cg.circle_id, auth.uid())
  )
);

CREATE POLICY "Members can delete circle goal fruits"
ON public.circle_goal_fruits FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.circle_goals cg
    WHERE cg.id = circle_goal_fruits.circle_goal_id
    AND check_circle_membership(cg.circle_id, auth.uid())
  )
);
