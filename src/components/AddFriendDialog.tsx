import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, UserPlus, Check, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFriends } from "@/hooks/useFriends";
import { useAuth } from "@/hooks/useAuth";

interface SearchResult {
  user_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
}

interface AddFriendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFriendDialog({ open, onOpenChange }: AddFriendDialogProps) {
  const { user } = useAuth();
  const { sendRequest, getFriendStatus, isSending } = useFriends();
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;

    setSearching(true);
    setHasSearched(true);
    try {
      // Search by username or display_name
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, avatar_url")
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .neq("user_id", user.id)
        .limit(10);

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getStatusButton = (targetUserId: string) => {
    const status = getFriendStatus(targetUserId);

    switch (status) {
      case "accepted":
        return (
          <Button size="sm" variant="outline" disabled className="gap-1">
            <Check className="h-4 w-4" />
            Friends
          </Button>
        );
      case "pending_sent":
        return (
          <Button size="sm" variant="outline" disabled className="gap-1">
            <Clock className="h-4 w-4" />
            Pending
          </Button>
        );
      case "pending_received":
        return (
          <Button size="sm" variant="secondary" disabled className="gap-1">
            Respond in notifications
          </Button>
        );
      default:
        return (
          <Button
            size="sm"
            onClick={() => sendRequest(targetUserId)}
            disabled={isSending}
            className="gap-1"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Add
          </Button>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add Friends
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Search by name or username</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="search"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.length > 0 ? (
              results.map((result) => (
                <div
                  key={result.user_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        result.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.display_name}`
                      }
                      alt={result.display_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        {result.display_name}
                      </p>
                      {result.username && (
                        <p className="text-xs text-muted-foreground">
                          @{result.username}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusButton(result.user_id)}
                </div>
              ))
            ) : hasSearched ? (
              <p className="text-center text-muted-foreground py-4">
                No users found. Try a different search.
              </p>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Search for friends by name or username
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
