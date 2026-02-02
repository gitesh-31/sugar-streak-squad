import { User } from "lucide-react";
import { Button } from "./ui/button";
import { StreakBadge } from "./StreakBadge";
import { NotificationsPopover } from "./NotificationsPopover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface HeaderProps {
  userName: string;
  streak: number;
  points: number;
  avatarUrl?: string | null;
  onProfileClick?: () => void;
}

export function Header({ userName, streak, points, avatarUrl, onProfileClick }: HeaderProps) {
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
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onProfileClick}
            className="relative"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
          <NotificationsPopover />
        </div>
      </div>
    </header>
  );
}
