
-- Fix circle_members: drop recursive policies and recreate with security definer
DROP POLICY IF EXISTS "Join circles" ON public.circle_members;
DROP POLICY IF EXISTS "Leave circles" ON public.circle_members;
DROP POLICY IF EXISTS "View circle members" ON public.circle_members;

CREATE POLICY "View circle members"
ON public.circle_members FOR SELECT
TO authenticated
USING (public.check_circle_membership(circle_id, auth.uid()));

CREATE POLICY "Join circles"
ON public.circle_members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Leave circles"
ON public.circle_members FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Fix circles SELECT policy
DROP POLICY IF EXISTS "View circles user belongs to" ON public.circles;
CREATE POLICY "View circles user belongs to"
ON public.circles FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR public.check_circle_membership(id, auth.uid())
);

-- Fix circle_deposits policies
DROP POLICY IF EXISTS "Log circle deposits" ON public.circle_deposits;
DROP POLICY IF EXISTS "View circle deposits" ON public.circle_deposits;

CREATE POLICY "View circle deposits"
ON public.circle_deposits FOR SELECT
TO authenticated
USING (public.check_circle_membership(circle_id, auth.uid()));

CREATE POLICY "Log circle deposits"
ON public.circle_deposits FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.check_circle_membership(circle_id, auth.uid())
);

-- Fix circle_goals policies
DROP POLICY IF EXISTS "Circle members can create goals" ON public.circle_goals;
DROP POLICY IF EXISTS "Circle members can view goals" ON public.circle_goals;
DROP POLICY IF EXISTS "Creator can update goals" ON public.circle_goals;

CREATE POLICY "Circle members can view goals"
ON public.circle_goals FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR public.check_circle_membership(circle_id, auth.uid())
);

CREATE POLICY "Circle members can create goals"
ON public.circle_goals FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
  AND public.check_circle_membership(circle_id, auth.uid())
);

CREATE POLICY "Creator can update goals"
ON public.circle_goals FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Fix circle_goal_contributions policies
DROP POLICY IF EXISTS "Members can contribute" ON public.circle_goal_contributions;
DROP POLICY IF EXISTS "Members can view contributions" ON public.circle_goal_contributions;

CREATE POLICY "Members can view contributions"
ON public.circle_goal_contributions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.circle_goals cg
    WHERE cg.id = circle_goal_contributions.circle_goal_id
    AND public.check_circle_membership(cg.circle_id, auth.uid())
  )
);

CREATE POLICY "Members can contribute"
ON public.circle_goal_contributions FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.circle_goals cg
    WHERE cg.id = circle_goal_contributions.circle_goal_id
    AND public.check_circle_membership(cg.circle_id, auth.uid())
  )
);
