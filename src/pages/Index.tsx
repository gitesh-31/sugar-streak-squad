import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { DailyStats } from "@/components/DailyStats";
import { FoodCard } from "@/components/FoodCard";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { AddFoodButton } from "@/components/AddFoodButton";
import { StreakBadge } from "@/components/StreakBadge";
import { FoodScannerDialog } from "@/components/FoodScannerDialog";
import { CommunityPage } from "@/pages/Community";
import { RanksPage } from "@/pages/Ranks";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useFoodEntries } from "@/hooks/useFoodEntries";
import { format } from "date-fns";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock leaderboard data (will be replaced with real data later)
const mockLeaderboard = [
  { id: "user-2", name: "Sarah Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", points: 3200, streak: 21, rank: 1, change: "same" as const },
  { id: "user-3", name: "Mike Torres", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike", points: 2890, streak: 18, rank: 2, change: "up" as const },
  { id: "user-4", name: "Emma Wilson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", points: 2100, streak: 9, rank: 4, change: "up" as const },
  { id: "user-5", name: "James Lee", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James", points: 1850, streak: 5, rank: 5, change: "down" as const },
];

type NavItem = "home" | "leaderboard" | "community" | "profile";

export default function Index() {
  const [activeNav, setActiveNav] = useState<NavItem>("home");
  const [scannerOpen, setScannerOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { entries, loading: entriesLoading, getTodayStats, refetch } = useFoodEntries();

  const todayStats = getTodayStats();

  const handleScan = () => {
    setScannerOpen(true);
  };

  const handleSearch = () => {
    toast.info("🔍 Food search coming soon!", {
      description: "Search our database of 1M+ foods.",
    });
  };

  const handleManual = () => {
    toast.info("✏️ Manual entry coming soon!", {
      description: "Add your own custom foods.",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const userStreak = profile?.current_streak || 0;
  const userPoints = profile?.total_points || 0;

  // Add current user to leaderboard
  const leaderboard = [
    ...mockLeaderboard.slice(0, 2),
    { 
      id: user?.id || "current", 
      name: userName, 
      avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`, 
      points: userPoints, 
      streak: userStreak, 
      rank: 3, 
      change: "same" as const 
    },
    ...mockLeaderboard.slice(2),
  ];

  const renderContent = () => {
    switch (activeNav) {
      case "community":
        return <CommunityPage />;
      case "leaderboard":
        return <RanksPage />;
      case "profile":
        return (
          <div className="container px-4 py-6 space-y-6">
            <div className="rounded-2xl bg-card shadow-card p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <img
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                {userName}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {user?.email}
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-primary">{userStreak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-primary">{userPoints}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        );
      default:
        return (
          <>
            <Header
              userName={userName}
              streak={userStreak}
              points={userPoints}
            />
            <main className="container px-4 py-6 space-y-6">
              {/* Hero Streak Section */}
              <section className="relative overflow-hidden rounded-2xl gradient-streak p-6 shadow-streak">
                <div className="relative z-10">
                  <p className="text-accent-foreground/80 text-sm font-medium mb-1">
                    🔥 Sugar-Free Streak
                  </p>
                  <div className="flex items-baseline gap-3">
                    <StreakBadge days={userStreak} size="lg" showLabel={false} />
                    <span className="text-2xl font-display font-bold text-accent-foreground">
                      days strong!
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-accent-foreground/70">
                    {userStreak > 0 
                      ? "Keep it up! You're doing amazing." 
                      : "Start your sugar-free journey today!"}
                  </p>
                </div>
                {/* Decorative elements */}
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
              </section>

              {/* Daily Stats */}
              <DailyStats 
                calories={{ current: todayStats.calories, goal: 2000 }}
                protein={{ current: todayStats.protein, goal: 120 }}
                carbs={{ current: todayStats.carbs, goal: 250 }}
                sugar={{ current: todayStats.sugar, limit: 25 }}
              />

              {/* Today's Food Log */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Today's Log
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {entries.length} items
                  </span>
                </div>
                {entriesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : entries.length > 0 ? (
                  <div className="space-y-3">
                    {entries.map((entry) => (
                      <FoodCard
                        key={entry.id}
                        name={entry.name}
                        time={format(new Date(entry.logged_at), "h:mm a")}
                        nutrition={{
                          calories: entry.calories,
                          protein: entry.protein,
                          carbs: entry.carbs,
                          sugar: entry.sugar,
                        }}
                        imageUrl={entry.image_url || undefined}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-card/50 p-8 text-center">
                    <p className="text-muted-foreground">
                      No food logged yet today. Tap + to add your first meal!
                    </p>
                  </div>
                )}
              </section>

              {/* Leaderboard Preview */}
              <LeaderboardCard users={leaderboard} currentUserId={user?.id || ""} />
            </main>

            <AddFoodButton
              onScan={handleScan}
              onSearch={handleSearch}
              onManual={handleManual}
            />

            <FoodScannerDialog 
              open={scannerOpen} 
              onOpenChange={(open) => {
                setScannerOpen(open);
                if (!open) refetch();
              }} 
            />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen gradient-hero pb-24">
      {renderContent()}
      <BottomNav active={activeNav} onNavigate={setActiveNav} />
    </div>
  );
}
