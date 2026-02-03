import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const PRESENCE_UPDATE_INTERVAL = 60000; // Update every 1 minute
const ACTIVE_THRESHOLD_MINUTES = 5; // Consider active if seen within 5 minutes

export function usePresence() {
  const { user } = useAuth();

  const updatePresence = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({ last_active: new Date().toISOString() })
        .eq("user_id", user.id);
    } catch (error) {
      console.error("Error updating presence:", error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Update presence immediately on mount
    updatePresence();

    // Set up interval to update presence
    const interval = setInterval(updatePresence, PRESENCE_UPDATE_INTERVAL);

    // Update on user activity
    const handleActivity = () => {
      updatePresence();
    };

    window.addEventListener("focus", handleActivity);
    window.addEventListener("click", handleActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleActivity);
      window.removeEventListener("click", handleActivity);
    };
  }, [user, updatePresence]);

  return { updatePresence };
}

export function isUserActive(lastActive: string | null): boolean {
  if (!lastActive) return false;
  
  const lastActiveDate = new Date(lastActive);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60);
  
  return diffMinutes <= ACTIVE_THRESHOLD_MINUTES;
}
