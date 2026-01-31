import { useState } from "react";
import { Trophy, Crown, Medal, Star, Zap, Shield, Award, Flame, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { StreakBadge } from "@/components/StreakBadge";

interface RankUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  rank: number;
  change: "up" | "down" | "same";
  badges: string[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: typeof Trophy;
  color: string;
  bgColor: string;
  requirement: string;
  unlocked: boolean;
}

const mockLeaderboard: RankUser[] = [
  { id: "user-2", name: "Sarah Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", points: 3200, streak: 21, rank: 1, change: "same", badges: ["elite", "warrior", "champion"] },
  { id: "user-3", name: "Mike Torres", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike", points: 2890, streak: 18, rank: 2, change: "up", badges: ["warrior", "dedicated"] },
  { id: "user-1", name: "Alex Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", points: 2450, streak: 12, rank: 3, change: "down", badges: ["dedicated", "starter"] },
  { id: "user-4", name: "Emma Wilson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", points: 2100, streak: 9, rank: 4, change: "up", badges: ["starter"] },
  { id: "user-5", name: "James Lee", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James", points: 1850, streak: 5, rank: 5, change: "down", badges: ["starter"] },
  { id: "user-6", name: "Olivia Brown", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia", points: 1720, streak: 7, rank: 6, change: "same", badges: ["starter"] },
  { id: "user-7", name: "Liam Davis", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam", points: 1580, streak: 4, rank: 7, change: "up", badges: [] },
  { id: "user-8", name: "Sophia Miller", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia", points: 1420, streak: 3, rank: 8, change: "down", badges: [] },
];

const allBadges: Badge[] = [
  {
    id: "elite",
    name: "Elite Sugar Controller",
    description: "Master of sugar-free living",
    icon: Crown,
    color: "text-rank-gold",
    bgColor: "bg-rank-gold/20",
    requirement: "30+ day streak",
    unlocked: false,
  },
  {
    id: "warrior",
    name: "Sugar Warrior",
    description: "Battle-hardened against cravings",
    icon: Shield,
    color: "text-purple-500",
    bgColor: "bg-purple-500/20",
    requirement: "21+ day streak",
    unlocked: false,
  },
  {
    id: "champion",
    name: "Streak Champion",
    description: "Unbreakable dedication",
    icon: Trophy,
    color: "text-primary",
    bgColor: "bg-primary/20",
    requirement: "Top 3 in leaderboard",
    unlocked: false,
  },
  {
    id: "dedicated",
    name: "Dedicated Tracker",
    description: "Consistent daily logging",
    icon: Zap,
    color: "text-accent",
    bgColor: "bg-accent/20",
    requirement: "14+ day streak",
    unlocked: true,
  },
  {
    id: "starter",
    name: "Rising Star",
    description: "Beginning the journey",
    icon: Star,
    color: "text-blue-500",
    bgColor: "bg-blue-500/20",
    requirement: "7+ day streak",
    unlocked: true,
  },
  {
    id: "community",
    name: "Community Leader",
    description: "Inspiring others to join",
    icon: Award,
    color: "text-pink-500",
    bgColor: "bg-pink-500/20",
    requirement: "Invite 5 friends",
    unlocked: false,
  },
];

type Tab = "leaderboard" | "badges";

interface RanksPageProps {
  onBack?: () => void;
}

export function RanksPage({ onBack }: RanksPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("leaderboard");
  const currentUserId = "user-1";

  // Calculate user's unlocked badges based on streak
  const userBadges = allBadges.map((badge) => ({
    ...badge,
    unlocked: mockLeaderboard.find((u) => u.id === currentUserId)?.badges.includes(badge.id) || false,
  }));

  return (
    <div className="min-h-screen gradient-hero pb-24">
      <div className="container px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Rankings & Rewards
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Climb the ranks and earn exclusive badges
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-xl bg-muted/50">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all",
              activeTab === "leaderboard"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all",
              activeTab === "badges"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Badges
          </button>
        </div>

        {activeTab === "leaderboard" ? (
          <>
            {/* Top 3 Podium */}
            <section className="relative overflow-hidden rounded-2xl gradient-streak p-6">
              <h2 className="font-display text-lg font-bold text-accent-foreground mb-6 text-center">
                🏆 Today's Champions
              </h2>
              <div className="flex items-end justify-center gap-4">
                {/* 2nd Place */}
                <PodiumPlace user={mockLeaderboard[1]} place={2} />
                {/* 1st Place */}
                <PodiumPlace user={mockLeaderboard[0]} place={1} />
                {/* 3rd Place */}
                <PodiumPlace user={mockLeaderboard[2]} place={3} currentUserId={currentUserId} />
              </div>
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            </section>

            {/* Full Leaderboard */}
            <section className="rounded-2xl bg-card shadow-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Full Rankings
                </h2>
              </div>
              <div className="divide-y divide-border">
                {mockLeaderboard.map((user, index) => (
                  <LeaderboardRow
                    key={user.id}
                    user={user}
                    isCurrentUser={user.id === currentUserId}
                    index={index}
                  />
                ))}
              </div>
            </section>

            {/* Points Explanation */}
            <section className="rounded-2xl bg-card shadow-card p-4">
              <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-accent" />
                How Points Work
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Each sugar-free day</span>
                  <span className="text-success font-medium">+100 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>7-day streak bonus</span>
                  <span className="text-success font-medium">+200 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Breaking streak</span>
                  <span className="text-destructive font-medium">-150 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Logging all meals</span>
                  <span className="text-success font-medium">+50 pts</span>
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Your Badges */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                Your Badges
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {userBadges
                  .filter((b) => b.unlocked)
                  .map((badge, index) => (
                    <BadgeCard key={badge.id} badge={badge} index={index} />
                  ))}
              </div>
              {userBadges.filter((b) => b.unlocked).length === 0 && (
                <div className="rounded-2xl bg-card shadow-card p-6 text-center">
                  <Award className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Keep your streak going to unlock badges!
                  </p>
                </div>
              )}
            </section>

            {/* Locked Badges */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                Badges to Unlock
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {userBadges
                  .filter((b) => !b.unlocked)
                  .map((badge, index) => (
                    <BadgeCard key={badge.id} badge={badge} locked index={index} />
                  ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

interface PodiumPlaceProps {
  user: RankUser;
  place: 1 | 2 | 3;
  currentUserId?: string;
}

function PodiumPlace({ user, place, currentUserId }: PodiumPlaceProps) {
  const heights = { 1: "h-24", 2: "h-16", 3: "h-12" };
  const sizes = { 1: "w-16 h-16", 2: "w-12 h-12", 3: "w-12 h-12" };
  const colors = {
    1: "bg-rank-gold",
    2: "bg-rank-silver",
    3: "bg-rank-bronze",
  };

  return (
    <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: `${place * 100}ms` }}>
      <div className="relative mb-2">
        <img
          src={user.avatar}
          alt={user.name}
          className={cn(sizes[place], "rounded-full object-cover ring-2 ring-white/30")}
        />
        {place === 1 && (
          <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 text-rank-gold drop-shadow-lg" />
        )}
      </div>
      <p className={cn(
        "font-medium text-accent-foreground text-sm truncate max-w-20",
        user.id === currentUserId && "text-primary"
      )}>
        {user.name.split(" ")[0]}
      </p>
      <p className="text-xs text-accent-foreground/70">{user.points.toLocaleString()} pts</p>
      <div className={cn("mt-2 w-16 rounded-t-lg", heights[place], colors[place])} />
    </div>
  );
}

interface LeaderboardRowProps {
  user: RankUser;
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
        "flex items-center gap-3 p-4 transition-colors animate-slide-up",
        isCurrentUser && "bg-primary/5"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex w-8 justify-center">{getRankIcon(user.rank)}</div>
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
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium truncate", isCurrentUser ? "text-primary" : "text-foreground")}>
          {user.name}
          {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
        </p>
        <div className="flex items-center gap-2">
          <StreakBadge days={user.streak} size="sm" showLabel={false} />
          {user.badges.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {user.badges.length} badge{user.badges.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-display font-bold text-foreground">{user.points.toLocaleString()}</span>
        {getChangeIcon(user.change)}
      </div>
    </div>
  );
}

interface BadgeCardProps {
  badge: Badge;
  locked?: boolean;
  index: number;
}

function BadgeCard({ badge, locked, index }: BadgeCardProps) {
  const Icon = badge.icon;

  return (
    <div
      className={cn(
        "rounded-2xl p-4 transition-all animate-slide-up",
        locked
          ? "bg-muted/50 opacity-60"
          : "bg-card shadow-card"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
          locked ? "bg-muted" : badge.bgColor
        )}
      >
        <Icon className={cn("w-6 h-6", locked ? "text-muted-foreground" : badge.color)} />
      </div>
      <h3 className={cn("font-medium text-sm", locked ? "text-muted-foreground" : "text-foreground")}>
        {badge.name}
      </h3>
      <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
      <p className={cn("text-xs mt-2 font-medium", locked ? "text-muted-foreground" : "text-primary")}>
        {badge.requirement}
      </p>
    </div>
  );
}

export default RanksPage;
