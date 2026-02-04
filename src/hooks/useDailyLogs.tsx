import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { format, subDays } from "date-fns";

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  total_calories: number | null;
  total_protein: number | null;
  total_carbs: number | null;
  total_sugar: number | null;
  is_sugar_free: boolean | null;
  points_earned: number | null;
  created_at: string;
}

function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useDailyLogs() {
  const { user } = useAuth();
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [yesterdayLog, setYesterdayLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!user) {
      setTodayLog(null);
      setYesterdayLog(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const today = formatDateString(new Date());
    const yesterday = formatDateString(subDays(new Date(), 1));

    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .in("log_date", [today, yesterday])
      .order("log_date", { ascending: false });

    if (error) {
      console.error("Error fetching daily logs:", error);
    } else if (data) {
      const todayData = data.find((log) => log.log_date === today) || null;
      const yesterdayData = data.find((log) => log.log_date === yesterday) || null;
      setTodayLog(todayData);
      setYesterdayLog(yesterdayData);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const updateTodayLog = useCallback(
    async (stats: {
      calories: number;
      protein: number;
      carbs: number;
      sugar: number;
    }) => {
      if (!user) return;

      const today = formatDateString(new Date());
      // Sugar-free means under the limit (25g default), not zero
      const sugarLimit = 25;
      const isSugarFree = stats.sugar <= sugarLimit;
      const pointsEarned = isSugarFree ? 10 : 0;

      // Check if log exists for today
      const { data: existingLog } = await supabase
        .from("daily_logs")
        .select("id")
        .eq("user_id", user.id)
        .eq("log_date", today)
        .single();

      if (existingLog) {
        // Update existing log
        const { data, error } = await supabase
          .from("daily_logs")
          .update({
            total_calories: stats.calories,
            total_protein: stats.protein,
            total_carbs: stats.carbs,
            total_sugar: stats.sugar,
            is_sugar_free: isSugarFree,
            points_earned: pointsEarned,
          })
          .eq("id", existingLog.id)
          .select()
          .single();

        if (!error && data) {
          setTodayLog(data);
        }
      } else {
        // Insert new log
        const { data, error } = await supabase
          .from("daily_logs")
          .insert({
            user_id: user.id,
            log_date: today,
            total_calories: stats.calories,
            total_protein: stats.protein,
            total_carbs: stats.carbs,
            total_sugar: stats.sugar,
            is_sugar_free: isSugarFree,
            points_earned: pointsEarned,
          })
          .select()
          .single();

        if (!error && data) {
          setTodayLog(data);
        }
      }
    },
    [user]
  );

  return {
    todayLog,
    yesterdayLog,
    loading,
    refetch: fetchLogs,
    updateTodayLog,
  };
}
