-- Alpha Bank - Functions, Trigger, RPCs
-- Must run after 00001_schema.sql

-- =============================================================================
-- is_admin() - Helper for RLS policies
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND roles && ARRAY['super-admin', 'administrator']
  );
$$;

-- =============================================================================
-- handle_new_user() - Auth trigger: create user profile + account on signup
-- First user ever gets super-admin role
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  full_name_val TEXT;
  firstname_val TEXT;
  lastname_val TEXT;
  parts TEXT[];
  seq_val INTEGER;
  new_usercode TEXT;
  new_bank_number TEXT;
  initial_roles TEXT[];
  preferred_currency_val TEXT;
  account_type_val TEXT;
BEGIN
  full_name_val := COALESCE(trim(NEW.raw_user_meta_data->>'full_name'), 'User');
  parts := string_to_array(full_name_val, ' ');
  firstname_val := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'firstname'), ''), parts[1], 'User');
  lastname_val := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'lastname'), ''), array_to_string(parts[2:], ' '), '');
  IF lastname_val = '' THEN
    lastname_val := firstname_val;
  END IF;

  seq_val := nextval('public.user_seq');
  new_usercode := 'USR' || lpad(seq_val::text, 3, '0');
  new_bank_number := '104' || lpad(seq_val::text, 7, '0');
  preferred_currency_val := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'preferred_currency'), ''), 'USD');
  account_type_val := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'account_type'), ''), 'savings');

  IF (SELECT COUNT(*) FROM public.users) = 0 THEN
    initial_roles := ARRAY['super-admin', 'member'];
  ELSE
    initial_roles := ARRAY['member'];
  END IF;

  INSERT INTO public.users (id, email, full_name, bank_number, usercode, can_transfer, verified, roles)
  VALUES (NEW.id, NEW.email, full_name_val, new_bank_number, new_usercode, false, false, initial_roles);

  INSERT INTO public.user_profiles (
    user_id, firstname, lastname, phone, birthdate, gender, religion,
    address, state, city, country, zipcode,
    nok_name, nok_relationship, nok_address,
    preferred_currency, account_type, agreed_to_terms, pin_hash
  )
  VALUES (
    NEW.id, firstname_val, lastname_val,
    NULLIF(trim(NEW.raw_user_meta_data->>'phone'), ''),
    CASE WHEN NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'birthdate', '')), '') IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'birthdate')::DATE ELSE NULL END,
    NULLIF(trim(NEW.raw_user_meta_data->>'gender'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'religion'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'address'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'state'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'city'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'country'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'zipcode'), ''),
    NULLIF(trim(
      COALESCE(NEW.raw_user_meta_data->>'nok_firstname', '') || ' ' ||
      COALESCE(NEW.raw_user_meta_data->>'nok_lastname', '')
    ), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'nok_relationship'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'nok_address'), ''),
    preferred_currency_val,
    account_type_val,
    COALESCE((NEW.raw_user_meta_data->>'agreed_to_terms')::boolean, false),
    NULLIF(trim(NEW.raw_user_meta_data->>'pin_hash'), '')
  );

  INSERT INTO public.accounts (user_id, balance, currency, account_number)
  VALUES (NEW.id, 0, preferred_currency_val, new_bank_number);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- get_email_by_bank_number() - Sign-in by bank number (anon allowed)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_email_by_bank_number(bank_num TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_email TEXT;
BEGIN
  SELECT email INTO result_email
  FROM public.users
  WHERE bank_number = bank_num
  LIMIT 1;
  RETURN result_email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_by_bank_number(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_email_by_bank_number(TEXT) TO authenticated;

-- =============================================================================
-- process_transfer() - Atomic transfer: debit sender, credit recipient
-- =============================================================================
CREATE OR REPLACE FUNCTION public.process_transfer(
  p_sender_account_id UUID,
  p_recipient_account_number TEXT,
  p_amount DECIMAL,
  p_currency TEXT,
  p_tx_ref TEXT,
  p_tx_region TEXT DEFAULT 'local'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_account RECORD;
  v_recipient_account RECORD;
BEGIN
  SELECT * INTO v_sender_account
  FROM public.accounts
  WHERE id = p_sender_account_id AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND OR v_sender_account.balance < p_amount THEN
    RETURN FALSE;
  END IF;

  UPDATE public.accounts SET balance = balance - p_amount, updated_at = NOW()
  WHERE id = p_sender_account_id;

  INSERT INTO public.transactions (account_id, type, amount, currency, status, tx_ref, tx_region, recipient_account, description)
  VALUES (p_sender_account_id, 'debit', p_amount, p_currency, 'completed', p_tx_ref, p_tx_region, p_recipient_account_number,
    'Transfer to ' || p_recipient_account_number);

  SELECT * INTO v_recipient_account
  FROM public.accounts
  WHERE account_number = p_recipient_account_number
  FOR UPDATE;

  IF FOUND THEN
    UPDATE public.accounts SET balance = balance + p_amount, updated_at = NOW()
    WHERE id = v_recipient_account.id;

    INSERT INTO public.transactions (account_id, type, amount, currency, status, tx_ref, tx_region, recipient_account, description)
    VALUES (v_recipient_account.id, 'credit', p_amount, p_currency, 'completed', p_tx_ref, p_tx_region,
      v_sender_account.account_number, 'Transfer from ' || v_sender_account.account_number);
  END IF;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_transfer(UUID, TEXT, DECIMAL, TEXT, TEXT, TEXT) TO authenticated;

-- =============================================================================
-- ensure_user_profile() - Backfill: create user if auth exists but public.users missing
-- =============================================================================
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists BOOLEAN;
  v_seq_val INTEGER;
  v_usercode TEXT;
  v_bank_number TEXT;
  v_firstname TEXT;
  v_lastname TEXT;
  v_parts TEXT[];
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = p_user_id) INTO v_exists;
  IF v_exists THEN
    RETURN;
  END IF;

  v_seq_val := nextval('public.user_seq');
  v_usercode := 'USR' || lpad(v_seq_val::text, 3, '0');
  v_bank_number := '104' || lpad(v_seq_val::text, 7, '0');

  v_parts := string_to_array(COALESCE(trim(p_full_name), 'User'), ' ');
  v_firstname := COALESCE(v_parts[1], 'User');
  v_lastname := COALESCE(array_to_string(v_parts[2:], ' '), '');
  IF v_lastname = '' THEN
    v_lastname := v_firstname;
  END IF;

  INSERT INTO public.users (id, email, full_name, bank_number, usercode, can_transfer, verified, roles)
  VALUES (p_user_id, p_email, COALESCE(NULLIF(trim(p_full_name), ''), 'User'), v_bank_number, v_usercode, false, false, ARRAY['member']);

  INSERT INTO public.user_profiles (user_id, firstname, lastname)
  VALUES (p_user_id, v_firstname, v_lastname);

  INSERT INTO public.accounts (user_id, balance, currency, account_number)
  VALUES (p_user_id, 0, 'USD', v_bank_number);
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_user_profile(UUID, TEXT, TEXT) TO authenticated;
