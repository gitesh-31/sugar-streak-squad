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
        {/* Avatar & Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onProfileClick}
            className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden ring-2 ring-primary/20 hover:ring-primary/50 transition-all"
          >
            <Avatar className="h-10 w-10 rounded-xl">
              <AvatarImage src={avatarUrl || undefined} className="object-cover" />
              <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-lg font-bold">
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
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

        {/* Notifications */}
        <div className="flex items-center">
          <NotificationsPopover />
        </div>
      </div>
    </header>
  );
}
