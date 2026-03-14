/**
 * Mock data layer - mirrors PHP Alpha Bank tables for in-memory use.
 * Clone of uss_users, uss_usermeta, uss_transfers, uss_transfer_meta,
 * uss_deposits, uss_payment_methods, uss_cards
 */

export type MockUserRole = "member" | "super-admin" | "administrator";

export interface MockUserProfile {
  userid: number;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  phone?: string;
  firstname?: string;
  lastname?: string;
  birthdate?: string;
  gender?: string;
  religion?: string;
  nok_name?: string;
  nok_firstname?: string;
  nok_lastname?: string;
  nok_phone?: string;
  nok_relationship?: string;
  nok_address?: string;
  location?: string;
  verified: boolean;
}

export interface MockUserEditMeta {
  userid: number;
  username?: string;
  pin?: string;
  register_time?: string;
  last_seen?: string;
  accountType?: string;
}

export interface MockBeneficiary {
  id: number;
  userid: number;
  name: string;
  account_number: string;
  bank_name?: string;
  bank_code?: string;
  type: "local" | "international" | "mobile";
  mobile_provider?: string;
}

export interface MockCheque {
  id: number;
  userid: number;
  cheque_number: string;
  amount: number;
  currency: string;
  payee: string;
  status: "pending" | "cleared" | "bounced";
  date: string;
}

export interface MockAccountType {
  id: number;
  name: string;
  code: string;
  min_balance?: number;
  description?: string;
}

export interface MockTransferCode {
  id: number;
  code: string;
  name: string;
  description?: string;
  rate?: number;
}

/** PHP-style: [{ imf: "7325" }, { cot: "2348" }, { tax: null }] - null = auto/send to email */
export type TransferCodeRow = Record<string, string | number | null>;

export interface MockSiteOption {
  key: string;
  value: string;
}

export interface MockUser {
  id: number;
  usercode: string;
  username?: string;
  email: string;
  firstname: string;
  lastname: string;
  bankNumber: string;
  balance: number;
  currency: string;
  canTransfer: boolean;
  verified: boolean;
  roles?: MockUserRole[];
  register_time?: string;
  last_seen?: string;
}

export interface MockTransfer {
  id: number;
  tx_ref: string;
  amount: number;
  currency: string;
  tx_date: string;
  tx_region: string;
  bank_account: string;
  bank_holder?: string;
}

export interface MockTransferMeta {
  id: number;
  tx_ref: string;
  account_number: string;
  tx_type: "debit" | "credit";
  amount: number;
}

export interface MockDeposit {
  id: number;
  tx_ref: string;
  userid: number;
  usd_amount: number;
  network?: string;
  rate: number;
  detail: string;
  status: string;
  paid: number;
}

export interface MockPaymentMethod {
  id: number;
  medium: "crypto" | "bank";
  network?: string | null;
  name: string;
  detail: string;
}

export interface MockCard {
  id: number;
  userid: number;
  card_type: string;
  vendor: string;
  cvv: string;
  card_number: string;
  expiry: string;
  status: string;
}

// In-memory stores (mutable for API routes)
let transferIdCounter = 100;
let transferMetaIdCounter = 100;
let depositIdCounter = 10;
let cardIdCounter = 10;

export interface MockLoan {
  id: number;
  userid: number;
  amount: number;
  duration: string;
  loan_type: string;
  reason?: string;
  loan_id: string;
  status: string;
  funded: number;
  date: string;
}

export interface MockExchange {
  id: number;
  userid: number;
  paid_amount: number;
  paid_currency: string;
  usd_value: number;
  expected_amount: number;
  expected_currency: string;
  status: string;
  funded: number;
  date: string;
}

let loanIdCounter = 10;
let exchangeIdCounter = 10;

export const mockUsers: MockUser[] = [
  {
    id: 1,
    usercode: "USR001",
    username: "admin",
    email: "admin@alphabank.com",
    firstname: "Admin",
    lastname: "User",
    bankNumber: "1041430848",
    balance: 5000,
    currency: "USD",
    canTransfer: true,
    verified: true,
    roles: ["super-admin", "member"],
    register_time: "2024-01-15 10:00:00",
    last_seen: "2h"
  },
  {
    id: 2,
    usercode: "USR002",
    username: "ngozi",
    email: "ngozikaluali@gmail.com",
    firstname: "Ngozi",
    lastname: "Kalu",
    bankNumber: "1042251509",
    balance: 0,
    currency: "USD",
    canTransfer: true,
    verified: false,
    roles: ["member"],
    register_time: "2024-03-08 23:31:59",
    last_seen: "29m"
  },
  {
    id: 3,
    usercode: "USR003",
    username: "jane",
    email: "jane@example.com",
    firstname: "Jane",
    lastname: "Doe",
    bankNumber: "1043346123",
    balance: 15000,
    currency: "USD",
    canTransfer: false,
    verified: false,
    roles: ["member"],
    register_time: "2024-02-10 14:20:00",
    last_seen: "5d"
  }
];

export const mockUserProfiles: MockUserProfile[] = [
  {
    userid: 1,
    bio: "Alpha Bank administrator",
    firstname: "Admin",
    lastname: "User",
    address: "123 Admin Street, Suite 100",
    location: "123 Admin Street",
    state: "NY",
    city: "New York",
    country: "US",
    zipcode: "10001",
    phone: "+1 555 0100",
    birthdate: "1990-01-15",
    gender: "male",
    religion: "",
    nok_name: "Sarah User",
    nok_firstname: "Sarah",
    nok_lastname: "User",
    nok_phone: "+1 555 0101",
    nok_relationship: "Spouse",
    nok_address: "123 Admin Street",
    verified: true
  },
  {
    userid: 2,
    bio: "",
    firstname: "Ngozi",
    lastname: "Kalu",
    address: "",
    location: "",
    state: "",
    city: "",
    country: "AF",
    zipcode: "",
    phone: "",
    birthdate: "",
    gender: "female",
    religion: "",
    nok_firstname: "",
    nok_lastname: "",
    nok_relationship: "",
    nok_address: "",
    verified: false
  },
  {
    userid: 3,
    bio: "",
    firstname: "Jane",
    lastname: "Doe",
    address: "",
    location: "",
    state: "",
    city: "",
    country: "",
    zipcode: "",
    phone: "",
    birthdate: "",
    gender: "",
    religion: "",
    nok_firstname: "",
    nok_lastname: "",
    nok_relationship: "",
    nok_address: "",
    verified: false
  }
];

export const mockBeneficiaries: MockBeneficiary[] = [
  { id: 1, userid: 1, name: "John Smith", account_number: "1043345995", bank_name: "Alpha Bank", type: "local" },
  { id: 2, userid: 1, name: "Jane Doe", account_number: "GB82WEST12345698765432", bank_name: "UK Bank", type: "international" },
  { id: 3, userid: 1, name: "Mobile Pay", account_number: "07012345678", mobile_provider: "MTN", type: "mobile" }
];

export const mockCheques: MockCheque[] = [
  {
    id: 1,
    userid: 1,
    cheque_number: "CHQ001234",
    amount: 500,
    currency: "USD",
    payee: "ABC Corp",
    status: "cleared",
    date: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    userid: 2,
    cheque_number: "CHQ001235",
    amount: 1200,
    currency: "USD",
    payee: "XYZ Ltd",
    status: "pending",
    date: "2024-02-01T14:30:00Z"
  }
];

export const mockAccountTypes: MockAccountType[] = [
  { id: 1, name: "Savings", code: "SAV", min_balance: 100, description: "Standard savings account" },
  { id: 2, name: "Current", code: "CUR", min_balance: 500, description: "Current/checking account" },
  { id: 3, name: "Premium", code: "PRM", min_balance: 5000, description: "Premium tier account" }
];

export const mockTransferCodes: MockTransferCode[] = [
  { id: 1, code: "IMF", name: "International Monetary Fee", description: "Cross-border transfer fee", rate: 0.01 },
  { id: 2, code: "COT", name: "Commission on Turnover", description: "Transaction commission", rate: 0.005 },
  { id: 3, code: "TAX", name: "Tax", description: "Applicable tax", rate: 0 }
];

/** PHP-style transfer codes for Configure > Transfer Codes: [{ imf: null }, { cot: "2348" }, { tax: null }] */
export let mockTransferCodeRows: TransferCodeRow[] = [
  { imf: null },
  { cot: "2348" },
  { tax: null },
];

export const mockSiteOptions: MockSiteOption[] = [
  { key: "site_title", value: "Alpha Bank" },
  { key: "site_tagline", value: "Your Trusted Banking Partner" },
  { key: "site_description", value: "Digital banking platform for secure payments, deposits, loans and investment services." },
  { key: "admin_email", value: "admin@alphabank.com" },
  { key: "smtp_host", value: "smtp.example.com" },
  { key: "smtp_port", value: "587" },
  { key: "user_min_age", value: "18" },
  { key: "transfer_limit", value: "10000" }
];

export const mockLoans: MockLoan[] = [
  { id: 1, userid: 2, amount: 5000, duration: "12 months", loan_type: "personal", reason: "Home improvement", loan_id: "LN001", status: "approved", funded: 5000, date: "2024-01-10T09:00:00Z" },
  { id: 2, userid: 3, amount: 2000, duration: "6 months", loan_type: "personal", loan_id: "LN002", status: "pending", funded: 0, date: "2024-02-15T11:00:00Z" }
];

export const mockExchanges: MockExchange[] = [
  { id: 1, userid: 2, paid_amount: 1000, paid_currency: "USD", usd_value: 1000, expected_amount: 920, expected_currency: "EUR", status: "approved", funded: 920, date: "2024-01-20T10:00:00Z" },
  { id: 2, userid: 1, paid_amount: 500, paid_currency: "GBP", usd_value: 625, expected_amount: 625, expected_currency: "USD", status: "pending", funded: 0, date: "2024-02-25T14:00:00Z" }
];

export const mockTransfers: MockTransfer[] = [
  {
    id: 1,
    tx_ref: "64da01a26b2e4dGZBHZIPNuzfVDM",
    amount: 10000,
    currency: "USD",
    tx_date: "2023-08-14T10:27:46Z",
    tx_region: "international",
    bank_account: "1234567890",
    bank_holder: "Boss Man"
  }
];

export const mockTransferMeta: MockTransferMeta[] = [
  { id: 1, tx_ref: "64da01a26b2e4dGZBHZIPNuzfVDM", account_number: "1043345995", tx_type: "debit", amount: 11000 },
  { id: 2, tx_ref: "64da01a26b2e4dGZBHZIPNuzfVDM", account_number: "1234567890", tx_type: "credit", amount: 10000 }
];

export const mockDeposits: MockDeposit[] = [
  { id: 1, tx_ref: "DEP001", userid: 2, usd_amount: 1000, network: "BTC", rate: 1, detail: "{}", status: "approved", paid: 1000 },
  { id: 2, tx_ref: "DEP002", userid: 2, usd_amount: 500, network: "bank", rate: 1, detail: "{}", status: "pending", paid: 0 },
  { id: 3, tx_ref: "DEP003", userid: 3, usd_amount: 200, network: "BTC", rate: 1, detail: "{}", status: "declined", paid: 0 }
];

export const mockPaymentMethods: MockPaymentMethod[] = [
  {
    id: 1,
    medium: "crypto",
    network: "BTC",
    name: "Bitcoin",
    detail: '{"bitcoin_wallet":"bc1q8r2n40q3h57vl7hfl50exqaa6gnjgf9g428pgg"}'
  },
  {
    id: 2,
    medium: "bank" as const,
    network: undefined,
    name: "Bank Transfer",
    detail: "{}"
  }
];

export const mockCards: MockCard[] = [
  { id: 1, userid: 2, card_type: "debit", vendor: "Visa", cvv: "***", card_number: "**** **** **** 4242", expiry: "12/26", status: "active" },
  { id: 2, userid: 1, card_type: "credit", vendor: "Mastercard", cvv: "***", card_number: "**** **** **** 5555", expiry: "06/27", status: "pending" }
];

export const mockCountries = [
  { iso_2: "AF", name: "Afghanistan" },
  { iso_2: "US", name: "United States" },
  { iso_2: "GB", name: "United Kingdom" },
  { iso_2: "NG", name: "Nigeria" },
  { iso_2: "GH", name: "Ghana" },
  { iso_2: "ZA", name: "South Africa" },
  { iso_2: "CA", name: "Canada" },
  { iso_2: "IN", name: "India" },
  { iso_2: "KE", name: "Kenya" },
];

export const mockGenders = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "others", label: "Others" },
];

export const mockReligions = [
  { value: "", label: "— Please select one —" },
  { value: "islam", label: "Islam" },
  { value: "christianity", label: "Christianity" },
  { value: "others", label: "Others" },
];

export const mockBankAccounts = [
  { value: "savings account", label: "Savings account" },
  { value: "current account", label: "Current account" },
  { value: "fixed account", label: "Fixed account" },
  { value: "non resident account", label: "Non resident account" },
];

export const mockRelationships = [
  { value: "", label: "— Choose One —" },
  { value: "mother", label: "Mother" },
  { value: "father", label: "Father" },
  { value: "spouse", label: "Spouse" },
  { value: "brother", label: "Brother" },
  { value: "sister", label: "Sister" },
  { value: "friend", label: "Friend" },
  { value: "son", label: "Son" },
  { value: "daughter", label: "Daughter" },
];

export const mockCurrencies = [
  { code: "USD", name: "US Dollar", symbol: "$", rate: 1 },
  { code: "GBP", name: "Pound Sterling", symbol: "£", rate: 0.8 },
  { code: "EUR", name: "Euro", symbol: "€", rate: 0.92 },
];

// Helpers for API routes
export function getMockUser(id: number): MockUser | undefined {
  return mockUsers.find((u) => u.id === id);
}

export function getMockUserByUsercode(usercode: string): MockUser | undefined {
  return mockUsers.find((u) => u.usercode === usercode);
}

export function getMockUserProfile(userid: number): MockUserProfile | undefined {
  return mockUserProfiles.find((p) => p.userid === userid);
}

export function getBeneficiariesForUser(userid: number): MockBeneficiary[] {
  return mockBeneficiaries.filter((b) => b.userid === userid);
}

export function addMockTransfer(
  senderId: number,
  senderAccount: string,
  recipientAccount: string,
  amount: number,
  currency: string,
  txRegion: string
): string {
  const txRef = `TNX${Date.now().toString(16).toUpperCase()}`;
  transferIdCounter++;
  transferMetaIdCounter += 2;

  mockTransfers.push({
    id: transferIdCounter,
    tx_ref: txRef,
    amount,
    currency,
    tx_date: new Date().toISOString(),
    tx_region: txRegion,
    bank_account: recipientAccount
  });

  mockTransferMeta.push(
    { id: transferMetaIdCounter - 1, tx_ref: txRef, account_number: senderAccount, tx_type: "debit", amount },
    { id: transferMetaIdCounter, tx_ref: txRef, account_number: recipientAccount, tx_type: "credit", amount }
  );

  const user = getMockUser(senderId);
  if (user) {
    user.balance -= amount;
  }

  return txRef;
}

export function addMockDeposit(
  userId: number,
  usdAmount: number,
  method: MockPaymentMethod,
  rate: number
): string {
  const txRef = `TNX${Date.now().toString(16).toUpperCase()}`;
  depositIdCounter++;

  mockDeposits.push({
    id: depositIdCounter,
    tx_ref: txRef,
    userid: userId,
    usd_amount: usdAmount,
    network: method.network ?? undefined,
    rate,
    detail: JSON.stringify({ ...JSON.parse(method.detail || "{}"), medium: method.medium }),
    status: "pending",
    paid: 0
  });

  return txRef;
}

export function addMockCard(userId: number, cardType: string, vendor: string, cvv: string, cardNumber: string, expiry: string): MockCard {
  cardIdCounter++;
  const card: MockCard = {
    id: cardIdCounter,
    userid: userId,
    card_type: cardType,
    vendor,
    cvv,
    card_number: cardNumber,
    expiry,
    status: "pending"
  };
  mockCards.push(card);
  return card;
}

export function hasAdminAccess(user: MockUser): boolean {
  return !!(user.roles && (user.roles.includes("super-admin") || user.roles.includes("administrator")));
}

export function addMockLoan(userId: number, amount: number, duration: string, loanType: string, reason?: string): MockLoan {
  loanIdCounter++;
  const loan: MockLoan = {
    id: loanIdCounter,
    userid: userId,
    amount,
    duration,
    loan_type: loanType,
    reason,
    loan_id: Math.random().toString(36).slice(2, 8),
    status: "pending",
    funded: 0,
    date: new Date().toISOString()
  };
  mockLoans.push(loan);
  return loan;
}

export function addMockExchange(
  userId: number,
  paidAmount: number,
  paidCurrency: string,
  expectedAmount: number,
  expectedCurrency: string
): MockExchange {
  exchangeIdCounter++;
  const ex: MockExchange = {
    id: exchangeIdCounter,
    userid: userId,
    paid_amount: paidAmount,
    paid_currency: paidCurrency,
    usd_value: paidAmount,
    expected_amount: expectedAmount,
    expected_currency: expectedCurrency,
    status: "pending",
    funded: 0,
    date: new Date().toISOString()
  };
  mockExchanges.push(ex);
  return ex;
}

export function getTransfersForAccount(accountNumber: string): Array<{ tx_ref: string; principal: number; tx_type: string; tx_date: string; currency: string }> {
  const metas = mockTransferMeta.filter((m) => m.account_number === accountNumber);
  return metas.map((m) => {
    const t = mockTransfers.find((t) => t.tx_ref === m.tx_ref);
    return {
      tx_ref: m.tx_ref,
      principal: m.amount,
      tx_type: m.tx_type,
      tx_date: t?.tx_date || "",
      currency: t?.currency || "USD"
    };
  }).sort((a, b) => new Date(b.tx_date).getTime() - new Date(a.tx_date).getTime());
}

// User credentials metadata (admin edit)
export interface MockUserCredentialMeta {
  userid: number;
  accountType: string;
  transferCodeOtp: boolean;
  emailOtp: boolean;
  kycDocument?: string | null;
  pin?: string;
}

const mockUserCredentialMeta: Record<number, MockUserCredentialMeta> = {
  1: { userid: 1, accountType: "savings account", transferCodeOtp: false, emailOtp: false, kycDocument: null, pin: "" },
  2: { userid: 2, accountType: "savings account", transferCodeOtp: false, emailOtp: false, kycDocument: null, pin: "" },
  3: { userid: 3, accountType: "savings account", transferCodeOtp: false, emailOtp: false, kycDocument: null, pin: "" },
};

export function getMockUserCredentialMeta(userid: number): MockUserCredentialMeta | undefined {
  return mockUserCredentialMeta[userid];
}

export function updateMockUserCredential(userid: number, updates: Partial<MockUserCredentialMeta & { firstname?: string; lastname?: string; bankNumber?: string; canTransfer?: boolean; verified?: boolean; transferCodeOtp?: boolean; emailOtp?: boolean }>) {
  const user = getMockUser(userid);
  const meta = mockUserCredentialMeta[userid];
  if (user) {
    if (updates.firstname !== undefined) user.firstname = updates.firstname;
    if (updates.lastname !== undefined) user.lastname = updates.lastname;
    if (updates.bankNumber !== undefined) user.bankNumber = updates.bankNumber;
    if (updates.canTransfer !== undefined) user.canTransfer = updates.canTransfer;
    if (updates.verified !== undefined) user.verified = updates.verified;
  }
  if (meta) {
    if (updates.transferCodeOtp !== undefined) meta.transferCodeOtp = updates.transferCodeOtp;
    if (updates.emailOtp !== undefined) meta.emailOtp = updates.emailOtp;
  }
}

// Per-user, per-currency balances (mock)
const mockUserBalances: Record<number, Record<string, number>> = {};

function getOrInitBalances(userid: number): Record<string, number> {
  const user = getMockUser(userid);
  if (!user) return {};
  if (!mockUserBalances[userid]) {
    mockUserBalances[userid] = { [user.currency]: user.balance };
  }
  return mockUserBalances[userid];
}

export function getMockUserBalanceByCurrency(userid: number, currencyCode: string): number {
  const balances = getOrInitBalances(userid);
  return balances[currencyCode] ?? 0;
}

export function updateMockUserBalance(userid: number, amount: number, currency: string, txType: "debit" | "credit") {
  const user = getMockUser(userid);
  if (!user) return false;
  const balances = getOrInitBalances(userid);
  const current = balances[currency] ?? 0;
  balances[currency] = txType === "credit" ? current + amount : current - amount;
  if (user.currency === currency) user.balance = balances[currency];
  return true;
}
