-- Create notifications table for storing Farcaster notification details
CREATE TABLE IF NOT EXISTS public.notification_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fid BIGINT NOT NULL,
    frame_name TEXT NOT NULL,
    details JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index for faster lookups and to prevent duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_details_fid_frame ON public.notification_details(fid, frame_name);

-- Enable Row Level Security (RLS)
ALTER TABLE public.notification_details ENABLE ROW LEVEL SECURITY;

-- Anyone can read notification details
CREATE POLICY "Allow public read access to notification_details" 
ON public.notification_details FOR SELECT USING (true);

-- Only the application can insert, update, or delete notification details
-- This is enforced through API keys, not RLS
