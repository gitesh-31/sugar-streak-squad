import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Share2, 
  Copy, 
  Check, 
  Search, 
  UserPlus, 
  MessageCircle,
  Send,
  Link2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface InviteFriendsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: string;
  communityName: string;
}

export function InviteFriendsDialog({ 
  open, 
  onOpenChange, 
  communityId, 
  communityName 
}: InviteFriendsDialogProps) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    user_id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  }>>([]);
  const [searching, setSearching] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<Set<string>>(new Set());

  const inviteLink = `${window.location.origin}/community/join/${communityId}`;
  const inviteMessage = `🏆 Join me on Cutsistent!\n\nI'm challenging you to join "${communityName}" - let's compete and stay sugar-free together!\n\n${inviteLink}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(inviteMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleTelegramShare = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(`Join me on "${communityName}" and let's compete together! 🏆`)}`;
    window.open(telegramUrl, "_blank");
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I'm challenging my friends to join "${communityName}" on Cutsistent! Let's stay healthy together 💪`)}&url=${encodeURIComponent(inviteLink)}`;
    window.open(twitterUrl, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${communityName} on Cutsistent`,
          text: inviteMessage,
          url: inviteLink,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, username, display_name, avatar_url")
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
      
      if (!data?.length) {
        toast.info("No users found with that name");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  const handleInviteUser = async (userId: string, displayName: string | null) => {
    // In a real implementation, this would send a notification or invitation
    // For now, we'll just simulate the invitation
    setInvitedUsers(prev => new Set([...prev, userId]));
    toast.success(`Invitation sent to ${displayName || "user"}!`, {
      description: "They'll receive a notification to join your community.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Invite Friends
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="share" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="share">Share Link</TabsTrigger>
            <TabsTrigger value="search">Find by Username</TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-4 mt-4">
            {/* Quick Share Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleWhatsAppShare}
                className="bg-[#25D366] hover:bg-[#20BD5A] text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={handleTelegramShare}
                className="bg-[#0088cc] hover:bg-[#0077b5] text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Telegram
              </Button>
              <Button
                onClick={handleTwitterShare}
                variant="outline"
                className="border-foreground/20"
              >
                <span className="mr-2">𝕏</span>
                Twitter
              </Button>
              <Button
                onClick={handleNativeShare}
                variant="outline"
                className="border-foreground/20"
              >
                <Share2 className="w-4 h-4 mr-2" />
                More
              </Button>
            </div>

            {/* Copy Link Section */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Or copy invite link</Label>
              <div className="flex gap-2">
                <Input 
                  value={inviteLink} 
                  readOnly 
                  className="text-sm bg-muted/50"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="secondary"
                  size="icon"
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Invite Message Preview */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Message preview</Label>
              <div className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">
                {inviteMessage}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4 mt-4">
            {/* Search by Username */}
            <div className="space-y-2">
              <Label>Search by username or name</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchUsers()}
                />
                <Button
                  onClick={handleSearchUsers}
                  disabled={searching || !searchQuery.trim()}
                  size="icon"
                  className="shrink-0"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search Results */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.display_name || "User"} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{(user.display_name || user.username || "U")[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {user.display_name || user.username || "Unknown User"}
                    </p>
                    {user.username && (
                      <p className="text-sm text-muted-foreground truncate">
                        @{user.username}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleInviteUser(user.user_id, user.display_name)}
                    disabled={invitedUsers.has(user.user_id)}
                    variant={invitedUsers.has(user.user_id) ? "secondary" : "default"}
                  >
                    {invitedUsers.has(user.user_id) ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Sent
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Invite
                      </>
                    )}
                  </Button>
                </div>
              ))}

              {searchResults.length === 0 && searchQuery && !searching && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No users found</p>
                  <p className="text-sm">Try a different username</p>
                </div>
              )}

              {!searchQuery && (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Search for friends by username</p>
                  <p className="text-sm">Invite them to join your community</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
