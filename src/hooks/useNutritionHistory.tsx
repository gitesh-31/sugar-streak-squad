import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { subDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export interface DailyLogEntry {
  log_date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_sugar: number;
  is_sugar_free: boolean;
  points_earned: number;
}

export type TimeRange = "week" | "month";

function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useNutritionHistory(timeRange: TimeRange = "week") {
  const { user } = useAuth();
  const [history, setHistory] = useState<DailyLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    if (timeRange === "week") {
      startDate = startOfWeek(today, { weekStartsOn: 1 }); // Monday
      endDate = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
    } else {
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
    }

    const { data, error } = await supabase
      .from("daily_logs")
      .select("log_date, total_calories, total_protein, total_carbs, total_sugar, is_sugar_free, points_earned")
      .eq("user_id", user.id)
      .gte("log_date", formatDateString(startDate))
      .lte("log_date", formatDateString(endDate))
      .order("log_date", { ascending: true });

    if (error) {
      console.error("Error fetching nutrition history:", error);
      setHistory([]);
    } else {
      setHistory(data || []);
    }
    setLoading(false);
  }, [user, timeRange]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Calculate averages
  const averages = history.length > 0
    ? {
        calories: Math.round(history.reduce((sum, d) => sum + (d.total_calories || 0), 0) / history.length),
        protein: Math.round(history.reduce((sum, d) => sum + (d.total_protein || 0), 0) / history.length),
        carbs: Math.round(history.reduce((sum, d) => sum + (d.total_carbs || 0), 0) / history.length),
        sugar: Math.round(history.reduce((sum, d) => sum + (d.total_sugar || 0), 0) / history.length),
      }
    : { calories: 0, protein: 0, carbs: 0, sugar: 0 };

  const sugarFreeDays = history.filter((d) => d.is_sugar_free).length;

  return {
    history,
    loading,
    averages,
    sugarFreeDays,
    totalDays: history.length,
    refetch: fetchHistory,
  };
}
