import { Crown, Medal, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { StreakBadge } from "./StreakBadge";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  rank: number;
  change: "up" | "down" | "same";
}

interface LeaderboardCardProps {
  users: LeaderboardUser[];
  currentUserId?: string;
  className?: string;
}

export function LeaderboardCard({ users, currentUserId, className }: LeaderboardCardProps) {
  return (
    <div className={cn("rounded-2xl bg-card shadow-card overflow-hidden", className)}>
      <div className="p-4 border-b border-border">
        <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <Crown className="w-5 h-5 text-rank-gold" />
          Leaderboard
        </h2>
      </div>
      <div className="divide-y divide-border">
        {users.map((user, index) => (
          <LeaderboardRow
            key={user.id}
            user={user}
            isCurrentUser={user.id === currentUserId}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

interface LeaderboardRowProps {
  user: LeaderboardUser;
  isCurrentUser: boolean;
  index: number;
}

function LeaderboardRow({ user, isCurrentUser, index }: LeaderboardRowProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-rank-gold fill-rank-gold/20" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-rank-silver" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-rank-bronze" />;
    return <span className="w-5 text-center text-sm font-semibold text-muted-foreground">{rank}</span>;
  };

  const getChangeIcon = (change: "up" | "down" | "same") => {
    if (change === "up") return <TrendingUp className="w-4 h-4 text-success" />;
    if (change === "down") return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 transition-colors",
        isCurrentUser && "bg-primary/5",
        "animate-slide-up"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Rank */}
      <div className="flex w-8 justify-center">{getRankIcon(user.rank)}</div>

      {/* Avatar */}
      <div className="relative">
        <img
          src={user.avatar}
          alt={user.name}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
        />
        {user.rank <= 3 && (
          <div
            className={cn(
              "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card",
              user.rank === 1 && "bg-rank-gold",
              user.rank === 2 && "bg-rank-silver",
              user.rank === 3 && "bg-rank-bronze"
            )}
          />
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-medium truncate",
            isCurrentUser ? "text-primary" : "text-foreground"
          )}
        >
          {user.name}
          {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
        </p>
        <StreakBadge days={user.streak} size="sm" showLabel={false} />
      </div>

      {/* Points & Change */}
      <div className="flex items-center gap-2">
        <span className="font-display font-bold text-foreground">{user.points.toLocaleString()}</span>
        {getChangeIcon(user.change)}
      </div>
    </div>
  );
}
