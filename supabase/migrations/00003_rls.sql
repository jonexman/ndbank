-- Alpha Bank - Row Level Security
-- Requires: is_admin() from 00002_functions.sql

-- =============================================================================
-- USERS
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "users_admin_select" ON public.users FOR SELECT
  USING (is_admin());

CREATE POLICY "users_admin_update" ON public.users FOR UPDATE
  USING (is_admin());

-- =============================================================================
-- ACCOUNTS
-- =============================================================================
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accounts_select_own" ON public.accounts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "accounts_update_own" ON public.accounts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "accounts_admin_select" ON public.accounts FOR SELECT
  USING (is_admin());

CREATE POLICY "accounts_admin_update" ON public.accounts FOR UPDATE
  USING (is_admin());

-- =============================================================================
-- TRANSACTIONS
-- =============================================================================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select_own" ON public.transactions FOR SELECT
  USING (
    account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid())
  );

CREATE POLICY "transactions_insert_own" ON public.transactions FOR INSERT
  WITH CHECK (
    account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid())
  );

CREATE POLICY "transactions_admin_select" ON public.transactions FOR SELECT
  USING (is_admin());

CREATE POLICY "transactions_admin_insert" ON public.transactions FOR INSERT
  WITH CHECK (is_admin());

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- =============================================================================
-- USER_PROFILES
-- =============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles_select_own" ON public.user_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_profiles_update_own" ON public.user_profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "user_profiles_insert_own" ON public.user_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_profiles_admin_select" ON public.user_profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "user_profiles_admin_update" ON public.user_profiles FOR UPDATE
  USING (is_admin());

-- =============================================================================
-- LOANS
-- =============================================================================
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loans_select_own" ON public.loans FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "loans_insert_own" ON public.loans FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "loans_admin_select" ON public.loans FOR SELECT
  USING (is_admin());

-- =============================================================================
-- EXCHANGES
-- =============================================================================
ALTER TABLE public.exchanges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exchanges_select_own" ON public.exchanges FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "exchanges_insert_own" ON public.exchanges FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "exchanges_admin_select" ON public.exchanges FOR SELECT
  USING (is_admin());

-- =============================================================================
-- CARDS
-- =============================================================================
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cards_select_own" ON public.cards FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "cards_insert_own" ON public.cards FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "cards_admin_select" ON public.cards FOR SELECT
  USING (is_admin());

-- =============================================================================
-- CHEQUES
-- =============================================================================
ALTER TABLE public.cheques ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cheques_select_own" ON public.cheques FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "cheques_insert_own" ON public.cheques FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "cheques_admin_select" ON public.cheques FOR SELECT
  USING (is_admin());
