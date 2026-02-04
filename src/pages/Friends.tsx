import { useState, useEffect } from "react";
import { Users, UserPlus, Check, X, Loader2, UserMinus, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useFriends } from "@/hooks/useFriends";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddFriendDialog } from "@/components/AddFriendDialog";
import { StreakBadge } from "@/components/StreakBadge";

interface FriendWithProfile {
  friendshipId: string;
  friendId: string;
  displayName: string;
  avatarUrl: string | null;
  currentStreak: number;
  totalPoints: number;
  status: "pending" | "accepted";
  isReceived: boolean; // true if we received the request
}

export function FriendsPage() {
  const { user } = useAuth();
  const { friends, acceptRequest, removeFriend, isLoading } = useFriends();
  const [friendsWithProfiles, setFriendsWithProfiles] = useState<FriendWithProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user || friends.length === 0) {
        setFriendsWithProfiles([]);
        setLoadingProfiles(false);
        return;
      }

      setLoadingProfiles(true);

      // Get all friend user IDs (both directions)
      const friendUserIds = friends.map((f) =>
        f.user_id === user.id ? f.friend_id : f.user_id
      );

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, current_streak, total_points")
        .in("user_id", friendUserIds);

      if (error) {
        console.error("Error fetching profiles:", error);
        setLoadingProfiles(false);
        return;
      }

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      const combined = friends.map((f) => {
        const friendUserId = f.user_id === user.id ? f.friend_id : f.user_id;
        const profile = profileMap.get(friendUserId);
        return {
          friendshipId: f.id,
          friendId: friendUserId,
          displayName: profile?.display_name || "User",
          avatarUrl: profile?.avatar_url || null,
          currentStreak: profile?.current_streak || 0,
          totalPoints: profile?.total_points || 0,
          status: f.status as "pending" | "accepted",
          isReceived: f.friend_id === user.id, // true if user is the receiver
        };
      });

      setFriendsWithProfiles(combined);
      setLoadingProfiles(false);
    };

    fetchProfiles();
  }, [friends, user]);

  const acceptedFriends = friendsWithProfiles.filter((f) => f.status === "accepted");
  const pendingReceived = friendsWithProfiles.filter(
    (f) => f.status === "pending" && f.isReceived
  );
  const pendingSent = friendsWithProfiles.filter(
    (f) => f.status === "pending" && !f.isReceived
  );

  const handleAccept = async (friendshipId: string) => {
    setProcessingIds((prev) => new Set(prev).add(friendshipId));
    try {
      acceptRequest(friendshipId);
      toast.success("Friend request accepted!");
    } catch {
      toast.error("Failed to accept request");
    } finally {
      setTimeout(() => {
        setProcessingIds((prev) => {
          const next = new Set(prev);
          next.delete(friendshipId);
          return next;
        });
      }, 500);
    }
  };

  const handleRemove = async (friendshipId: string, isRequest: boolean) => {
    setProcessingIds((prev) => new Set(prev).add(friendshipId));
    try {
      removeFriend(friendshipId);
      toast.success(isRequest ? "Request declined" : "Friend removed");
    } catch {
      toast.error("Failed to process");
    } finally {
      setTimeout(() => {
        setProcessingIds((prev) => {
          const next = new Set(prev);
          next.delete(friendshipId);
          return next;
        });
      }, 500);
    }
  };

  if (isLoading || loadingProfiles) {
    return (
      <div className="min-h-screen gradient-hero pb-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading friends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero pb-24">
      <div className="container px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Friends
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your connections
            </p>
          </div>
          <Button
            onClick={() => setAddFriendOpen(true)}
            size="sm"
            className="gradient-primary text-primary-foreground shadow-glow"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Add Friend
          </Button>
        </div>

        {/* Pending Requests Received */}
        {pendingReceived.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Friend Requests ({pendingReceived.length})
            </h2>
            <div className="space-y-3">
              {pendingReceived.map((friend, index) => (
                <FriendCard
                  key={friend.friendshipId}
                  friend={friend}
                  index={index}
                  isProcessing={processingIds.has(friend.friendshipId)}
                  onAccept={() => handleAccept(friend.friendshipId)}
                  onDecline={() => handleRemove(friend.friendshipId, true)}
                  type="request"
                />
              ))}
            </div>
          </section>
        )}

        {/* Pending Requests Sent */}
        {pendingSent.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Pending Requests Sent ({pendingSent.length})
            </h2>
            <div className="space-y-3">
              {pendingSent.map((friend, index) => (
                <FriendCard
                  key={friend.friendshipId}
                  friend={friend}
                  index={index}
                  isProcessing={processingIds.has(friend.friendshipId)}
                  onCancel={() => handleRemove(friend.friendshipId, true)}
                  type="sent"
                />
              ))}
            </div>
          </section>
        )}

        {/* Accepted Friends */}
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            Your Friends ({acceptedFriends.length})
          </h2>
          {acceptedFriends.length > 0 ? (
            <div className="space-y-3">
              {acceptedFriends.map((friend, index) => (
                <FriendCard
                  key={friend.friendshipId}
                  friend={friend}
                  index={index}
                  isProcessing={processingIds.has(friend.friendshipId)}
                  onRemove={() => handleRemove(friend.friendshipId, false)}
                  type="friend"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-card shadow-card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                No Friends Yet
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Add friends to compete on the leaderboard together!
              </p>
              <Button
                onClick={() => setAddFriendOpen(true)}
                className="gradient-primary text-primary-foreground"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Find Friends
              </Button>
            </div>
          )}
        </section>
      </div>

      <AddFriendDialog open={addFriendOpen} onOpenChange={setAddFriendOpen} />
    </div>
  );
}

interface FriendCardProps {
  friend: FriendWithProfile;
  index: number;
  isProcessing: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  onRemove?: () => void;
  type: "request" | "sent" | "friend";
}

function FriendCard({
  friend,
  index,
  isProcessing,
  onAccept,
  onDecline,
  onCancel,
  onRemove,
  type,
}: FriendCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl bg-card shadow-card transition-all hover:shadow-lg animate-slide-up",
        type === "request" && "ring-1 ring-primary/20"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={friend.avatarUrl || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {friend.displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">{friend.displayName}</h3>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {type === "friend" && (
            <>
              <StreakBadge days={friend.currentStreak} size="sm" showLabel={false} />
              <span>{friend.totalPoints.toLocaleString()} pts</span>
            </>
          )}
          {type === "request" && (
            <span className="text-primary">Wants to be your friend</span>
          )}
          {type === "sent" && (
            <span className="text-muted-foreground">Awaiting response...</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {type === "request" && (
          <>
            <Button
              size="sm"
              variant="default"
              onClick={onAccept}
              disabled={isProcessing}
              className="h-9"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDecline}
              disabled={isProcessing}
              className="h-9"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
        {type === "sent" && (
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="h-9 text-muted-foreground"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </>
            )}
          </Button>
        )}
        {type === "friend" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRemove}
            disabled={isProcessing}
            className="h-9 text-muted-foreground hover:text-destructive"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserMinus className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default FriendsPage;
