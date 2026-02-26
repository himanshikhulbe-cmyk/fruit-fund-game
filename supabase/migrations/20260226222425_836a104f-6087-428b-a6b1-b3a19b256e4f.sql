
-- Create security definer function for membership checks (bypasses RLS)
CREATE OR REPLACE FUNCTION public.check_circle_membership(_circle_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.circle_members
    WHERE circle_id = _circle_id AND user_id = _user_id
  );
$$;

-- Get all circle IDs for a user
CREATE OR REPLACE FUNCTION public.get_user_circle_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT circle_id FROM public.circle_members WHERE user_id = _user_id;
$$;
