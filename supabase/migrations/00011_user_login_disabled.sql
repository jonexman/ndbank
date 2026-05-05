-- Allow admins to disable user login (block sign-in and invalidate session)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS login_disabled BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.users.login_disabled IS 'When true, user cannot sign in; existing sessions are treated as invalid.';
