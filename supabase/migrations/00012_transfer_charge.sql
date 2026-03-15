-- Transfer charge: fee_amount on each pending transfer, and site-wide charge % settings
ALTER TABLE public.transfer_otps
  ADD COLUMN IF NOT EXISTS fee_amount DECIMAL(20, 2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.transfer_otps.fee_amount IS 'Transfer fee (charge) in same currency as amount. Sender is debited amount + fee_amount.';

INSERT INTO public.site_options (key, value) VALUES
  ('local_transfer_charge_pct', '0'),
  ('international_transfer_charge_pct', '0')
ON CONFLICT (key) DO NOTHING;

-- Update admin_approve_transfer to debit amount + fee from sender, credit amount to recipient
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
  v_total_debit DECIMAL(20, 2);
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

  v_total_debit := v_otp.amount + COALESCE(v_otp.fee_amount, 0);

  SELECT * INTO v_sender_account
  FROM public.accounts
  WHERE user_id = v_otp.user_id AND currency = v_otp.currency
  FOR UPDATE;

  IF NOT FOUND OR v_sender_account.balance < v_total_debit THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sender account not found or insufficient funds');
  END IF;

  UPDATE public.accounts SET balance = balance - v_total_debit, updated_at = NOW()
  WHERE id = v_sender_account.id;

  INSERT INTO public.transactions (account_id, type, amount, currency, status, tx_ref, tx_region, recipient_account, description)
  VALUES (v_sender_account.id, 'debit', v_total_debit, v_otp.currency, 'completed', v_otp.tx_ref, v_otp.tx_region,
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
