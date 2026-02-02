import { useState } from "react";
import { Users, Plus, Crown, UserPlus, ChevronRight, Search, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { InviteFriendsDialog } from "@/components/InviteFriendsDialog";

interface Community {
  id: string;
  name: string;
  memberCount: number;
  avatar: string;
  yourRank: number;
  topStreak: number;
}

interface CommunityPageProps {
  onBack?: () => void;
}

const mockJoinedCommunities: Community[] = [
  {
    id: "1",
    name: "Sugar-Free Warriors",
    memberCount: 24,
    avatar: "🏋️",
    yourRank: 3,
    topStreak: 45,
  },
  {
    id: "2",
    name: "Office Health Club",
    memberCount: 12,
    avatar: "🏢",
    yourRank: 1,
    topStreak: 21,
  },
  {
    id: "3",
    name: "Family Fitness",
    memberCount: 6,
    avatar: "👨‍👩‍👧‍👦",
    yourRank: 2,
    topStreak: 18,
  },
];

const mockAvailableCommunities: Community[] = [
  {
    id: "4",
    name: "Keto Champions",
    memberCount: 156,
    avatar: "🥑",
    yourRank: 0,
    topStreak: 90,
  },
  {
    id: "5",
    name: "Morning Runners",
    memberCount: 89,
    avatar: "🏃",
    yourRank: 0,
    topStreak: 67,
  },
  {
    id: "6",
    name: "Vegan Squad",
    memberCount: 234,
    avatar: "🥗",
    yourRank: 0,
    topStreak: 120,
  },
];

export function CommunityPage({ onBack }: CommunityPageProps) {
  const [joinedCommunities, setJoinedCommunities] = useState(mockJoinedCommunities);
  const [availableCommunities, setAvailableCommunities] = useState(mockAvailableCommunities);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  const handleOpenInvite = (community: Community) => {
    setSelectedCommunity(community);
    setInviteDialogOpen(true);
  };

  const handleJoinCommunity = (community: Community) => {
    setAvailableCommunities((prev) => prev.filter((c) => c.id !== community.id));
    setJoinedCommunities((prev) => [
      ...prev,
      { ...community, yourRank: community.memberCount + 1 },
    ]);
    toast.success(`Joined ${community.name}!`, {
      description: "Start tracking to climb the ranks!",
    });
  };

  const handleCreateCommunity = () => {
    if (!newCommunityName.trim()) {
      toast.error("Please enter a community name");
      return;
    }
    const newCommunity: Community = {
      id: `new-${Date.now()}`,
      name: newCommunityName,
      memberCount: 1,
      avatar: "⭐",
      yourRank: 1,
      topStreak: 12,
    };
    setJoinedCommunities((prev) => [...prev, newCommunity]);
    setNewCommunityName("");
    setShowCreateModal(false);
    toast.success(`Created ${newCommunityName}!`, {
      description: "Invite your friends to join!",
    });
  };

  const filteredAvailable = availableCommunities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="space-y-3">
            {filteredAvailable.map((community, index) => (
              <CommunityCard
                key={community.id}
                community={community}
                isJoined={false}
                onJoin={() => handleJoinCommunity(community)}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl animate-scale-in">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">
                Create Community
              </h3>
              <Input
                placeholder="Community name..."
                value={newCommunityName}
                onChange={(e) => setNewCommunityName(e.target.value)}
                className="mb-4"
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCommunity}
                  className="flex-1 gradient-primary text-primary-foreground"
                >
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
      </div>
    </div>
  );
}

interface CommunityCardProps {
  community: Community;
  isJoined: boolean;
  onJoin?: () => void;
  onInvite?: () => void;
  index: number;
}

function CommunityCard({ community, isJoined, onJoin, onInvite, index }: CommunityCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl bg-card shadow-card transition-all hover:shadow-lg animate-slide-up",
        isJoined && "ring-1 ring-primary/20"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
        {community.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">{community.name}</h3>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {community.memberCount}
          </span>
          {isJoined && (
            <span className="flex items-center gap-1 text-primary">
              <Crown className="w-3 h-3" />
              Rank #{community.yourRank}
            </span>
          )}
          <span className="flex items-center gap-1">
            🔥 {community.topStreak}d top
          </span>
        </div>
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
          className="gradient-primary text-primary-foreground shadow-glow"
        >
          <UserPlus className="w-4 h-4 mr-1" />
          Join
        </Button>
      )}
    </div>
  );
}

export default CommunityPage;
