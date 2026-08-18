
CREATE OR REPLACE FUNCTION public.safe_uuid(_txt text)
RETURNS uuid
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN _txt::uuid;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.safe_uuid(text) FROM PUBLIC, anon;

DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='storage' AND tablename='objects'
           AND (qual ILIKE '%goal-images%' OR with_check ILIKE '%goal-images%')
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "Goal images: owners and circle members can read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'goal-images' AND (
    EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = public.safe_uuid((storage.foldername(name))[1])
        AND g.user_id = auth.uid()
    )
    OR (
      (storage.foldername(name))[1] = 'circle-goals'
      AND public.check_circle_membership(public.safe_uuid((storage.foldername(name))[2]), auth.uid())
    )
  )
);

CREATE POLICY "Goal images: owners and circle members can upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'goal-images' AND (
    EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = public.safe_uuid((storage.foldername(name))[1])
        AND g.user_id = auth.uid()
    )
    OR (
      (storage.foldername(name))[1] = 'circle-goals'
      AND public.check_circle_membership(public.safe_uuid((storage.foldername(name))[2]), auth.uid())
    )
  )
);

CREATE POLICY "Goal images: owners and circle members can delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'goal-images' AND (
    EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = public.safe_uuid((storage.foldername(name))[1])
        AND g.user_id = auth.uid()
    )
    OR (
      (storage.foldername(name))[1] = 'circle-goals'
      AND public.check_circle_membership(public.safe_uuid((storage.foldername(name))[2]), auth.uid())
    )
  )
);

DROP FUNCTION IF EXISTS public.is_circle_member(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_user_circle_ids(uuid);

CREATE OR REPLACE FUNCTION public.find_circle_by_invite_code(_invite_code text)
RETURNS TABLE(id uuid, name text, invite_code text, created_by uuid, created_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.name, c.invite_code, c.created_by, c.created_at
  FROM public.circles c
  WHERE auth.uid() IS NOT NULL
    AND c.invite_code = _invite_code
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.find_circle_by_invite_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.find_circle_by_invite_code(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.check_circle_membership(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_circle_membership(uuid, uuid) TO authenticated, service_role;
