
-- Circle members table (created first so circles RLS can reference it)
CREATE TABLE public.circle_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID NOT NULL,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'Saver',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(circle_id, user_id)
);

-- Circles table
CREATE TABLE public.circles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE DEFAULT substring(gen_random_uuid()::text from 1 for 8),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add FK from circle_members to circles
ALTER TABLE public.circle_members ADD CONSTRAINT circle_members_circle_id_fkey FOREIGN KEY (circle_id) REFERENCES public.circles(id) ON DELETE CASCADE;

-- Circles RLS
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View circles user belongs to"
ON public.circles FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.circle_members WHERE circle_members.circle_id = circles.id AND circle_members.user_id = auth.uid())
  OR circles.created_by = auth.uid()
);

CREATE POLICY "Create circles"
ON public.circles FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Update own circles"
ON public.circles FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Delete own circles"
ON public.circles FOR DELETE
USING (auth.uid() = created_by);

-- Circle members RLS
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View circle members"
ON public.circle_members FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_members.circle_id AND cm.user_id = auth.uid())
);

CREATE POLICY "Join circles"
ON public.circle_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Leave circles"
ON public.circle_members FOR DELETE
USING (auth.uid() = user_id);

-- Circle deposits
CREATE TABLE public.circle_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  deposited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.circle_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View circle deposits"
ON public.circle_deposits FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_deposits.circle_id AND cm.user_id = auth.uid())
);

CREATE POLICY "Log circle deposits"
ON public.circle_deposits FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_deposits.circle_id AND cm.user_id = auth.uid())
);

-- Mystery/special fruits columns
ALTER TABLE public.fruits ADD COLUMN IF NOT EXISTS is_special boolean NOT NULL DEFAULT false;
ALTER TABLE public.fruits ADD COLUMN IF NOT EXISTS special_type TEXT;
