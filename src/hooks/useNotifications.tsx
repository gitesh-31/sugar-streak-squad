import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Notification {
  id: string;
  type: "streak_update" | "streak_broken" | "food_logged" | "member_joined";
  title: string;
  message: string;
  avatar_url: string | null;
  user_name: string;
  created_at: string;
  read: boolean;
}

interface CommunityActivity {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  current_streak: number;
  total_points: number;
  updated_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCommunityActivity = async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Get user's community memberships
      const { data: memberships, error: membershipError } = await supabase
        .from("community_memberships")
        .select("community_id")
        .eq("user_id", user.id);

      if (membershipError || !memberships?.length) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const communityIds = memberships.map((m) => m.community_id);

      // Get all members from user's communities
      const { data: communityMembers, error: membersError } = await supabase
        .from("community_memberships")
        .select("user_id")
        .in("community_id", communityIds)
        .neq("user_id", user.id);

      if (membersError || !communityMembers?.length) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const memberIds = [...new Set(communityMembers.map((m) => m.user_id))];

      // Get recent profile updates from community members
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, current_streak, total_points, updated_at")
        .in("user_id", memberIds)
        .order("updated_at", { ascending: false })
        .limit(20);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        setNotifications([]);
        setLoading(false);
        return;
      }

      // Get recent food entries from community members
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data: recentEntries, error: entriesError } = await supabase
        .from("food_entries")
        .select("id, user_id, name, logged_at")
        .in("user_id", memberIds)
        .gte("logged_at", oneDayAgo.toISOString())
        .order("logged_at", { ascending: false })
        .limit(10);

      // Create profile map for quick lookups
      const profileMap = new Map<string, CommunityActivity>();
      profiles?.forEach((p) => {
        profileMap.set(p.user_id, p);
      });

      const generatedNotifications: Notification[] = [];

      // Generate notifications from food entries
      recentEntries?.forEach((entry) => {
        const profile = profileMap.get(entry.user_id);
        if (profile) {
          generatedNotifications.push({
            id: `food-${entry.id}`,
            type: "food_logged",
            title: "Food Logged",
            message: `${profile.display_name || "A friend"} logged "${entry.name}"`,
            avatar_url: profile.avatar_url,
            user_name: profile.display_name || "Friend",
            created_at: entry.logged_at,
            read: false,
          });
        }
      });

      // Generate notifications from streak changes
      profiles?.forEach((profile) => {
        if (profile.current_streak > 0) {
          generatedNotifications.push({
            id: `streak-${profile.user_id}`,
            type: "streak_update",
            title: "Streak Update",
            message: `${profile.display_name || "A friend"} is on a ${profile.current_streak}-day sugar-free streak! 🔥`,
            avatar_url: profile.avatar_url,
            user_name: profile.display_name || "Friend",
            created_at: profile.updated_at,
            read: false,
          });
        } else if (profile.current_streak === 0) {
          // Check if they recently broke their streak (updated recently but streak is 0)
          const updatedRecently = new Date(profile.updated_at) > oneDayAgo;
          if (updatedRecently) {
            generatedNotifications.push({
              id: `broken-${profile.user_id}`,
              type: "streak_broken",
              title: "Streak Broken",
              message: `${profile.display_name || "A friend"} broke their sugar-free streak 😢`,
              avatar_url: profile.avatar_url,
              user_name: profile.display_name || "Friend",
              created_at: profile.updated_at,
              read: false,
            });
          }
        }
      });

      // Sort by date (most recent first)
      generatedNotifications.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Keep only unique notifications (by type + user combination)
      const uniqueNotifications = generatedNotifications.reduce((acc, notification) => {
        const key = `${notification.type}-${notification.user_name}`;
        if (!acc.some((n) => `${n.type}-${n.user_name}` === key)) {
          acc.push(notification);
        }
        return acc;
      }, [] as Notification[]);

      setNotifications(uniqueNotifications.slice(0, 15));
      setUnreadCount(uniqueNotifications.length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityActivity();
  }, [user]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return {
    notifications,
    loading,
    unreadCount,
    refetch: fetchCommunityActivity,
    markAllAsRead,
  };
}
