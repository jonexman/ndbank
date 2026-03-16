"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBadge,
  PageHeader,
  DataTable,
  PageLoader,
  CardSkeleton,
} from "@/components/ui";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";

const MarketIndices = dynamic(
  () =>
    import("@/components/dashboard/MarketIndices").then((m) => ({
      default: m.MarketIndices,
    })),
  { ssr: false, loading: () => <MarketIndicesSkeleton /> },
);

function MarketIndicesSkeleton() {
  const t = useTranslations("clientDashboard");
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-navy font-heading mb-4">
        {t("marketIndices")}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    </section>
  );
}
const ActionIcons = {
  transfer: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  ),
  history: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  deposit: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  ),
  exchange: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  ),
  loan: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  card: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  ),
};

function useQuickActions() {
  const t = useTranslations("clientDashboard");
  return [
    { href: "/dashboard/transfer", label: t("transfer"), desc: t("transferDesc"), icon: "transfer" as const },
    { href: "/dashboard/transfer/history", label: t("history"), desc: t("historyDesc"), icon: "history" as const },
    { href: "/dashboard/deposit", label: t("deposit"), desc: t("depositDesc"), icon: "deposit" as const },
    { href: "/dashboard/monetary/exchange", label: t("exchange"), desc: t("exchangeDesc"), icon: "exchange" as const },
    { href: "/dashboard/loan/apply", label: t("applyForLoan"), desc: t("applyForLoanDesc"), icon: "loan" as const },
    { href: "/dashboard/cards", label: t("applyForCard"), desc: t("applyForCardDesc"), icon: "card" as const },
  ];
}

function useGreeting(firstname: string) {
  const t = useTranslations("clientDashboard");
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t("goodMorning") : hour < 17 ? t("goodAfternoon") : t("goodEvening");
  return `${greeting}, ${firstname}`;
}

function useFormatDate() {
  const t = useTranslations("clientDashboard");
  return (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return t("today");
    if (d.toDateString() === yesterday.toDateString()) return t("yesterday");
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    if (d.getFullYear() !== today.getFullYear()) opts.year = "numeric";
    return d.toLocaleDateString(undefined, opts);
  };
}

function formatCurrency(amount: number, currency: string) {
  const symbols: Record<string, string> = {
    USD: "$",
    GBP: "£",
    EUR: "€",
    XOF: "FCFA ",
  };
  const prefix = symbols[currency] ?? "";
  return `${prefix}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function fetchDashboard() {
  return fetch("/api/dashboard/user")
    .then((r) => r.json().then((d) => ({ status: r.status, data: d })))
    .then(({ status, data: d }) => ({ status, data: d }));
}

export default function DashboardPage() {
  const { userId, isLoading } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("dashboard_balance_visible");
      if (stored !== null) setBalanceVisible(stored === "true");
    } catch {}
  }, []);
  const toggleBalanceVisibility = () => {
    setBalanceVisible((v) => {
      const next = !v;
      try {
        localStorage.setItem("dashboard_balance_visible", String(next));
      } catch {}
      return next;
    });
  };
  const [data, setData] = useState<{
    user?: {
      firstname: string;
      lastname: string;
      bank_number: string;
      account_number?: string;
      account_type?: string;
      balance: number;
      currency: string;
    };
    transactions?: Array<{
      tx_ref: string;
      principal: number;
      tx_type: string;
      tx_date: string;
      currency: string;
      status?: string;
    }>;
    pendingTransfers?: Array<{
      tx_ref: string;
      principal: number;
      tx_type: string;
      tx_date: string;
      currency: string;
      status?: string;
    }>;
    error?: string;
  } | null>(null);

  const [awaitingCodes, setAwaitingCodes] = useState<Array<{
    tx_ref: string;
    amount: number;
    currency: string;
    tx_region: string;
    recipient_account?: string;
    fee_amount?: number;
    code_types: Array<{ type: string; order: number }>;
  }>>([]);

  useEffect(() => {
    if (!userId) {
      if (!isLoading) router.push("/dashboard/signin");
      return;
    }
    setData(null);
    setAwaitingCodes([]);
    Promise.all([
      fetchDashboard(),
      fetch("/api/transfer/awaiting-codes").then((r) => r.json()).catch(() => ({ awaiting: [] })),
    ])
      .then(([{ status, data: d }, ac]) => {
        if (status === 401) {
          router.push("/dashboard/signin");
          return;
        }
        if (status === 404 || d?.error) {
          setData({
            error:
              d?.error ??
              "User profile not found. Try signing out and back in.",
          });
          return;
        }
        setData(d);
        setAwaitingCodes(Array.isArray(ac?.awaiting) ? ac.awaiting : []);
      })
      .catch(() =>
        setData({ error: "Failed to load dashboard. Check your connection." }),
      );
  }, [userId, isLoading, router]);

  useEffect(() => {
    if (!userId) return;
    const onFocus = () => {
      fetchDashboard().then(({ status, data: d }) => {
        if (status === 200 && !d?.error && d?.user) setData(d);
      }).catch(() => {});
      fetch("/api/transfer/awaiting-codes").then((r) => r.json()).then((ac) => {
        setAwaitingCodes(Array.isArray(ac?.awaiting) ? ac.awaiting : []);
      }).catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [userId]);

  const t = useTranslations("clientDashboard");
  const getGreeting = useGreeting(data?.user?.firstname ?? "");
  const formatDate = useFormatDate();
  const actions = useQuickActions();

  if (!userId && !isLoading) {
    return null;
  }

  if (data?.error && !data?.user) {
    return (
      <div>
        <PageHeader title="E-Banking" subtitle="Dashboard" />
        <div className="p-4 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
          <p className="font-medium">{data.error}</p>
          <p className="text-sm mt-2">
            If you just signed up, your profile may still be syncing. Try
            refreshing the page or signing out and back in.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !data?.user) {
    return (
      <div>
        <PageHeader title="E-Banking" subtitle="Loading..." />
        <div className="mb-10">
          <div className="rounded-2xl bg-slate-200 animate-pulse h-40" />
        </div>
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-navy font-heading mb-4">
            <span className="inline-block h-5 w-32 rounded bg-slate-200 animate-pulse" />
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
        <section>
          <h2 className="text-lg font-semibold text-navy font-heading mb-4">
            <span className="inline-block h-5 w-40 rounded bg-slate-200 animate-pulse" />
          </h2>
          <PageLoader
            message="Loading your dashboard"
            subtitle="Fetching transactions..."
          />
        </section>
      </div>
    );
  }

  const { user, transactions = [], pendingTransfers = [] } = data;
  const recentItems = [...transactions, ...pendingTransfers]
    .sort(
      (a, b) => new Date(b.tx_date).getTime() - new Date(a.tx_date).getTime(),
    )
    .slice(0, 3);

  const handleCopyAccount = async () => {
    const acc = user.account_number ?? user.bank_number;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(acc);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // clipboard failed
    }
  };

  return (
    <div>
      <PageHeader
        title={getGreeting}
        subtitle={t("manageAccounts")}
      />

      {awaitingCodes.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-medium">
              {awaitingCodes.length === 1 ? t("completeYourTransfer") : t("completeYourTransfers", { count: awaitingCodes.length })}
            </span>
          </div>
          {awaitingCodes.length === 1 ? (
            <Link
              href={awaitingCodes[0].tx_region === "international"
                ? `/dashboard/transfer/international?tx_ref=${encodeURIComponent(awaitingCodes[0].tx_ref)}`
                : `/dashboard/transfer/local?tx_ref=${encodeURIComponent(awaitingCodes[0].tx_ref)}`}
              className="flex items-center justify-between gap-4 py-2 rounded-lg hover:bg-blue-100/80 transition-colors"
            >
              <span className="text-sm">
                {awaitingCodes[0].amount.toFixed(2)} {awaitingCodes[0].currency}
                {awaitingCodes[0].recipient_account ? ` → ${awaitingCodes[0].recipient_account}` : ""}
              </span>
              <span className="text-sm font-medium">{t("enterCode")} →</span>
            </Link>
          ) : (
            <ul className="space-y-2">
              {awaitingCodes.map((item) => (
                <li key={item.tx_ref}>
                  <Link
                    href={item.tx_region === "international"
                      ? `/dashboard/transfer/international?tx_ref=${encodeURIComponent(item.tx_ref)}`
                      : `/dashboard/transfer/local?tx_ref=${encodeURIComponent(item.tx_ref)}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 px-3 rounded-lg bg-white/60 hover:bg-white border border-blue-100 transition-colors"
                  >
                    <div className="text-sm">
                      <span className="font-medium">{item.amount.toFixed(2)} {item.currency}</span>
                      {item.recipient_account && (
                        <span className="text-blue-700/90"> → {item.recipient_account}</span>
                      )}
                      <span className="ml-2 text-xs text-blue-600/80 capitalize">({item.tx_region})</span>
                    </div>
                    <span className="text-sm font-medium shrink-0">{t("enterCode")} →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {pendingTransfers.length > 0 && (
        <Link
          href="/dashboard/transfer/history"
          className="block mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">
                {pendingTransfers.length} {pendingTransfers.length > 1 ? t("pendingTransfers") : t("pendingTransfer")}
              </span>
            </div>
            <span className="text-sm font-medium">{t("viewAll")} →</span>
          </div>
        </Link>
      )}

      {/* Bank balance card */}
      <div className="mb-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-dark via-primary to-primary-light p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/5" />
          <div className="absolute bottom-0 left-0 w-48 h-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-white/70 text-sm font-medium uppercase tracking-wider">
                  {user.account_type
                    ? String(user.account_type).replace("_", " ")
                    : t("savings")}{" "}
                  {t("account")}
                </p>
                <p className="font-mono text-lg font-semibold mt-1 tracking-wider">
                  {user.account_number ?? user.bank_number}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleBalanceVisibility}
                  title={balanceVisible ? t("hideBalance") : t("showBalance")}
                  className={`p-2 rounded-lg transition-colors ${
                    balanceVisible
                      ? "text-white/60 hover:text-white hover:bg-white/10"
                      : "text-white bg-white/20"
                  }`}
                  aria-label={balanceVisible ? t("hideBalance") : t("showBalance")}
                >
                  {balanceVisible ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  title={copied ? t("copied") : t("copyAccountNumber")}
                  className={`p-2 rounded-lg transition-colors ${
                    copied
                      ? "text-white bg-white/20"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label={copied ? t("copied") : t("copyAccountNumber")}
                >
                {copied ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
                </button>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-1">
              {user.firstname} {user.lastname}
            </p>
            <p className="text-white/60 text-xs mb-6">{t("availableBalance")}</p>
            <p className="text-3xl sm:text-4xl font-bold font-heading tracking-tight">
              {balanceVisible ? (
                <>
                  {formatCurrency(user.balance, user.currency)}
                  <span className="ml-1 text-lg font-normal text-white/80">
                    {user.currency}
                  </span>
                </>
              ) : (
                <span className="tracking-widest">••••••</span>
              )}
            </p>
            <Link
              href="/dashboard/transfer/history"
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              {t("viewTransactionHistory")}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <MarketIndices />

      {/* Quick Actions */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-navy font-heading mb-4">
          {t("quickActions")}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((a) => (
            <Card key={a.href} asLink={a.href} hover>
              <div className="flex items-start gap-4">
                <CardBadge>{ActionIcons[a.icon]}</CardBadge>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-navy font-heading">
                    {a.label}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">{a.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Transactions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-navy font-heading">
            {t("recentTransactions")}
          </h2>
          <Link
            href="/dashboard/transfer/history"
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("viewAll")}
          </Link>
        </div>
        {recentItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-card">
            <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-slate-600 font-medium mb-1">
              {t("noTransactionsYet")}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              {t("startByTransferring")}
            </p>
            <Link
              href="/dashboard/transfer"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              {t("makeTransfer")}
            </Link>
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: "tx_ref",
                header: t("reference"),
                render: (row) => (
                  <Link
                    href={`/dashboard/receipt/${row.tx_ref}`}
                    className="font-medium text-primary hover:underline font-mono text-xs"
                  >
                    {String(row.tx_ref).slice(0, 12)}...
                  </Link>
                ),
              },
              {
                key: "amount",
                header: t("amount"),
                render: (row) => (
                  <span
                    className={
                      row.tx_type === "credit"
                        ? "text-emerald-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {row.tx_type === "credit" ? "+" : "-"}
                    {row.principal.toFixed(2)} {row.currency}
                  </span>
                ),
              },
              {
                key: "tx_type",
                header: t("type"),
                render: (row) => <span className="capitalize">{row.tx_type}</span>,
              },
              {
                key: "status",
                header: t("status"),
                render: (row) => (
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      (row as { status?: string }).status === "processing"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {(row as { status?: string }).status === "processing"
                      ? t("processing")
                      : t("completed")}
                  </span>
                ),
              },
              {
                key: "tx_date",
                header: t("date"),
                render: (row) => formatDate(row.tx_date),
              },
              {
                key: "slip",
                header: "",
                render: (row) => (
                  <Link
                    href={`/dashboard/receipt/${row.tx_ref}`}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    {t("viewSlip")}
                  </Link>
                ),
              },
            ]}
            data={recentItems}
            keyExtractor={(t) => t.tx_ref}
            emptyMessage={t("noTransactionsYet")}
            striped
          />
        )}
      </section>
    </div>
  );
}
