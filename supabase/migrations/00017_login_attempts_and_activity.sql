-- Login attempt limiting and logging: allow failed attempts in activity log (no user_id).
-- user_id NULL + attempted_identifier for login_failed; rate limit uses count in last 30 mins.

ALTER TABLE public.user_activity_log
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.user_activity_log
  DROP CONSTRAINT IF EXISTS user_activity_log_event_type_check;

ALTER TABLE public.user_activity_log
  ADD CONSTRAINT user_activity_log_event_type_check
  CHECK (event_type IN ('login', 'logout', 'login_failed'));

ALTER TABLE public.user_activity_log
  ADD COLUMN IF NOT EXISTS attempted_identifier TEXT;

COMMENT ON COLUMN public.user_activity_log.attempted_identifier IS 'Email (or identifier) used for login_failed events when user_id is NULL';

CREATE INDEX IF NOT EXISTS idx_user_activity_log_attempted_identifier_created_at
  ON public.user_activity_log(attempted_identifier, created_at DESC)
  WHERE event_type = 'login_failed';
