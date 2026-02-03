-- Add nutrition goal columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS calorie_goal integer DEFAULT 2000,
ADD COLUMN IF NOT EXISTS protein_goal integer DEFAULT 120,
ADD COLUMN IF NOT EXISTS carbs_goal integer DEFAULT 250,
ADD COLUMN IF NOT EXISTS sugar_limit integer DEFAULT 25;