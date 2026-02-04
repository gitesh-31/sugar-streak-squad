import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// Get local date string in YYYY-MM-DD format
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

// Parse date string and add days
function addDays(dateString: string, days: number): string {
  const date = new Date(dateString + "T00:00:00");
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

export function useStreakCalculator() {
  const { user } = useAuth();

  const calculateAndUpdateStreak = useCallback(async () => {
    if (!user) return;

    try {
      // First, ensure all historical food entries have daily_logs
      await syncDailyLogs(user.id);

      // Get all daily_logs for this user, sorted by date descending
      const { data: dailyLogs, error } = await supabase
        .from("daily_logs")
        .select("log_date, total_sugar, is_sugar_free")
        .eq("user_id", user.id)
        .order("log_date", { ascending: false });

      if (error) {
        console.error("Error fetching daily logs for streak:", error);
        return;
      }

      if (!dailyLogs || dailyLogs.length === 0) {
        await updateProfileStreak(user.id, 0);
        return;
      }

      // Check if user has logged today or yesterday
      const mostRecentDate = dailyLogs[0].log_date;
      if (!isToday(mostRecentDate) && !isYesterday(mostRecentDate)) {
        // More than a day gap since last log, streak is broken
        await updateProfileStreak(user.id, 0);
        return;
      }

      // Count consecutive sugar-free days
      // A day is sugar-free if total_sugar <= sugar limit (default 25g)
      const sugarLimit = 25;
      let streak = 0;
      let expectedDate = mostRecentDate;

      for (const log of dailyLogs) {
        // Check if this is the expected date in sequence
        if (log.log_date !== expectedDate) {
          // Gap in dates - streak ends
          break;
        }

        const totalSugar = log.total_sugar || 0;
        const isSugarFree = totalSugar <= sugarLimit;

        if (isSugarFree) {
          streak++;
          // Next expected date is one day before
          expectedDate = addDays(log.log_date, -1);
        } else {
          // Day with too much sugar - streak ends
          break;
        }
      }

      await updateProfileStreak(user.id, streak);
    } catch (error) {
      console.error("Error calculating streak:", error);
    }
  }, [user]);

  return { calculateAndUpdateStreak };
}

// Sync daily_logs from food_entries for all historical dates
async function syncDailyLogs(userId: string) {
  // Get all food entries grouped by date
  const { data: entries, error } = await supabase
    .from("food_entries")
    .select("logged_at, calories, protein, carbs, sugar")
    .eq("user_id", userId);

  if (error || !entries) return;

  // Group entries by date
  const dailyTotals = new Map<string, { calories: number; protein: number; carbs: number; sugar: number }>();

  entries.forEach((entry) => {
    const date = getLocalDateString(new Date(entry.logged_at));
    const current = dailyTotals.get(date) || { calories: 0, protein: 0, carbs: 0, sugar: 0 };
    dailyTotals.set(date, {
      calories: current.calories + (entry.calories || 0),
      protein: current.protein + (entry.protein || 0),
      carbs: current.carbs + (entry.carbs || 0),
      sugar: current.sugar + (entry.sugar || 0),
    });
  });

  // Get existing daily_logs
  const { data: existingLogs } = await supabase
    .from("daily_logs")
    .select("log_date")
    .eq("user_id", userId);

  const existingDates = new Set(existingLogs?.map((l) => l.log_date) || []);

  // Insert missing daily_logs
  const sugarLimit = 25;
  for (const [date, totals] of dailyTotals) {
    if (!existingDates.has(date)) {
      const isSugarFree = totals.sugar <= sugarLimit;
      await supabase.from("daily_logs").insert({
        user_id: userId,
        log_date: date,
        total_calories: totals.calories,
        total_protein: totals.protein,
        total_carbs: totals.carbs,
        total_sugar: totals.sugar,
        is_sugar_free: isSugarFree,
        points_earned: isSugarFree ? 10 : 0,
      });
    }
  }
}

async function updateProfileStreak(userId: string, newStreak: number) {
  // Get current profile to compare longest streak
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak, total_points")
    .eq("user_id", userId)
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
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating streak:", error);
  }
}
