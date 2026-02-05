import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Community {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  member_count: number | null;
  created_by: string | null;
  created_at: string;
  isJoined?: boolean;
  yourRank?: number;
  topStreak?: number;
}

export function useCommunities() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch only communities the user is a member of, plus available ones for search
  const { data: communities = [], isLoading } = useQuery({
    queryKey: ["communities", user?.id],
    queryFn: async () => {
      // Get user's memberships first
      const { data: memberships, error: memError } = await supabase
        .from("community_memberships")
        .select("community_id")
        .eq("user_id", user?.id || "");

      if (memError) throw memError;

      const joinedIds = new Set(memberships?.map((m) => m.community_id) || []);
      
      // Only fetch communities the user has joined
      if (joinedIds.size === 0) {
        return []; // New user with no communities
      }

      const { data: joinedCommunities, error: commError } = await supabase
        .from("communities")
        .select("*")
        .in("id", Array.from(joinedIds))
        .order("created_at", { ascending: false });

      if (commError) throw commError;

      // Get top streaks for each community (from profiles of members)
      const communitiesWithData = await Promise.all(
        (joinedCommunities || []).map(async (community) => {
          // Get members of this community
          const { data: memberProfiles } = await supabase
            .from("community_memberships")
            .select("user_id")
            .eq("community_id", community.id);

          let topStreak = 0;
          let yourRank = 0;

          if (memberProfiles && memberProfiles.length > 0) {
            const memberIds = memberProfiles.map((m) => m.user_id);
            
            // Get profiles with streaks
            const { data: profiles } = await supabase
              .from("profiles")
              .select("user_id, current_streak")
              .in("user_id", memberIds)
              .order("current_streak", { ascending: false });

            if (profiles && profiles.length > 0) {
              topStreak = profiles[0].current_streak || 0;
              
              // Find user's rank
              if (user?.id) {
                const userIndex = profiles.findIndex((p) => p.user_id === user.id);
                yourRank = userIndex >= 0 ? userIndex + 1 : 0;
              }
            }
          }

          return {
            ...community,
            isJoined: true,
            yourRank,
            topStreak,
          };
        })
      );

      return communitiesWithData;
    },
    enabled: !!user,
  });

  // Create community mutation
  const createCommunity = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      if (!user) throw new Error("Must be logged in");

      // Create the community
      const { data: community, error: createError } = await supabase
        .from("communities")
        .insert({
          name,
          description: description || null,
          created_by: user.id,
          member_count: 1,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Auto-join the creator
      const { error: joinError } = await supabase
        .from("community_memberships")
        .insert({
          community_id: community.id,
          user_id: user.id,
        });

      if (joinError) throw joinError;

      return community;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      toast.success(`Created "${data.name}"!`, {
        description: "Invite your friends to join!",
      });
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("Failed to create community");
    },
  });

  // Join community mutation
  const joinCommunity = useMutation({
    mutationFn: async (communityId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("community_memberships")
        .insert({
          community_id: communityId,
          user_id: user.id,
        });

      if (error) throw error;

      // Update member count
      const community = communities.find((c) => c.id === communityId);
      if (community) {
        await supabase
          .from("communities")
          .update({ member_count: (community.member_count || 0) + 1 })
          .eq("id", communityId);
      }

      return communityId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      toast.success("Joined community!", {
        description: "Start tracking to climb the ranks!",
      });
    },
    onError: (error) => {
      console.error("Join error:", error);
      toast.error("Failed to join community");
    },
  });

  // Leave community mutation
  const leaveCommunity = useMutation({
    mutationFn: async (communityId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("community_memberships")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update member count
      const community = communities.find((c) => c.id === communityId);
      if (community && (community.member_count || 0) > 0) {
        await supabase
          .from("communities")
          .update({ member_count: (community.member_count || 1) - 1 })
          .eq("id", communityId);
      }

      return communityId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      toast.success("Left community");
    },
    onError: (error) => {
      console.error("Leave error:", error);
      toast.error("Failed to leave community");
    },
  });

  const joinedCommunities = communities.filter((c) => c.isJoined);
  
  // Search for available communities (fetched separately when searching)
  const searchCommunities = useMutation({
    mutationFn: async (query: string) => {
      if (!query.trim()) return [];
      
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .ilike("name", `%${query}%`)
        .order("member_count", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Filter out already joined communities
      const joinedIds = new Set(communities.map((c) => c.id));
      return (data || []).filter((c) => !joinedIds.has(c.id));
    },
  });

  return {
    communities,
    joinedCommunities,
    searchCommunities: searchCommunities.mutateAsync,
    searchResults: searchCommunities.data || [],
    isSearching: searchCommunities.isPending,
    isLoading,
    createCommunity,
    joinCommunity,
    leaveCommunity,
  };
}
