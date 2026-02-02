import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useFriends } from "./useFriends";

export interface LeaderboardUser {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  rank: number;
  change: "up" | "down" | "same";
  badges: string[];
}

// Calculate badges based on streak
function calculateBadges(streak: number, rank: number): string[] {
  const badges: string[] = [];
  
  if (streak >= 30) badges.push("elite");
  if (streak >= 21) badges.push("warrior");
  if (rank <= 3) badges.push("champion");
  if (streak >= 14) badges.push("dedicated");
  if (streak >= 7) badges.push("starter");
  
  return badges;
}

export function useLeaderboard(communityId?: string) {
  const { user } = useAuth();
  const { acceptedFriendIds } = useFriends();

  return useQuery({
    queryKey: ["leaderboard", communityId, acceptedFriendIds],
    queryFn: async (): Promise<LeaderboardUser[]> => {
      if (!user) return [];

      let userIds: string[] = [];

      // If community is specified, get only those members
      if (communityId) {
        const { data: memberships, error: memError } = await supabase
          .from("community_memberships")
          .select("user_id")
          .eq("community_id", communityId);

        if (memError) throw memError;
        userIds = memberships?.map((m) => m.user_id) || [];
      } else {
        // For the main leaderboard, only show friends + self
        userIds = [...acceptedFriendIds, user.id];
      }

      if (userIds.length === 0) return [];

      // Get profiles filtered by the user IDs
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds)
        .order("total_points", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Map to leaderboard format with ranks
      const leaderboard: LeaderboardUser[] = (profiles || []).map((profile, index) => {
        const displayName = profile.display_name || profile.username || "Anonymous";
        const streak = profile.current_streak || 0;
        const rank = index + 1;

        return {
          id: profile.id,
          user_id: profile.user_id,
          name: displayName,
          avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`,
          points: profile.total_points || 0,
          streak,
          rank,
          change: "same" as const, // Would need historical data to track this
          badges: calculateBadges(streak, rank),
        };
      });

      return leaderboard;
    },
    enabled: !!user,
  });
}
