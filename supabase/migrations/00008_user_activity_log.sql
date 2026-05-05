-- User activity log: login/logout with IP tracking for admin
CREATE TABLE public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout')),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_created_at ON public.user_activity_log(created_at DESC);

-- RLS: only admins can read; inserts done server-side with service role
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read user_activity_log"
  ON public.user_activity_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND (u.roles @> ARRAY['super-admin'] OR u.roles @> ARRAY['administrator'])
    )
  );
