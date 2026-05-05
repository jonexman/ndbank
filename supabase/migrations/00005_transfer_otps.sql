-- Pending transfers with OTP for PIN + OTP flow

CREATE TABLE public.transfer_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tx_ref TEXT UNIQUE NOT NULL,
  otp_code TEXT NOT NULL,
  recipient_account TEXT NOT NULL,
  amount DECIMAL(20, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  tx_region TEXT NOT NULL DEFAULT 'local',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'expired', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_transfer_otps_user_id ON public.transfer_otps(user_id);
CREATE INDEX idx_transfer_otps_tx_ref ON public.transfer_otps(tx_ref);
CREATE INDEX idx_transfer_otps_status ON public.transfer_otps(status);
CREATE INDEX idx_transfer_otps_expires_at ON public.transfer_otps(expires_at);

-- RLS
ALTER TABLE public.transfer_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transfer_otps_users_select_own" ON public.transfer_otps
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "transfer_otps_users_insert_own" ON public.transfer_otps
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can select all (for pending transfers panel)
CREATE POLICY "transfer_otps_admins_select" ON public.transfer_otps
  FOR SELECT USING (public.is_admin());

-- Admins can update (approve/reject)
CREATE POLICY "transfer_otps_admins_update" ON public.transfer_otps
  FOR UPDATE USING (public.is_admin());

-- =============================================================================
-- admin_approve_transfer() - Admin approves pending transfer (no user OTP)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.admin_approve_transfer(p_tx_ref TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_otp RECORD;
  v_sender_account RECORD;
  v_recipient_account RECORD;
BEGIN
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  SELECT * INTO v_otp
  FROM public.transfer_otps
  WHERE tx_ref = p_tx_ref AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transfer not found or already processed');
  END IF;

  IF v_otp.expires_at < NOW() THEN
    UPDATE public.transfer_otps SET status = 'expired' WHERE id = v_otp.id;
    RETURN jsonb_build_object('success', false, 'error', 'Transfer expired');
  END IF;

  SELECT * INTO v_sender_account
  FROM public.accounts
  WHERE user_id = v_otp.user_id AND currency = v_otp.currency
  FOR UPDATE;

  IF NOT FOUND OR v_sender_account.balance < v_otp.amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sender account not found or insufficient funds');
  END IF;

  UPDATE public.accounts SET balance = balance - v_otp.amount, updated_at = NOW()
  WHERE id = v_sender_account.id;

  INSERT INTO public.transactions (account_id, type, amount, currency, status, tx_ref, tx_region, recipient_account, description)
  VALUES (v_sender_account.id, 'debit', v_otp.amount, v_otp.currency, 'completed', v_otp.tx_ref, v_otp.tx_region,
    v_otp.recipient_account, 'Transfer to ' || v_otp.recipient_account);

  SELECT * INTO v_recipient_account
  FROM public.accounts
  WHERE account_number = v_otp.recipient_account
  FOR UPDATE;

  IF FOUND THEN
    UPDATE public.accounts SET balance = balance + v_otp.amount, updated_at = NOW()
    WHERE id = v_recipient_account.id;

    INSERT INTO public.transactions (account_id, type, amount, currency, status, tx_ref, tx_region, recipient_account, description)
    VALUES (v_recipient_account.id, 'credit', v_otp.amount, v_otp.currency, 'completed', v_otp.tx_ref, v_otp.tx_region,
      v_sender_account.account_number, 'Transfer from ' || v_sender_account.account_number);
  END IF;

  UPDATE public.transfer_otps SET status = 'approved' WHERE id = v_otp.id;

  RETURN jsonb_build_object('success', true, 'tx_ref', v_otp.tx_ref);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_approve_transfer(TEXT) TO authenticated;
