import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// Get local date string in YYYY-MM-DD format
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Check if two dates are consecutive days
function areConsecutiveDays(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

// Check if date is today
function isToday(dateString: string): boolean {
  const today = getLocalDateString(new Date());
  return dateString === today;
}

// Check if date is yesterday
function isYesterday(dateString: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateString === getLocalDateString(yesterday);
}

export function useStreakCalculator() {
  const { user } = useAuth();

  const calculateAndUpdateStreak = useCallback(async () => {
    if (!user) return;

    try {
      // Get all food entries for this user, grouped by day
      const { data: entries, error } = await supabase
        .from("food_entries")
        .select("logged_at, sugar")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false });

      if (error) {
        console.error("Error fetching entries for streak:", error);
        return;
      }

      // Group entries by local date and check if each day is sugar-free
      const dailySugar = new Map<string, number>();
      
      entries?.forEach((entry) => {
        const date = getLocalDateString(new Date(entry.logged_at));
        const currentTotal = dailySugar.get(date) || 0;
        dailySugar.set(date, currentTotal + (entry.sugar || 0));
      });

      // Get unique dates sorted in descending order
      const dates = Array.from(dailySugar.keys()).sort((a, b) => 
        new Date(b).getTime() - new Date(a).getTime()
      );

      if (dates.length === 0) {
        // No entries, streak is 0
        await updateProfileStreak(0);
        return;
      }

      // Check if user has logged food today or yesterday
      const mostRecentDate = dates[0];
      if (!isToday(mostRecentDate) && !isYesterday(mostRecentDate)) {
        // More than a day gap, streak is broken
        await updateProfileStreak(0);
        return;
      }

      // Count consecutive sugar-free days starting from most recent
      let streak = 0;
      const sugarLimit = 25; // Maximum sugar allowed per day to maintain streak

      for (let i = 0; i < dates.length; i++) {
        const currentDate = dates[i];
        const totalSugar = dailySugar.get(currentDate) || 0;

        // Check if this day is sugar-free (under limit)
        if (totalSugar <= sugarLimit) {
          // Check if it's consecutive with the previous day
          if (i === 0) {
            streak = 1;
          } else {
            const previousDate = dates[i - 1];
            if (areConsecutiveDays(currentDate, previousDate)) {
              streak++;
            } else {
              break; // Gap in dates, stop counting
            }
          }
        } else {
          // Too much sugar, streak broken at this point
          break;
        }
      }

      await updateProfileStreak(streak);
    } catch (error) {
      console.error("Error calculating streak:", error);
    }
  }, [user]);

  const updateProfileStreak = async (newStreak: number) => {
    if (!user) return;

    // Get current profile to compare longest streak
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("current_streak, longest_streak, total_points")
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      console.error("Error fetching profile:", fetchError);
      return;
    }

    const currentStreak = profile?.current_streak || 0;
    const longestStreak = profile?.longest_streak || 0;
    let totalPoints = profile?.total_points || 0;

    // Calculate point changes
    if (newStreak > currentStreak) {
      // Streak increased - award points (+100 per day)
      const daysAdded = newStreak - currentStreak;
      totalPoints += daysAdded * 100;
    } else if (newStreak === 0 && currentStreak > 0) {
      // Streak broken - deduct points (-150 penalty)
      totalPoints = Math.max(0, totalPoints - 150);
    }

    const updates = {
      current_streak: newStreak,
      longest_streak: Math.max(longestStreak, newStreak),
      total_points: totalPoints,
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating streak:", error);
    }
  };

  // Calculate streak on mount and when user changes
  useEffect(() => {
    calculateAndUpdateStreak();
  }, [calculateAndUpdateStreak]);

  return { calculateAndUpdateStreak };
}
