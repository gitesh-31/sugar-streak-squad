import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { DailyStats } from "@/components/DailyStats";
import { FoodCard } from "@/components/FoodCard";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { AddFoodButton } from "@/components/AddFoodButton";
import { StreakBadge } from "@/components/StreakBadge";
import { FoodScannerDialog } from "@/components/FoodScannerDialog";
import { ManualFoodEntryDialog } from "@/components/ManualFoodEntryDialog";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";
import { CommunityPage } from "@/pages/Community";
import { RanksPage } from "@/pages/Ranks";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useFoodEntries } from "@/hooks/useFoodEntries";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useStreakCalculator } from "@/hooks/useStreakCalculator";
import { format } from "date-fns";
import { Loader2, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

type NavItem = "home" | "leaderboard" | "community" | "profile";

export default function Index() {
  const [activeNav, setActiveNav] = useState<NavItem>("home");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, refetchProfile } = useProfile();
  const { entries, loading: entriesLoading, getTodayStats, refetch, updateEntry, deleteEntry } = useFoodEntries();
  const { data: leaderboard = [] } = useLeaderboard();
  const { calculateAndUpdateStreak } = useStreakCalculator();

  // Recalculate streak when entries change
  useEffect(() => {
    if (entries.length > 0) {
      calculateAndUpdateStreak().then(() => refetchProfile());
    }
  }, [entries.length]);

  const todayStats = getTodayStats();

  const handleRefetchProfile = async () => {
    await refetchProfile();
  };

  const handleProfileClick = () => {
    setActiveNav("profile");
  };

  const handleScan = () => {
    setScannerOpen(true);
  };

  const handleSearch = () => {
    toast.info("🔍 Food search coming soon!", {
      description: "Search our database of 1M+ foods.",
    });
  };

  const handleManual = () => {
    setManualEntryOpen(true);
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

  // Format leaderboard for the LeaderboardCard (needs simpler format)
  const formattedLeaderboard = leaderboard.slice(0, 5).map((u) => ({
    id: u.user_id,
    name: u.name,
    avatar: u.avatar,
    points: u.points,
    streak: u.streak,
    rank: u.rank,
    change: u.change,
  }));

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
              <button
                onClick={() => setProfileEditOpen(true)}
                className="relative group mx-auto block"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-4 ring-border transition-opacity group-hover:opacity-75">
                  <img
                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/40 rounded-full p-2">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                </div>
              </button>
              <h2 className="font-display text-xl font-bold text-foreground">
                {userName}
              </h2>
              {profile?.username && (
                <p className="text-primary text-sm">@{profile.username}</p>
              )}
              <p className="text-muted-foreground text-sm mt-1">
                {user?.email}
              </p>
              {profile?.bio && (
                <p className="text-muted-foreground text-sm mt-2 italic">
                  "{profile.bio}"
                </p>
              )}
              <div className="flex justify-center gap-6 mt-4">
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-primary">{userStreak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-primary">{userPoints}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-primary">{profile?.longest_streak || 0}</p>
                  <p className="text-xs text-muted-foreground">Best Streak</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setProfileEditOpen(true)}
              className="w-full"
              variant="outline"
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>

            <Button 
              variant="outline" 
              className="w-full text-destructive hover:text-destructive" 
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>

            <ProfileEditDialog
              open={profileEditOpen}
              onOpenChange={setProfileEditOpen}
              profile={profile}
              onUpdate={handleRefetchProfile}
            />
          </div>
        );
      default:
        return (
          <>
            <Header
              userName={userName}
              streak={userStreak}
              points={userPoints}
              avatarUrl={profile?.avatar_url}
              onProfileClick={handleProfileClick}
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
                        id={entry.id}
                        name={entry.name}
                        time={format(new Date(entry.logged_at), "h:mm a")}
                        nutrition={{
                          calories: entry.calories,
                          protein: entry.protein,
                          carbs: entry.carbs,
                          sugar: entry.sugar,
                        }}
                        imageUrl={entry.image_url || undefined}
                        onEdit={async (id, updates) => {
                          await updateEntry(id, {
                            name: updates.name,
                            calories: updates.nutrition.calories,
                            protein: updates.nutrition.protein,
                            carbs: updates.nutrition.carbs,
                            sugar: updates.nutrition.sugar,
                          });
                          toast.success("Food entry updated!");
                        }}
                        onDelete={async (id) => {
                          await deleteEntry(id);
                          toast.success("Food entry deleted!");
                        }}
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
              <LeaderboardCard users={formattedLeaderboard} currentUserId={user?.id || ""} />
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

            <ManualFoodEntryDialog
              open={manualEntryOpen}
              onOpenChange={(open) => {
                setManualEntryOpen(open);
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
