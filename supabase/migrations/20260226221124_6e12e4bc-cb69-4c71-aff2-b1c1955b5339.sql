
-- Security definer function to find a circle by invite code (bypasses RLS)
CREATE OR REPLACE FUNCTION public.find_circle_by_invite_code(_invite_code text)
RETURNS TABLE(id uuid, name text, invite_code text, created_by uuid, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.name, c.invite_code, c.created_by, c.created_at
  FROM public.circles c
  WHERE c.invite_code = _invite_code
  LIMIT 1;
$$;

-- Security definer function to check if user is already a member
CREATE OR REPLACE FUNCTION public.is_circle_member(_circle_id uuid, _user_id uuid)
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
