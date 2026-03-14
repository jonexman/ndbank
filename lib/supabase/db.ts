/**
 * Reusable database helper functions for Supabase.
 * Use with the server client for authenticated operations.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type DbUser = {
  id: string;
  email: string;
  full_name: string;
  bank_number: string | null;
  usercode: string | null;
  can_transfer: boolean;
  verified: boolean;
  roles: string[] | null;
  created_at: string;
};

export type DbAccount = {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  account_number: string | null;
  created_at: string;
};

export type DbTransaction = {
  id: string;
  account_id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  tx_ref: string | null;
  tx_region: string | null;
  recipient_account: string | null;
  created_at: string;
};

export type DbUserTransferCode = {
  id: string;
  user_id: string;
  code_type: string;
  code_hash: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DbTransferOtp = {
  id: string;
  user_id: string;
  tx_ref: string;
  otp_code: string;
  recipient_account: string;
  amount: number;
  currency: string;
  tx_region: string;
  status: string;
  created_at: string;
  expires_at: string;
};

export type DbUserProfile = {
  user_id: string;
  firstname: string | null;
  lastname: string | null;
  pin_hash?: string | null;
  bio: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  nok_name: string | null;
  nok_phone: string | null;
  nok_relationship: string | null;
  nok_address: string | null;
  account_type?: string | null;
  transfer_code_otp?: boolean | null;
  email_otp?: boolean | null;
  kyc_document?: string | null;
  kyc_status?: string | null;
  kyc_rejection_reason?: string | null;
  kyc_submitted_at?: string | null;
  verified?: boolean;
};

export async function getUserById(
  supabase: SupabaseClient,
  userId: string
): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return data as DbUser;
}

export async function getUserByUsercode(
  supabase: SupabaseClient,
  usercode: string
): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("usercode", usercode)
    .single();
  if (error || !data) return null;
  return data as DbUser;
}

export async function getUserByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("email", email)
    .single();
  if (error || !data) return null;
  return data as DbUser;
}

export async function getAccountByUserId(
  supabase: SupabaseClient,
  userId: string,
  currency = "USD"
): Promise<DbAccount | null> {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("currency", currency)
    .single();
  if (error || !data) return null;
  return data as DbAccount;
}

export async function getAccountByAccountNumber(
  supabase: SupabaseClient,
  accountNumber: string
): Promise<DbAccount | null> {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("account_number", accountNumber)
    .single();
  if (error || !data) return null;
  return data as DbAccount;
}

export async function getAccountsByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<DbAccount[]> {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []) as DbAccount[];
}

export async function getTransactionsByAccountId(
  supabase: SupabaseClient,
  accountId: string,
  limit = 50,
  offset = 0
): Promise<DbTransaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) return [];
  return (data ?? []) as DbTransaction[];
}

export async function getTransactionsByUserId(
  supabase: SupabaseClient,
  userId: string,
  limit = 50,
  offset = 0
): Promise<DbTransaction[]> {
  const accounts = await getAccountsByUserId(supabase, userId);
  if (accounts.length === 0) return [];
  const accountIds = accounts.map((a) => a.id);
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .in("account_id", accountIds)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) return [];
  return (data ?? []) as DbTransaction[];
}

export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<DbUserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error || !data) return null;
  return data as DbUserProfile;
}

export async function createTransaction(
  supabase: SupabaseClient,
  accountId: string,
  type: string,
  amount: number,
  currency: string,
  options?: {
    description?: string;
    tx_ref?: string;
    tx_region?: string;
    recipient_account?: string;
    status?: string;
  }
): Promise<{ data: DbTransaction | null; error: Error | null }> {
  const txRef = options?.tx_ref ?? `TNX${Date.now().toString(16).toUpperCase()}`;
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      account_id: accountId,
      type,
      amount,
      currency,
      status: options?.status ?? "completed",
      description: options?.description ?? null,
      tx_ref: txRef,
      tx_region: options?.tx_region ?? null,
      recipient_account: options?.recipient_account ?? null,
    })
    .select()
    .single();
  return {
    data: error ? null : (data as DbTransaction),
    error: error ? new Error(error.message) : null,
  };
}

export async function createTransferOtp(
  supabase: SupabaseClient,
  data: {
    user_id: string;
    tx_ref: string;
    otp_code?: string | null;
    recipient_account: string;
    amount: number;
    currency: string;
    tx_region: string;
    expires_at: string;
  }
): Promise<{ data: DbTransferOtp | null; error: Error | null }> {
  const { data: row, error } = await supabase
    .from("transfer_otps")
    .insert(data)
    .select()
    .single();
  return {
    data: error ? null : (row as DbTransferOtp),
    error: error ? new Error(error.message) : null,
  };
}

export async function getTransferOtpByTxRef(
  supabase: SupabaseClient,
  txRef: string,
  userId?: string
): Promise<DbTransferOtp | null> {
  let q = supabase
    .from("transfer_otps")
    .select("*")
    .eq("tx_ref", txRef)
    .eq("status", "pending")
    .single();
  if (userId) {
    q = q.eq("user_id", userId);
  }
  const { data, error } = await q;
  if (error || !data) return null;
  return data as DbTransferOtp;
}

export async function updateTransferOtpStatus(
  supabase: SupabaseClient,
  id: string,
  status: "approved" | "expired" | "rejected"
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("transfer_otps").update({ status }).eq("id", id);
  return { error: error ? new Error(error.message) : null };
}

export async function getUserTransferCodes(
  supabase: SupabaseClient,
  userId: string
): Promise<DbUserTransferCode[]> {
  const { data, error } = await supabase
    .from("user_transfer_codes")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []) as DbUserTransferCode[];
}

export async function createUserTransferCode(
  supabase: SupabaseClient,
  data: { user_id: string; code_type: string; code_hash: string; sort_order: number }
): Promise<{ data: DbUserTransferCode | null; error: Error | null }> {
  const { data: row, error } = await supabase
    .from("user_transfer_codes")
    .insert({ ...data, updated_at: new Date().toISOString() })
    .select()
    .single();
  return {
    data: error ? null : (row as DbUserTransferCode),
    error: error ? new Error(error.message) : null,
  };
}

export async function updateUserTransferCode(
  supabase: SupabaseClient,
  id: string,
  updates: { code_hash?: string; sort_order?: number }
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from("user_transfer_codes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  return { error: error ? new Error(error.message) : null };
}

export async function deleteUserTransferCode(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from("user_transfer_codes")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return { error: error ? new Error(error.message) : null };
}

export async function getPendingTransferOtps(supabase: SupabaseClient): Promise<DbTransferOtp[]> {
  const { data, error } = await supabase
    .from("transfer_otps")
    .select("*")
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as DbTransferOtp[];
}

export async function getPendingTransferOtpsByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<DbTransferOtp[]> {
  const { data, error } = await supabase
    .from("transfer_otps")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as DbTransferOtp[];
}

export async function updateAccountBalance(
  supabase: SupabaseClient,
  accountId: string,
  delta: number
): Promise<{ error: Error | null }> {
  const { data: account } = await supabase
    .from("accounts")
    .select("balance")
    .eq("id", accountId)
    .single();
  if (!account) return { error: new Error("Account not found") };
  const newBalance = Math.max(0, (account.balance as number) + delta);
  const { error } = await supabase
    .from("accounts")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", accountId);
  return { error: error ? new Error(error.message) : null };
}
