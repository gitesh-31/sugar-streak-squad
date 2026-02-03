-- Fix: Restrict community_memberships SELECT to authenticated users only
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Users can view memberships" ON public.community_memberships;

-- Create new policy that requires authentication
CREATE POLICY "Authenticated users can view memberships"
ON public.community_memberships FOR SELECT
TO authenticated
USING (true);