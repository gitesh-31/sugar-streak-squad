-- Create a public view for community discovery that excludes creator identity
CREATE VIEW public.communities_public
WITH (security_invoker = on) AS
SELECT 
  id, 
  name, 
  description, 
  image_url, 
  member_count, 
  created_at
FROM public.communities;

-- Grant access to the view for authenticated and anon users
GRANT SELECT ON public.communities_public TO authenticated;
GRANT SELECT ON public.communities_public TO anon;

-- Create a security definer function to check if a user is the creator of a community
-- This allows secure server-side verification without exposing created_by publicly
CREATE OR REPLACE FUNCTION public.is_community_creator(_community_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.communities
    WHERE id = _community_id
      AND created_by = _user_id
  )
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_community_creator(uuid, uuid) TO authenticated;