import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { DailyStats } from "@/components/DailyStats";
import { FoodCard } from "@/components/FoodCard";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { AddFoodButton } from "@/components/AddFoodButton";
import { StreakBadge } from "@/components/StreakBadge";
import { CommunityPage } from "@/pages/Community";
import { RanksPage } from "@/pages/Ranks";
import { toast } from "sonner";

// Mock data for demonstration
const mockUser = {
  id: "user-1",
  name: "Alex Johnson",
  streak: 12,
  points: 2450,
};

const mockFoods = [
  {
    id: "1",
    name: "Greek Yogurt with Berries",
    time: "8:30 AM",
    nutrition: { calories: 180, protein: 15, carbs: 20, sugar: 0 },
    imageUrl: "",
  },
  {
    id: "2",
    name: "Grilled Chicken Salad",
    time: "12:45 PM",
    nutrition: { calories: 420, protein: 35, carbs: 25, sugar: 0 },
    imageUrl: "",
  },
  {
    id: "3",
    name: "Almonds (Handful)",
    time: "3:15 PM",
    nutrition: { calories: 160, protein: 6, carbs: 6, sugar: 0 },
    imageUrl: "",
  },
];

const mockLeaderboard = [
  { id: "user-2", name: "Sarah Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", points: 3200, streak: 21, rank: 1, change: "same" as const },
  { id: "user-3", name: "Mike Torres", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike", points: 2890, streak: 18, rank: 2, change: "up" as const },
  { id: "user-1", name: "Alex Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", points: 2450, streak: 12, rank: 3, change: "down" as const },
  { id: "user-4", name: "Emma Wilson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", points: 2100, streak: 9, rank: 4, change: "up" as const },
  { id: "user-5", name: "James Lee", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James", points: 1850, streak: 5, rank: 5, change: "down" as const },
];

const mockStats = {
  calories: { current: 760, goal: 2000 },
  protein: { current: 56, goal: 120 },
  carbs: { current: 51, goal: 250 },
  sugar: { current: 0, limit: 25 },
};

type NavItem = "home" | "leaderboard" | "community" | "profile";

export default function Index() {
  const [activeNav, setActiveNav] = useState<NavItem>("home");

  const handleScan = () => {
    toast.info("📸 Camera scanning coming soon!", {
      description: "We're working on AI-powered food recognition.",
    });
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

  const renderContent = () => {
    switch (activeNav) {
      case "community":
        return <CommunityPage />;
      case "leaderboard":
        return <RanksPage />;
      case "profile":
        return (
          <div className="container px-4 py-6">
            <div className="rounded-2xl bg-card shadow-card p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                {mockUser.name}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Profile page coming soon!
              </p>
            </div>
          </div>
        );
      default:
        return (
          <>
            <Header
              userName={mockUser.name}
              streak={mockUser.streak}
              points={mockUser.points}
            />
            <main className="container px-4 py-6 space-y-6">
              {/* Hero Streak Section */}
              <section className="relative overflow-hidden rounded-2xl gradient-streak p-6 shadow-streak">
                <div className="relative z-10">
                  <p className="text-accent-foreground/80 text-sm font-medium mb-1">
                    🔥 Sugar-Free Streak
                  </p>
                  <div className="flex items-baseline gap-3">
                    <StreakBadge days={mockUser.streak} size="lg" showLabel={false} />
                    <span className="text-2xl font-display font-bold text-accent-foreground">
                      days strong!
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-accent-foreground/70">
                    Keep it up! You're in the top 15% of your community.
                  </p>
                </div>
                {/* Decorative elements */}
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
              </section>

              {/* Daily Stats */}
              <DailyStats {...mockStats} />

              {/* Today's Food Log */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Today's Log
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {mockFoods.length} items
                  </span>
                </div>
                <div className="space-y-3">
                  {mockFoods.map((food) => (
                    <FoodCard
                      key={food.id}
                      name={food.name}
                      time={food.time}
                      nutrition={food.nutrition}
                      imageUrl={food.imageUrl}
                    />
                  ))}
                </div>
              </section>

              {/* Leaderboard Preview */}
              <LeaderboardCard users={mockLeaderboard} currentUserId="user-1" />
            </main>

            <AddFoodButton
              onScan={handleScan}
              onSearch={handleSearch}
              onManual={handleManual}
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
