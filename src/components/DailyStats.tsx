import { cn } from "@/lib/utils";

interface DailyStatsProps {
  calories: { current: number; goal: number };
  protein: { current: number; goal: number };
  carbs: { current: number; goal: number };
  sugar: { current: number; limit: number };
  className?: string;
}

export function DailyStats({ calories, protein, carbs, sugar, className }: DailyStatsProps) {
  return (
    <div className={cn("rounded-2xl bg-card shadow-card p-5", className)}>
      <h2 className="font-display text-lg font-bold text-foreground mb-4">Today's Progress</h2>
      <div className="grid grid-cols-2 gap-4">
        <StatRing
          label="Calories"
          current={calories.current}
          goal={calories.goal}
          unit="kcal"
          color="primary"
        />
        <StatRing
          label="Sugar"
          current={sugar.current}
          goal={sugar.limit}
          unit="g"
          color={sugar.current > 0 ? "warning" : "success"}
          inverted
        />
        <StatBar
          label="Protein"
          current={protein.current}
          goal={protein.goal}
          unit="g"
          color="primary"
        />
        <StatBar
          label="Carbs"
          current={carbs.current}
          goal={carbs.goal}
          unit="g"
          color="secondary"
        />
      </div>
    </div>
  );
}

interface StatRingProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: "primary" | "success" | "warning";
  inverted?: boolean;
}

function StatRing({ label, current, goal, unit, color, inverted }: StatRingProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    primary: "stroke-primary",
    success: "stroke-success",
    warning: "stroke-warning",
  };

  const isOver = inverted ? current > 0 : current > goal;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-24">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-secondary"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(colorClasses[color], "transition-all duration-500")}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-display text-xl font-bold", isOver && inverted && "text-warning")}>
            {current}
          </span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">
        {inverted ? `limit ${goal}${unit}` : `of ${goal}${unit}`}
      </span>
    </div>
  );
}

interface StatBarProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: "primary" | "secondary";
}

function StatBar({ label, current, goal, unit, color }: StatBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);

  const bgClasses = {
    primary: "bg-primary",
    secondary: "bg-muted-foreground",
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">
          {current}/{goal}{unit}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all duration-500", bgClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
