import { Home, Trophy, Users, User, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = "home" | "leaderboard" | "friends" | "community" | "profile";

interface BottomNavProps {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
}

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  const items: { id: NavItem; icon: typeof Home; label: string }[] = [
    { id: "home", icon: Home, label: "Home" },
    { id: "leaderboard", icon: Trophy, label: "Ranks" },
    { id: "friends", icon: UserPlus, label: "Friends" },
    { id: "community", icon: Users, label: "Groups" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/50 pb-safe">
      <div className="container flex h-16 items-center justify-around px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute -top-px left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full gradient-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
