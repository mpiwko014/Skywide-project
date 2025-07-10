-- Add foreign key constraint to enable proper joins between content_requests and profiles
ALTER TABLE public.content_requests 
ADD CONSTRAINT content_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;