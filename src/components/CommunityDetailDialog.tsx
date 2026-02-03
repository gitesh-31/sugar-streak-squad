import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Crown, Medal, LogOut, Loader2, Flame, UserPlus, Check, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFriends } from "@/hooks/useFriends";
import { isUserActive } from "@/hooks/usePresence";
import { cn } from "@/lib/utils";
import { StreakBadge } from "@/components/StreakBadge";

interface Member {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  current_streak: number | null;
  total_points: number | null;
  joined_at: string;
  last_active: string | null;
}

interface CommunityDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: string;
  communityName: string;
  onLeave?: () => void;
  isCreator?: boolean;
}

export function CommunityDetailDialog({
  open,
  onOpenChange,
  communityId,
  communityName,
  onLeave,
  isCreator,
}: CommunityDetailDialogProps) {
  const { user } = useAuth();
  const { getFriendStatus, sendRequest, isSending } = useFriends();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && communityId) {
      fetchMembers();
    }
  }, [open, communityId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      // Get all memberships for this community
      const { data: memberships, error: memError } = await supabase
        .from("community_memberships")
        .select("user_id, joined_at")
        .eq("community_id", communityId);

      if (memError) throw memError;

      if (memberships && memberships.length > 0) {
        const userIds = memberships.map((m) => m.user_id);
        
        // Get profiles for all members
        const { data: profiles, error: profError } = await supabase
          .from("profiles")
          .select("user_id, display_name, username, avatar_url, current_streak, total_points, last_active")
          .in("user_id", userIds);

        if (profError) throw profError;

        // Combine membership and profile data
        const memberData = memberships.map((membership) => {
          const profile = profiles?.find((p) => p.user_id === membership.user_id);
          return {
            user_id: membership.user_id,
            display_name: profile?.display_name || null,
            username: profile?.username || null,
            avatar_url: profile?.avatar_url || null,
            current_streak: profile?.current_streak || 0,
            total_points: profile?.total_points || 0,
            joined_at: membership.joined_at,
            last_active: profile?.last_active || null,
          };
        });

        // Sort by total points (descending)
        memberData.sort((a, b) => (b.total_points || 0) - (a.total_points || 0));
        setMembers(memberData);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-rank-gold fill-rank-gold/20" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-rank-silver" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-rank-bronze" />;
    return <span className="w-5 text-center text-sm font-semibold text-muted-foreground">#{rank}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {communityName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No members yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-2 py-2 text-sm text-muted-foreground border-b border-border mb-2">
                {members.length} member{members.length !== 1 ? "s" : ""}
              </div>
              {members.map((member, index) => {
                const isCurrentUser = member.user_id === user?.id;
                const displayName = member.display_name || member.username || "Anonymous";
                const avatarUrl = member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;
                const isActive = isUserActive(member.last_active);
                const friendStatus = getFriendStatus(member.user_id);
                
                return (
                  <div
                    key={member.user_id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-colors",
                      isCurrentUser && "bg-primary/5"
                    )}
                  >
                    <div className="flex w-8 justify-center">
                      {getRankIcon(index + 1)}
                    </div>
                    <div className="relative">
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                      />
                      {/* Online/Offline status indicator */}
                      <div
                        className={cn(
                          "absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-card",
                          isActive ? "bg-green-500" : "bg-red-400"
                        )}
                        title={isActive ? "Active now" : "Offline"}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium truncate",
                        isCurrentUser ? "text-primary" : "text-foreground"
                      )}>
                        {displayName}
                        {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
                      </p>
                      <div className="flex items-center gap-2">
                        <StreakBadge days={member.current_streak || 0} size="sm" showLabel={false} />
                        <span className="text-xs text-muted-foreground">
                          {(member.total_points || 0).toLocaleString()} pts
                        </span>
                      </div>
                    </div>
                    
                    {/* Add Friend Button - only show for non-self members */}
                    {!isCurrentUser && (
                      <div className="flex items-center gap-1">
                        {friendStatus === "none" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => sendRequest(member.user_id)}
                            disabled={isSending}
                            title="Add Friend"
                          >
                            <UserPlus className="h-4 w-4 text-primary" />
                          </Button>
                        )}
                        {friendStatus === "pending_sent" && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Request Sent">
                            <Clock className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {friendStatus === "accepted" && (
                          <div className="flex items-center gap-1 text-xs text-green-500" title="Friends">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {index < 3 && (
                      <Flame className={cn(
                        "w-4 h-4",
                        index === 0 && "text-rank-gold",
                        index === 1 && "text-rank-silver",
                        index === 2 && "text-rank-bronze"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!isCreator && onLeave && (
          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={onLeave}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave Community
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
