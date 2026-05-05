-- Transfer codes are one-time use: once used to complete a transfer, they cannot be reused.
ALTER TABLE public.user_transfer_codes
  ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN public.user_transfer_codes.used_at IS 'Set when this code was used to complete a transfer. Codes with used_at set cannot be used again.';

CREATE INDEX IF NOT EXISTS idx_user_transfer_codes_used_at
  ON public.user_transfer_codes (user_id, used_at) WHERE used_at IS NULL;
