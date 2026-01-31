import { Bell, Users } from "lucide-react";
import { Button } from "./ui/button";
import { StreakBadge } from "./StreakBadge";

interface HeaderProps {
  userName: string;
  streak: number;
  points: number;
}

export function Header({ userName, streak, points }: HeaderProps) {
  const firstName = userName.split(" ")[0];

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/50">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo & Greeting */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <span className="text-lg font-bold text-primary-foreground">C</span>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">
              Hey, {firstName}! 👋
            </h1>
            <div className="flex items-center gap-2">
              <StreakBadge days={streak} size="sm" />
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs font-medium text-muted-foreground">
                {points.toLocaleString()} pts
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Users className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
          </Button>
        </div>
      </div>
    </header>
  );
}
