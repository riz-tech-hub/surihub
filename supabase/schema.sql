-- ====================================================================
-- SuriHub Database Schema & Row Level Security (RLS) Policies
-- Copy and paste this script directly into your Supabase SQL Editor!
-- ====================================================================

-- 1. Create Pantry Items Table
CREATE TABLE IF NOT EXISTS public.pantry_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Bahan Basah', 'Bahan Kering', 'Pes/Rempah')),
    quantity TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create Meal Plans Table
CREATE TABLE IF NOT EXISTS public.meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad')),
    recipe_name TEXT,
    prep_notes TEXT,
    completed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Create Cleaning Tasks Table
CREATE TABLE IF NOT EXISTS public.cleaning_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    zone TEXT NOT NULL CHECK (zone IN ('Dapur', 'Ruang Tamu', 'Bilik Air', 'Bilik Tidur')),
    task_name TEXT NOT NULL,
    is_done BOOLEAN DEFAULT false NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ====================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaning_tasks ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- CREATE RLS POLICIES FOR PANTRY ITEMS
-- ====================================================================
CREATE POLICY "Users can view their own pantry items"
    ON public.pantry_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pantry items"
    ON public.pantry_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pantry items"
    ON public.pantry_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pantry items"
    ON public.pantry_items FOR DELETE
    USING (auth.uid() = user_id);

-- ====================================================================
-- CREATE RLS POLICIES FOR MEAL PLANS
-- ====================================================================
CREATE POLICY "Users can view their own meal plans"
    ON public.meal_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal plans"
    ON public.meal_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans"
    ON public.meal_plans FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans"
    ON public.meal_plans FOR DELETE
    USING (auth.uid() = user_id);

-- ====================================================================
-- CREATE RLS POLICIES FOR CLEANING TASKS
-- ====================================================================
CREATE POLICY "Users can view their own cleaning tasks"
    ON public.cleaning_tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cleaning tasks"
    ON public.cleaning_tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cleaning tasks"
    ON public.cleaning_tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cleaning tasks"
    ON public.cleaning_tasks FOR DELETE
    USING (auth.uid() = user_id);
