import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface FriendProfile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  current_streak: number;
  total_points: number;
}

export function useFriends() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get all friend connections (sent and received)
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (error) throw error;
      return data as Friend[];
    },
    enabled: !!user,
  });

  // Get accepted friends' user IDs
  const acceptedFriendIds = friends
    .filter((f) => f.status === "accepted")
    .map((f) => (f.user_id === user?.id ? f.friend_id : f.user_id));

  // Get pending friend requests received
  const pendingRequests = friends.filter(
    (f) => f.status === "pending" && f.friend_id === user?.id
  );

  // Get pending requests sent
  const pendingRequestsSent = friends.filter(
    (f) => f.status === "pending" && f.user_id === user?.id
  );

  // Check if a user is a friend or has a pending request
  const getFriendStatus = (
    targetUserId: string
  ): "none" | "pending_sent" | "pending_received" | "accepted" => {
    const connection = friends.find(
      (f) =>
        (f.user_id === user?.id && f.friend_id === targetUserId) ||
        (f.friend_id === user?.id && f.user_id === targetUserId)
    );

    if (!connection) return "none";
    if (connection.status === "accepted") return "accepted";
    if (connection.status === "pending") {
      return connection.user_id === user?.id ? "pending_sent" : "pending_received";
    }
    return "none";
  };

  // Send friend request
  const sendRequest = useMutation({
    mutationFn: async (friendId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("friends").insert({
        user_id: user.id,
        friend_id: friendId,
        status: "pending",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success("Friend request sent!");
    },
    onError: (error) => {
      console.error("Send request error:", error);
      toast.error("Failed to send friend request");
    },
  });

  // Accept friend request
  const acceptRequest = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from("friends")
        .update({ status: "accepted" })
        .eq("id", friendshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      toast.success("Friend request accepted!");
    },
    onError: () => {
      toast.error("Failed to accept request");
    },
  });

  // Reject or remove friend
  const removeFriend = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from("friends")
        .delete()
        .eq("id", friendshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      toast.success("Friend removed");
    },
    onError: () => {
      toast.error("Failed to remove friend");
    },
  });

  return {
    friends,
    acceptedFriendIds,
    pendingRequests,
    pendingRequestsSent,
    isLoading,
    getFriendStatus,
    sendRequest: sendRequest.mutate,
    acceptRequest: acceptRequest.mutate,
    removeFriend: removeFriend.mutate,
    isSending: sendRequest.isPending,
  };
}
