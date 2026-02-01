import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { format } from "date-fns";

export interface FoodEntry {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  sugar: number;
  image_url: string | null;
  logged_at: string;
  created_at: string;
}

export function useFoodEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodaysEntries = async () => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const today = format(new Date(), "yyyy-MM-dd");
    
    const { data, error } = await supabase
      .from("food_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_at", `${today}T00:00:00`)
      .lte("logged_at", `${today}T23:59:59`)
      .order("logged_at", { ascending: false });

    if (error) {
      console.error("Error fetching food entries:", error);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTodaysEntries();
  }, [user]);

  const addEntry = async (entry: Omit<FoodEntry, "id" | "user_id" | "created_at">) => {
    if (!user) return { error: new Error("Not authenticated"), data: null };

    const { data, error } = await supabase
      .from("food_entries")
      .insert({
        ...entry,
        user_id: user.id,
      })
      .select()
      .single();

    if (!error && data) {
      setEntries((prev) => [data, ...prev]);
    }

    return { error, data };
  };

  const deleteEntry = async (id: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("food_entries")
      .delete()
      .eq("id", id);

    if (!error) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }

    return { error };
  };

  const getTodayStats = () => {
    return entries.reduce(
      (acc, entry) => ({
        calories: acc.calories + (entry.calories || 0),
        protein: acc.protein + (entry.protein || 0),
        carbs: acc.carbs + (entry.carbs || 0),
        sugar: acc.sugar + (entry.sugar || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, sugar: 0 }
    );
  };

  return { 
    entries, 
    loading, 
    addEntry, 
    deleteEntry, 
    refetch: fetchTodaysEntries,
    getTodayStats 
  };
}
