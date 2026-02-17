
-- Goals table
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount INTEGER NOT NULL DEFAULT 1000,
  current_amount INTEGER NOT NULL DEFAULT 0,
  icon TEXT NOT NULL DEFAULT '🎯',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fruits table
CREATE TABLE public.fruits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  tier INTEGER NOT NULL DEFAULT 1,
  value INTEGER NOT NULL DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fruits ENABLE ROW LEVEL SECURITY;

-- Goals policies
CREATE POLICY "Users can view their own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- Fruits policies (via goal ownership)
CREATE POLICY "Users can view fruits of their goals" ON public.fruits FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = fruits.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY "Users can create fruits for their goals" ON public.fruits FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = fruits.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY "Users can update fruits of their goals" ON public.fruits FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = fruits.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY "Users can delete fruits of their goals" ON public.fruits FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = fruits.goal_id AND goals.user_id = auth.uid()));
