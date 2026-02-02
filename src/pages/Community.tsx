import { useState } from "react";
import { Users, Plus, Crown, UserPlus, ChevronRight, Search, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { InviteFriendsDialog } from "@/components/InviteFriendsDialog";
import { CommunityDetailDialog } from "@/components/CommunityDetailDialog";
import { useCommunities, type Community } from "@/hooks/useCommunities";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Emoji avatars for communities
const COMMUNITY_EMOJIS = ["🏋️", "🏢", "👨‍👩‍👧‍👦", "🥑", "🏃", "🥗", "⭐", "🔥", "💪", "🎯", "🏆", "❤️"];

function getEmojiForCommunity(name: string): string {
  // Generate a consistent emoji based on the name
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COMMUNITY_EMOJIS[hash % COMMUNITY_EMOJIS.length];
}

interface CommunityPageProps {
  onBack?: () => void;
}

export function CommunityPage({ onBack }: CommunityPageProps) {
  const { user } = useAuth();
  const {
    joinedCommunities,
    availableCommunities,
    isLoading,
    createCommunity,
    joinCommunity,
    leaveCommunity,
  } = useCommunities();

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityDescription, setNewCommunityDescription] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  const handleOpenInvite = (community: Community) => {
    setSelectedCommunity(community);
    setInviteDialogOpen(true);
  };

  const handleOpenDetail = (community: Community) => {
    setSelectedCommunity(community);
    setDetailDialogOpen(true);
  };

  const handleLeaveCommunity = () => {
    if (selectedCommunity) {
      leaveCommunity.mutate(selectedCommunity.id, {
        onSuccess: () => {
          setDetailDialogOpen(false);
          setSelectedCommunity(null);
        },
      });
    }
  };

  const handleJoinCommunity = (community: Community) => {
    joinCommunity.mutate(community.id);
  };

  const handleCreateCommunity = () => {
    if (!newCommunityName.trim()) {
      return;
    }
    createCommunity.mutate(
      { name: newCommunityName, description: newCommunityDescription },
      {
        onSuccess: () => {
          setNewCommunityName("");
          setNewCommunityDescription("");
          setShowCreateModal(false);
        },
      }
    );
  };

  const filteredAvailable = availableCommunities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero pb-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading communities...</p>
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
              Communities
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Compete with friends & stay motivated
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            size="sm"
            className="gradient-primary text-primary-foreground shadow-glow"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create
          </Button>
        </div>

        {/* Your Communities */}
        {joinedCommunities.length > 0 ? (
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">
              Your Communities
            </h2>
            <div className="space-y-3">
              {joinedCommunities.map((community, index) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  isJoined
                  index={index}
                  onInvite={() => handleOpenInvite(community)}
                  onClick={() => handleOpenDetail(community)}
                />
              ))}
            </div>
          </section>
        ) : (
          <section className="rounded-2xl bg-card shadow-card p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              No Communities Yet
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Join a community to compete with friends and stay motivated!
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="gradient-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Community
            </Button>
          </section>
        )}

        {/* Discover Communities */}
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            Discover Communities
          </h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {filteredAvailable.length > 0 ? (
            <div className="space-y-3">
              {filteredAvailable.map((community, index) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  isJoined={false}
                  onJoin={() => handleJoinCommunity(community)}
                  isJoining={joinCommunity.isPending}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-card/50 p-6 text-center">
              <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {searchQuery ? "No communities match your search" : "No communities to discover yet"}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Be the first to create one!
              </p>
            </div>
          )}
        </section>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl animate-scale-in">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">
                Create Community
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="community-name">Name</Label>
                  <Input
                    id="community-name"
                    placeholder="e.g., Office Health Club"
                    value={newCommunityName}
                    onChange={(e) => setNewCommunityName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="community-description">Description (optional)</Label>
                  <Textarea
                    id="community-description"
                    placeholder="What's this community about?"
                    value={newCommunityDescription}
                    onChange={(e) => setNewCommunityDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                  disabled={createCommunity.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCommunity}
                  className="flex-1 gradient-primary text-primary-foreground"
                  disabled={createCommunity.isPending || !newCommunityName.trim()}
                >
                  {createCommunity.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Invite Dialog */}
        {selectedCommunity && (
          <InviteFriendsDialog
            open={inviteDialogOpen}
            onOpenChange={setInviteDialogOpen}
            communityId={selectedCommunity.id}
            communityName={selectedCommunity.name}
          />
        )}

        {/* Detail Dialog */}
        {selectedCommunity && (
          <CommunityDetailDialog
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
            communityId={selectedCommunity.id}
            communityName={selectedCommunity.name}
            onLeave={handleLeaveCommunity}
            isCreator={selectedCommunity.created_by === user?.id}
          />
        )}
      </div>
    </div>
  );
}

interface CommunityCardProps {
  community: Community;
  isJoined: boolean;
  onJoin?: () => void;
  onInvite?: () => void;
  onClick?: () => void;
  isJoining?: boolean;
  index: number;
}

function CommunityCard({ community, isJoined, onJoin, onInvite, onClick, isJoining, index }: CommunityCardProps) {
  const emoji = getEmojiForCommunity(community.name);
  
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl bg-card shadow-card transition-all hover:shadow-lg animate-slide-up cursor-pointer",
        isJoined && "ring-1 ring-primary/20"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
        {community.image_url ? (
          <img src={community.image_url} alt={community.name} className="w-full h-full rounded-xl object-cover" />
        ) : (
          emoji
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">{community.name}</h3>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {community.member_count || 1}
          </span>
          {isJoined && community.yourRank && community.yourRank > 0 && (
            <span className="flex items-center gap-1 text-primary">
              <Crown className="w-3 h-3" />
              Rank #{community.yourRank}
            </span>
          )}
          {(community.topStreak || 0) > 0 && (
            <span className="flex items-center gap-1">
              🔥 {community.topStreak}d top
            </span>
          )}
        </div>
        {community.description && (
          <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
            {community.description}
          </p>
        )}
      </div>
      {isJoined ? (
        <div className="flex items-center gap-2">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onInvite?.();
            }}
            className="text-primary hover:bg-primary/10"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      ) : (
        <Button
          size="sm"
          onClick={onJoin}
          disabled={isJoining}
          className="gradient-primary text-primary-foreground shadow-glow"
        >
          {isJoining ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-1" />
              Join
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export default CommunityPage;
