import { useState } from "react";
import { format, parseISO } from "date-fns";
import { useNutritionHistory, TimeRange } from "@/hooks/useNutritionHistory";
import { Loader2, TrendingUp, Flame, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface NutritionHistoryChartProps {
  calorieGoal: number;
  sugarLimit: number;
}

export function NutritionHistoryChart({ calorieGoal, sugarLimit }: NutritionHistoryChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [chartType, setChartType] = useState<"calories" | "macros">("calories");
  const { history, loading, averages, sugarFreeDays, totalDays } = useNutritionHistory(timeRange);

  const chartData = history.map((entry) => ({
    date: format(parseISO(entry.log_date), timeRange === "week" ? "EEE" : "MMM d"),
    fullDate: format(parseISO(entry.log_date), "MMM d, yyyy"),
    calories: entry.total_calories || 0,
    protein: entry.total_protein || 0,
    carbs: entry.total_carbs || 0,
    sugar: entry.total_sugar || 0,
    isSugarFree: entry.is_sugar_free,
  }));

  if (loading) {
    return (
      <div className="rounded-2xl bg-card shadow-card p-6 flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card shadow-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Nutrition History
        </h3>
        <div className="flex gap-1">
          <Button
            variant={timeRange === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeRange("week")}
            className="text-xs"
          >
            Week
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeRange("month")}
            className="text-xs"
          >
            Month
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-primary/10 p-3 text-center">
          <p className="font-display text-xl font-bold text-primary">{averages.calories}</p>
          <p className="text-xs text-muted-foreground">Avg Calories</p>
        </div>
        <div className="rounded-lg bg-success/10 p-3 text-center">
          <p className="font-display text-xl font-bold text-success">{sugarFreeDays}</p>
          <p className="text-xs text-muted-foreground">Sugar-Free Days</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3 text-center">
          <p className="font-display text-xl font-bold text-foreground">{totalDays}</p>
          <p className="text-xs text-muted-foreground">Days Logged</p>
        </div>
      </div>

      {/* Chart Type Toggle */}
      <div className="flex gap-1 justify-center">
        <Button
          variant={chartType === "calories" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setChartType("calories")}
          className="text-xs"
        >
          <Flame className="h-3 w-3 mr-1" />
          Calories
        </Button>
        <Button
          variant={chartType === "macros" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setChartType("macros")}
          className="text-xs"
        >
          <Target className="h-3 w-3 mr-1" />
          Macros
        </Button>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "calories" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }} 
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  className="text-muted-foreground"
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ""}
                  formatter={(value: number, name: string) => [
                    `${value} ${name === "calories" ? "kcal" : "g"}`,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                />
                <Bar 
                  dataKey="calories" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }} 
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  className="text-muted-foreground"
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ""}
                  formatter={(value: number, name: string) => [`${value}g`, name.charAt(0).toUpperCase() + name.slice(1)]}
                />
                <Line 
                  type="monotone" 
                  dataKey="protein" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="carbs" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--accent))", strokeWidth: 0, r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sugar" 
                  stroke="hsl(var(--warning))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--warning))", strokeWidth: 0, r: 3 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No data for this period yet</p>
        </div>
      )}

      {/* Legend for macros chart */}
      {chartType === "macros" && chartData.length > 0 && (
        <div className="flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Protein</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">Carbs</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-muted-foreground">Sugar</span>
          </div>
        </div>
      )}
    </div>
  );
}
