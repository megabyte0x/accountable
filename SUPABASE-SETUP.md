# Supabase Setup for Accountable App

This document outlines the steps needed to set up Supabase for the Accountable app.

## 1. Create a Supabase Project

1. Sign up or log in to [Supabase](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key from the project API settings

## 2. Add Environment Variables

Add the following to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Set Up Database Tables

Run the following SQL in the Supabase SQL Editor to create the necessary tables and policies:

```sql
-- Create extension for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    stake_amount TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create supporters table
CREATE TABLE IF NOT EXISTS public.supporters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_address TEXT NOT NULL,
    user_name TEXT,
    user_avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_goals_address ON public.goals(address);
CREATE INDEX IF NOT EXISTS idx_supporters_goal_id ON public.supporters(goal_id);
CREATE INDEX IF NOT EXISTS idx_supporters_user_id ON public.supporters(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone can read goals
CREATE POLICY "Allow public read access to goals" 
ON public.goals FOR SELECT USING (true);

-- Only the creator can update or delete their goals
CREATE POLICY "Allow update for goal owner" 
ON public.goals FOR UPDATE USING (auth.uid()::text = address);

CREATE POLICY "Allow delete for goal owner" 
ON public.goals FOR DELETE USING (auth.uid()::text = address);

-- Authenticated users can insert goals
CREATE POLICY "Allow authenticated users to create goals" 
ON public.goals FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Anyone can read supporters
CREATE POLICY "Allow public read access to supporters" 
ON public.supporters FOR SELECT USING (true);

-- Only authenticated users can create supporters
CREATE POLICY "Allow authenticated users to create supporters" 
ON public.supporters FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only goal owners can update or delete supporters
CREATE POLICY "Allow update for goal owners only" 
ON public.supporters FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.goals WHERE id = supporters.goal_id AND address = auth.uid()::text));

CREATE POLICY "Allow delete for goal owners only" 
ON public.supporters FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.goals WHERE id = supporters.goal_id AND address = auth.uid()::text));
```

## 4. Configure Authentication (Optional)

If you want to use Supabase Authentication:

1. Go to the Authentication settings in your Supabase project
2. Configure email auth, social logins, or other auth methods as needed
3. Update the frontend code to use Supabase auth

## 5. Testing Your Setup

After completing the setup, you should be able to:

1. Create goals
2. Add supporters to goals
3. Complete or fail goals
4. View all goals for a user

All data will now be stored in Supabase rather than localStorage. 