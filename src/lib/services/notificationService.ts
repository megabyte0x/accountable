import type { FrameNotificationDetails } from "@farcaster/frame-sdk";
import { supabase } from "../supabase/supabase-client";

// In-memory fallback storage for development or when Supabase is not available
const localStore = new Map<string, FrameNotificationDetails>();

// Use Supabase if configured, otherwise use in-memory
const useSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getUserNotificationDetailsKey(fid: number): string {
  return `${process.env.NEXT_PUBLIC_FRAME_NAME}:user:${fid}`;
}

export async function getUserNotificationDetails(
  fid: number
): Promise<FrameNotificationDetails | null> {
  if (useSupabase) {
    const { data, error } = await supabase
      .from('notification_details')
      .select('details')
      .eq('fid', fid)
      .eq('frame_name', process.env.NEXT_PUBLIC_FRAME_NAME || '')
      .single();

    if (error || !data) {
      return null;
    }

    return data.details as FrameNotificationDetails;
  }

  // Fallback to in-memory storage
  const key = getUserNotificationDetailsKey(fid);
  return localStore.get(key) || null;
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: FrameNotificationDetails
): Promise<void> {
  if (useSupabase) {
    const { error } = await supabase
      .from('notification_details')
      .upsert({
        fid,
        frame_name: process.env.NEXT_PUBLIC_FRAME_NAME || '',
        details: notificationDetails,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'fid, frame_name'
      });

    if (error) {
      console.error('Error storing notification details:', error);
    }
  } else {
    // Fallback to in-memory storage
    const key = getUserNotificationDetailsKey(fid);
    localStore.set(key, notificationDetails);
  }
}

export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  if (useSupabase) {
    const { error } = await supabase
      .from('notification_details')
      .delete()
      .eq('fid', fid)
      .eq('frame_name', process.env.NEXT_PUBLIC_FRAME_NAME || '');

    if (error) {
      console.error('Error deleting notification details:', error);
    }
  } else {
    // Fallback to in-memory storage
    const key = getUserNotificationDetailsKey(fid);
    localStore.delete(key);
  }
}
