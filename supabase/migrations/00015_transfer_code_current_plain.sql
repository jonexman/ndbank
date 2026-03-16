-- Store current plain code for admin display only. Never expose to user.
-- Updated when admin creates a code and when system rotates after user completes a transfer.
ALTER TABLE public.user_transfer_codes
  ADD COLUMN IF NOT EXISTS current_plain_code TEXT DEFAULT NULL;

COMMENT ON COLUMN public.user_transfer_codes.current_plain_code IS 'Current code value for admin to show to user. Admin-only; never expose to user APIs.';
