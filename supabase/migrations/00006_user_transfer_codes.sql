-- User-defined transfer codes (OTP, COT, IMF, TAX, etc.) stored in DB
-- User creates codes, sets value, sets order for transaction flow

CREATE TABLE public.user_transfer_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code_type TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, code_type)
);

CREATE INDEX idx_user_transfer_codes_user_id ON public.user_transfer_codes(user_id);
CREATE INDEX idx_user_transfer_codes_sort ON public.user_transfer_codes(user_id, sort_order);

ALTER TABLE public.user_transfer_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_transfer_codes_select_own" ON public.user_transfer_codes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_transfer_codes_insert_own" ON public.user_transfer_codes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_transfer_codes_update_own" ON public.user_transfer_codes
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_transfer_codes_delete_own" ON public.user_transfer_codes
  FOR DELETE USING (user_id = auth.uid());

-- Admins can manage for support
CREATE POLICY "user_transfer_codes_admins_all" ON public.user_transfer_codes
  FOR ALL USING (public.is_admin());

-- Make otp_code optional in transfer_otps (no longer used; codes come from user_transfer_codes)
ALTER TABLE public.transfer_otps ALTER COLUMN otp_code DROP NOT NULL;
