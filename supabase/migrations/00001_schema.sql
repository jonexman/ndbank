-- Alpha Bank - Database Schema
-- Run after dropping database / fresh install

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS (public profiles, linked to auth.users)
-- =============================================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  bank_number TEXT UNIQUE,
  usercode TEXT UNIQUE,
  can_transfer BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  roles TEXT[] DEFAULT ARRAY['member'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ACCOUNTS
-- =============================================================================
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  balance DECIMAL(20, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  account_number TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, currency)
);

-- =============================================================================
-- TRANSACTIONS
-- =============================================================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('debit', 'credit', 'transfer', 'deposit', 'exchange')),
  amount DECIMAL(20, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  description TEXT,
  tx_ref TEXT UNIQUE,
  tx_region TEXT,
  recipient_account TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- USER PROFILES (extended profile + admin settings)
-- =============================================================================
CREATE TABLE public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  firstname TEXT,
  lastname TEXT,
  bio TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  zipcode TEXT,
  phone TEXT,
  birthdate DATE,
  gender TEXT,
  nok_name TEXT,
  nok_phone TEXT,
  nok_relationship TEXT,
  nok_address TEXT,
  religion TEXT,
  preferred_currency TEXT DEFAULT 'USD',
  agreed_to_terms BOOLEAN DEFAULT false,
  pin_hash TEXT,
  account_type TEXT DEFAULT 'savings',
  transfer_code_otp BOOLEAN DEFAULT false,
  email_otp BOOLEAN DEFAULT false,
  kyc_document TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- LOANS
-- =============================================================================
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(20, 2) NOT NULL,
  duration TEXT NOT NULL,
  loan_type TEXT NOT NULL,
  reason TEXT,
  loan_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  funded DECIMAL(20, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- EXCHANGES
-- =============================================================================
CREATE TABLE public.exchanges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  paid_amount DECIMAL(20, 2) NOT NULL,
  paid_currency TEXT NOT NULL,
  usd_value DECIMAL(20, 2) NOT NULL,
  expected_amount DECIMAL(20, 2) NOT NULL,
  expected_currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  funded DECIMAL(20, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CARDS
-- =============================================================================
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL,
  vendor TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CHEQUES
-- =============================================================================
CREATE TABLE public.cheques (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cheque_number TEXT NOT NULL,
  amount DECIMAL(20, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payee TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'bounced')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SEQUENCE (for user numbering: usercode, bank_number)
-- =============================================================================
CREATE SEQUENCE public.user_seq START 1;

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_transactions_tx_ref ON public.transactions(tx_ref);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_loans_user_id ON public.loans(user_id);
CREATE INDEX idx_exchanges_user_id ON public.exchanges(user_id);
CREATE INDEX idx_cards_user_id ON public.cards(user_id);
CREATE INDEX idx_cheques_user_id ON public.cheques(user_id);
CREATE INDEX idx_cheques_status ON public.cheques(status);
