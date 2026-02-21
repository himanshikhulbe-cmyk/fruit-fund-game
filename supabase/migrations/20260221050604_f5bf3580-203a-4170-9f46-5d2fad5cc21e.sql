-- Add priority column to goals table (lower number = higher priority)
ALTER TABLE public.goals ADD COLUMN priority integer NOT NULL DEFAULT 0;
