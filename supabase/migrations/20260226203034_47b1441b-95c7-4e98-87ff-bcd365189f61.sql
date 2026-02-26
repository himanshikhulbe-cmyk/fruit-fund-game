
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS is_fun_fund boolean NOT NULL DEFAULT false;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS custom_fruit_values jsonb;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS custom_fruit_emojis jsonb;
ALTER TABLE public.fruits ADD COLUMN IF NOT EXISTS is_special boolean NOT NULL DEFAULT false;
ALTER TABLE public.fruits ADD COLUMN IF NOT EXISTS special_type text;
