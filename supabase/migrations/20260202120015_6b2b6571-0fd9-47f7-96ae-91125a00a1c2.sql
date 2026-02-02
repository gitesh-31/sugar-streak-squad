-- Create friends table for friend relationships
CREATE TABLE public.friends (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  friend_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Enable Row Level Security
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Users can see friend requests they sent or received
CREATE POLICY "Users can view their friend connections"
ON public.friends FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can send friend requests
CREATE POLICY "Users can send friend requests"
ON public.friends FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update friend requests they received (accept/reject)
CREATE POLICY "Users can respond to friend requests"
ON public.friends FOR UPDATE
USING (auth.uid() = friend_id);

-- Users can delete their own friend connections
CREATE POLICY "Users can remove friends"
ON public.friends FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_friends_updated_at
BEFORE UPDATE ON public.friends
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();