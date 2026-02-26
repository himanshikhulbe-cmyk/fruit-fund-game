
-- 1) Redeemed codes table
CREATE TABLE public.redeemed_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL,
  reward_type text NOT NULL,
  reward_value text NOT NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, code)
);
ALTER TABLE public.redeemed_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own codes" ON public.redeemed_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can redeem codes" ON public.redeemed_codes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2) Tokens table (for Fruit Market)
CREATE TABLE public.user_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  goal_id uuid,
  amount integer NOT NULL DEFAULT 0,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tokens" ON public.user_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can earn tokens" ON public.user_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3) Market inventory table
CREATE TABLE public.market_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_type text NOT NULL,
  item_name text NOT NULL,
  item_emoji text NOT NULL,
  purchased_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.market_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own inventory" ON public.market_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can purchase items" ON public.market_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4) Wishlist table
CREATE TABLE public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  link_url text,
  goal_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own wishlists" ON public.wishlists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5) Draft goals table
CREATE TABLE public.draft_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text,
  target_amount integer,
  icon text DEFAULT '🎯',
  deadline date,
  priority integer DEFAULT 1,
  motivation_text text,
  is_fun_fund boolean DEFAULT false,
  goal_type text DEFAULT 'flexible',
  goal_mode text DEFAULT 'flexible',
  custom_fruit_values jsonb,
  custom_fruit_emojis jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.draft_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own drafts" ON public.draft_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6) Add goal_type and goal_mode columns to goals
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS goal_type text NOT NULL DEFAULT 'flexible';
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS goal_mode text NOT NULL DEFAULT 'flexible';

-- 7) Circle shared goals table
CREATE TABLE public.circle_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_amount integer NOT NULL DEFAULT 1000,
  current_amount integer NOT NULL DEFAULT 0,
  icon text NOT NULL DEFAULT '🎯',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deadline date
);
ALTER TABLE public.circle_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Circle members can view goals" ON public.circle_goals FOR SELECT USING (
  EXISTS (SELECT 1 FROM circle_members cm WHERE cm.circle_id = circle_goals.circle_id AND cm.user_id = auth.uid())
  OR created_by = auth.uid()
);
CREATE POLICY "Circle members can create goals" ON public.circle_goals FOR INSERT WITH CHECK (
  auth.uid() = created_by AND EXISTS (SELECT 1 FROM circle_members cm WHERE cm.circle_id = circle_goals.circle_id AND cm.user_id = auth.uid())
);
CREATE POLICY "Creator can update goals" ON public.circle_goals FOR UPDATE USING (auth.uid() = created_by);

-- 8) Circle goal contributions
CREATE TABLE public.circle_goal_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_goal_id uuid NOT NULL REFERENCES public.circle_goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  contributed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.circle_goal_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view contributions" ON public.circle_goal_contributions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM circle_goals cg
    JOIN circle_members cm ON cm.circle_id = cg.circle_id
    WHERE cg.id = circle_goal_contributions.circle_goal_id AND cm.user_id = auth.uid()
  )
);
CREATE POLICY "Members can contribute" ON public.circle_goal_contributions FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM circle_goals cg
    JOIN circle_members cm ON cm.circle_id = cg.circle_id
    WHERE cg.id = circle_goal_contributions.circle_goal_id AND cm.user_id = auth.uid()
  )
);
