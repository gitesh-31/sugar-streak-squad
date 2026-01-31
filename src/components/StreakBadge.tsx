import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  days: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function StreakBadge({ days, size = "md", showLabel = true, className }: StreakBadgeProps) {
  const sizeClasses = {
    sm: "text-sm gap-1",
    md: "text-lg gap-1.5",
    lg: "text-2xl gap-2",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const isActive = days > 0;

  return (
    <div
      className={cn(
        "inline-flex items-center font-display font-bold",
        sizeClasses[size],
        className
      )}
    >
      <div className={cn("relative", isActive && "animate-flame")}>
        <Flame
          className={cn(
            iconSizes[size],
            isActive ? "text-streak-flame fill-streak-flame" : "text-muted-foreground"
          )}
        />
        {isActive && (
          <div className="absolute inset-0 blur-md opacity-50">
            <Flame className={cn(iconSizes[size], "text-streak-glow fill-streak-glow")} />
          </div>
        )}
      </div>
      <span className={cn(isActive ? "text-gradient-streak" : "text-muted-foreground")}>
        {days}
      </span>
      {showLabel && (
        <span className={cn("font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
          {days === 1 ? "day" : "days"}
        </span>
      )}
    </div>
  );
}
