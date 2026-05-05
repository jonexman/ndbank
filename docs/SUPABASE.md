# Supabase Integration Guide

This document describes the Supabase setup, database schema, authentication flow, and maintenance guidelines for the Alpha Bank e-banking application.

## Table of Contents

1. [Setup](#setup)
2. [Database Schema](#database-schema)
3. [Authentication Flow](#authentication-flow)
4. [File Structure](#file-structure)
5. [API Routes](#api-routes)
6. [Row Level Security (RLS)](#row-level-security-rls)
7. [Running Migrations](#running-migrations)

---

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from your [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API.

### 2. Run Migrations

In the Supabase SQL Editor, run the migration files in order:

1. `supabase/migrations/00001_schema.sql` - Tables, extensions, indexes
2. `supabase/migrations/00002_functions.sql` - Auth trigger, is_admin, RPCs (get_email_by_bank_number, process_transfer, ensure_user_profile)
3. `supabase/migrations/00003_rls.sql` - Row Level Security policies
4. `supabase/migrations/00004_kyc.sql` - KYC status, storage bucket for documents

---

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| **users** | App profiles linked to `auth.users`. Stores `id`, `email`, `full_name`, `bank_number`, `usercode`, `can_transfer`, `verified`, `roles` |
| **accounts** | User bank accounts. One per user/currency. Stores `balance`, `currency`, `account_number` |
| **transactions** | Transaction records. Types: `debit`, `credit`, `transfer`, `deposit`, `exchange` |
| **user_profiles** | Extended profile (address, NOK, etc.) |
| **notifications** | Optional user notifications |
| **loans** | Loan applications |
| **exchanges** | Currency exchange requests |
| **cards** | Card applications |
| **cheques** | Cheque deposits (pending/cleared/bounced) |

### Relationships

- `users.id` → `auth.users.id` (Supabase Auth)
- `accounts.user_id` → `users.id`
- `transactions.account_id` → `accounts.id`
- `user_profiles.user_id` → `users.id`
- `notifications.user_id`, `loans.user_id`, `exchanges.user_id`, `cards.user_id` → `users.id`

---

## Authentication Flow

### Sign Up

1. User submits email, password, firstname, lastname
2. `POST /api/auth/signup` calls `supabase.auth.signUp()` with `user_metadata: { full_name }`
3. Supabase creates `auth.users` row
4. Trigger `on_auth_user_created` fires:
   - Inserts `public.users` with bank_number, usercode
   - Inserts `public.user_profiles` with firstname, lastname
   - Inserts default `public.accounts` (USD, balance 0)
5. Session cookies are set by Supabase

### Sign In

1. User submits login (email or bank number) and password
2. If login is a bank number (digits only), `get_email_by_bank_number` RPC looks up email
3. `POST /api/auth/signin` calls `supabase.auth.signInWithPassword()`
4. Session is stored in HTTP-only cookies

### Session Handling

- **Middleware** (`middleware.ts`): Refreshes Supabase session on every request
- **Server components/API**: Use `createClient()` from `lib/supabase/server.ts`
- **Client components**: Use `createClient()` from `lib/supabase/client.ts`
- **Auth state**: `AuthProvider` fetches `/api/auth/session` and provides `userId`, `email`, `signOut`

### Protected Routes

Dashboard pages check `useAuth().userId`. If null and not loading, redirect to `/dashboard/signin`.

### Sign Out

`POST /api/auth/signout` calls `supabase.auth.signOut()` and clears session cookies.

---

## File Structure

```
lib/supabase/
├── client.ts      # Browser Supabase client (use in Client Components)
├── server.ts      # Server Supabase client (API routes, Server Components)
├── middleware.ts  # Session refresh for middleware
└── db.ts          # Reusable DB helpers (getUserById, getAccountByUserId, etc.)

components/providers/
└── AuthProvider.tsx  # Auth context with userId, signOut
```

---

## API Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/signin` | POST | No | Sign in with email or bank number |
| `/api/auth/signup` | POST | No | Register new user |
| `/api/auth/signout` | POST | Yes | Sign out |
| `/api/auth/session` | GET | Yes | Get current user |
| `/api/dashboard/user` | GET | Yes | User + balance + transactions |
| `/api/dashboard/account` | GET | Yes | User + profile |
| `/api/dashboard/statement` | GET | Yes | Statement (optional ?month=) |
| `/api/transfer` | POST | Yes | Create transfer |
| `/api/monetary/deposit` | POST | Yes | Submit bank/crypto deposit |
| `/api/monetary/cheque` | POST | Yes | Submit cheque for clearing |
| `/api/dashboard/loan/apply` | POST | Yes | Apply for loan |
| `/api/dashboard/loan/status` | GET | Yes | List user loans |
| `/api/dashboard/exchange` | GET/POST | Yes | Currencies + exchange request |
| `/api/cards/apply` | POST | Yes | Apply for card |

---

## Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:

- **users**: Users can SELECT and UPDATE only their own row
- **accounts**: Users can SELECT/UPDATE only their own accounts
- **transactions**: Users can SELECT/INSERT only for their own accounts
- **notifications**: Users can SELECT/UPDATE only their own
- **user_profiles**: Users can SELECT/UPDATE/INSERT only their own
- **loans, exchanges, cards**: Users can SELECT/INSERT only their own

### Special Functions

- `get_email_by_bank_number(bank_num)` – SECURITY DEFINER, allows unauthenticated lookup for sign-in
- `process_transfer(...)` – SECURITY DEFINER, validates sender owns account, then debits/credits atomically

---

## Running Migrations

### Option 1: Supabase Dashboard

1. Go to your project → SQL Editor
2. Paste each migration file content
3. Run in order (00001 → 00002 → 00003)

### Option 2: Supabase CLI

```bash
supabase link --project-ref your-project-ref
supabase db push
```

> After dropping the database, run migrations 00001 → 00002 → 00003 in order.

---

## Error Handling

- API routes return appropriate HTTP status codes (400, 401, 404, 500)
- Client components show loading states and redirect on 401
- Form submissions display success/error messages

---

## Admin Panel

- **First user** = super-admin (assigned automatically when the first account is created)
- **Admin access**: Only users with `super-admin` or `administrator` role can access `/admin`
- **Role assignment**: Super-admins can assign roles (member, administrator, super-admin) on the Edit User page
- **Admin APIs** use `requireAdmin()` to verify the session user has admin role before returning data


1. **Always use the server client in API routes** – `createClient()` from `lib/supabase/server.ts`
2. **Use `supabase.auth.getUser()`** – Not `getSession()`, for server-side auth checks
3. **Never expose the service role key** – Use anon key for client and API routes
4. **Test RLS** – Create test users and verify they cannot access each other's data
