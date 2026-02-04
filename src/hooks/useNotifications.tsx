import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQueryClient } from "@tanstack/react-query";

export interface Notification {
  id: string;
  type: "streak_update" | "streak_broken" | "food_logged" | "member_joined" | "friend_request";
  title: string;
  message: string;
  avatar_url: string | null;
  user_name: string;
  created_at: string;
  read: boolean;
  // For friend requests
  friendshipId?: string;
  senderId?: string;
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
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const generatedNotifications: Notification[] = [];

      // Fetch pending friend requests received by the user
      const { data: pendingRequests, error: friendError } = await supabase
        .from("friends")
        .select("id, user_id, created_at")
        .eq("friend_id", user.id)
        .eq("status", "pending");

      if (!friendError && pendingRequests && pendingRequests.length > 0) {
        // Get sender profiles
        const senderIds = pendingRequests.map((r) => r.user_id);
        const { data: senderProfiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", senderIds);

        const profileMap = new Map(senderProfiles?.map((p) => [p.user_id, p]) || []);

        pendingRequests.forEach((request) => {
          const sender = profileMap.get(request.user_id);
          generatedNotifications.push({
            id: `friend-request-${request.id}`,
            type: "friend_request",
            title: "Friend Request",
            message: `${sender?.display_name || "Someone"} wants to be your friend`,
            avatar_url: sender?.avatar_url || null,
            user_name: sender?.display_name || "User",
            created_at: request.created_at,
            read: false,
            friendshipId: request.id,
            senderId: request.user_id,
          });
        });
      }

      // Get user's community memberships
      const { data: memberships, error: membershipError } = await supabase
        .from("community_memberships")
        .select("community_id")
        .eq("user_id", user.id);

      if (!membershipError && memberships?.length) {
        const communityIds = memberships.map((m) => m.community_id);

        // Get all members from user's communities
        const { data: communityMembers, error: membersError } = await supabase
          .from("community_memberships")
          .select("user_id")
          .in("community_id", communityIds)
          .neq("user_id", user.id);

        if (!membersError && communityMembers?.length) {
          const memberIds = [...new Set(communityMembers.map((m) => m.user_id))];

          // Get recent profile updates from community members
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("user_id, display_name, avatar_url, current_streak, total_points, updated_at")
            .in("user_id", memberIds)
            .order("updated_at", { ascending: false })
            .limit(20);

          if (!profilesError && profiles) {
            // Get recent food entries from community members
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);

            const { data: recentEntries } = await supabase
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
          }
        }
      }

      // Sort by date (most recent first)
      generatedNotifications.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Keep only unique notifications (by type + user combination, except friend requests)
      const uniqueNotifications = generatedNotifications.reduce((acc, notification) => {
        if (notification.type === "friend_request") {
          acc.push(notification);
        } else {
          const key = `${notification.type}-${notification.user_name}`;
          if (!acc.some((n) => n.type !== "friend_request" && `${n.type}-${n.user_name}` === key)) {
            acc.push(notification);
          }
        }
        return acc;
      }, [] as Notification[]);

      setNotifications(uniqueNotifications.slice(0, 20));
      setUnreadCount(uniqueNotifications.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleFriendAction = async (friendshipId: string, action: "accept" | "reject") => {
    try {
      if (action === "accept") {
        const { error } = await supabase
          .from("friends")
          .update({ status: "accepted" })
          .eq("id", friendshipId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("friends")
          .delete()
          .eq("id", friendshipId);
        if (error) throw error;
      }

      // Remove from notifications
      setNotifications((prev) =>
        prev.filter((n) => n.friendshipId !== friendshipId)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Invalidate friends query
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    } catch (error) {
      console.error("Friend action error:", error);
      throw error;
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    refetch: fetchNotifications,
    markAllAsRead,
    handleFriendAction,
  };
}
