-- Add motivation_text column to goals
ALTER TABLE public.goals ADD COLUMN motivation_text text;

-- Create storage bucket for goal motivation images
INSERT INTO storage.buckets (id, name, public) VALUES ('goal-images', 'goal-images', true);

-- Create goal_images table
CREATE TABLE public.goal_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  image_path text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.goal_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for goal_images (via goal ownership)
CREATE POLICY "Users can view images of their goals"
  ON public.goal_images FOR SELECT
  USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_images.goal_id AND goals.user_id = auth.uid()));

CREATE POLICY "Users can insert images for their goals"
  ON public.goal_images FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_images.goal_id AND goals.user_id = auth.uid()));

CREATE POLICY "Users can delete images of their goals"
  ON public.goal_images FOR DELETE
  USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_images.goal_id AND goals.user_id = auth.uid()));

-- Storage policies for goal-images bucket
CREATE POLICY "Authenticated users can upload goal images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'goal-images' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view goal images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'goal-images');

CREATE POLICY "Users can delete their own goal images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'goal-images' AND auth.role() = 'authenticated');
