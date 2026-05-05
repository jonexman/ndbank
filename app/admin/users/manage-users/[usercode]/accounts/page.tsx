"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, PageHeader, Button, Input, Select, DataTable, Spinner, CardSkeleton } from "@/components/ui";

interface AccountRow {
  id: string;
  currency: string;
  account_number: string | null;
  balance: number;
  created_at: string;
}

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

const navLinkBase = "inline-flex px-4 py-2 text-sm font-medium rounded-xl border transition-colors";
const navLink = `${navLinkBase} text-slate-700 bg-white border-slate-200 hover:bg-slate-50`;
const navLinkActive = `${navLinkBase} text-primary border-primary bg-primary/5`;

export default function ManageAccountsPage() {
  const params = useParams();
  const usercode = params.usercode as string;
  const [dataLoading, setDataLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [data, setData] = useState<{
    user: { id: string; usercode: string; full_name: string; bank_number: string | null };
    accounts: AccountRow[];
    currencies: CurrencyOption[];
  } | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [txType, setTxType] = useState<"debit" | "credit">("credit");
  const [description, setDescription] = useState("");
  const [addingCurrency, setAddingCurrency] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyAccountId, setHistoryAccountId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Array<{
    id: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    description: string | null;
    tx_ref: string | null;
    recipient_account: string | null;
    created_at: string;
  }>>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAdjust, setPendingAdjust] = useState<{ accountId: string; acc: AccountRow; symbol: string } | null>(null);

  useEffect(() => {
    setDataLoading(true);
    setForbidden(false);
    fetch(`/api/admin/users/${usercode}/accounts`)
      .then(async (r) => {
        const d = await r.json();
        return { ...d, _status: r.status };
      })
      .then((d) => {
        if (d.error) {
          setData(null);
          setForbidden(d._status === 403);
        } else setData(d);
      })
      .catch(() => setData(null))
      .finally(() => setDataLoading(false));
  }, [usercode]);

  const loadHistory = (accountId: string) => {
    if (historyAccountId === accountId) {
      setHistoryAccountId(null);
      return;
    }
    setHistoryAccountId(accountId);
    setHistoryLoading(true);
    fetch(`/api/admin/users/${usercode}/transactions?account_id=${accountId}&limit=100`)
      .then((r) => r.json())
      .then((d) => {
        setTransactions(d.transactions ?? []);
      })
      .catch(() => setTransactions([]))
      .finally(() => setHistoryLoading(false));
  };

  const refresh = () => {
    fetch(`/api/admin/users/${usercode}/accounts`)
      .then((r) => r.json())
      .then((d) => !d.error && setData(d));
  };

  const copyAccountNumber = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    setStatus({ type: "success", msg: "Account number copied" });
    setTimeout(() => setStatus(null), 2000);
  };

  const openConfirmModal = (accountId: string, acc: AccountRow, symbol: string) => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setStatus({ type: "error", msg: "Enter a valid amount" });
      return;
    }
    if (!description.trim()) {
      setStatus({ type: "error", msg: "Description is required for audit purposes" });
      return;
    }
    setStatus(null);
    setPendingAdjust({ accountId, acc, symbol });
    setShowConfirmModal(true);
  };

  const handleBalanceUpdate = () => {
    if (!pendingAdjust) return;
    setLoading(true);
    const amt = parseFloat(amount);
    fetch(`/api/admin/users/${usercode}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "balance",
        account_id: pendingAdjust.accountId,
        amount: amt,
        tx_type: txType,
        description: description.trim(),
      }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setStatus({ type: "success", msg: json.message });
          setShowConfirmModal(false);
          setPendingAdjust(null);
          setAdjustingId(null);
          setAmount("");
          setDescription("");
          refresh();
        } else {
          setStatus({ type: "error", msg: json.error ?? "Update failed" });
        }
      })
      .catch(() => setStatus({ type: "error", msg: "Request failed" }))
      .finally(() => {
        setLoading(false);
      });
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingCurrency) {
      setStatus({ type: "error", msg: "Select a currency" });
      return;
    }
    setStatus(null);
    setLoading(true);
    fetch(`/api/admin/users/${usercode}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add_account", currency: addingCurrency }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setStatus({ type: "success", msg: json.message });
          setAddingCurrency("");
          refresh();
        } else {
          setStatus({ type: "error", msg: json.error ?? "Failed to add account" });
        }
      })
      .catch(() => setStatus({ type: "error", msg: "Request failed" }))
      .finally(() => setLoading(false));
  };

  if (dataLoading) {
    return (
      <div>
        <PageHeader title="Manage Accounts" backHref="/admin/users" subtitle="Loading accounts…" />
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
        <div className="space-y-6 mt-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <PageHeader
          title="Manage Accounts"
          backHref="/admin/users"
          subtitle={
            forbidden
              ? "You don't have permission to view this user."
              : "User not found."
          }
        />
      </div>
    );
  }

  const existingCurrencies = new Set(data.accounts.map((a) => a.currency));
  const availableCurrencies = data.currencies.filter((c) => !existingCurrencies.has(c.code));

  const balanceByCurrency = data.accounts.reduce<Record<string, number>>((acc, a) => {
    acc[a.currency] = (acc[a.currency] ?? 0) + a.balance;
    return acc;
  }, {});

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4" aria-label="Breadcrumb">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link href="/admin" className="hover:text-primary">
              Admin
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/admin/users" className="hover:text-primary">
              Users
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/admin/users/manage-users/${usercode}/accounts`} className="hover:text-primary font-medium text-slate-700">
              {data.user.usercode}
            </Link>
          </li>
          <li>/</li>
          <li className="font-medium text-navy">Accounts</li>
        </ol>
      </nav>

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <PageHeader
          title="Manage Accounts"
          backHref="/admin/users"
          subtitle={`${data.user.usercode} — ${data.user.full_name}. View and adjust balances, add accounts.`}
        />
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/users/manage-users/${usercode}/activity`} className={navLink}>
            Activity
          </Link>
          <Link href={`/admin/users/manage-users/${usercode}/transactions`} className={navLink}>
            Transactions
          </Link>
          <Link href={`/admin/users/${usercode}/edit`} className={navLink}>
            Edit profile
          </Link>
          <Link href={`/admin/users/manage-users/${usercode}/credentials`} className={navLink}>
            Banking credentials
          </Link>
          <span className={navLinkActive}>Accounts</span>
        </div>
      </div>

      {status && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm ${
            status.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {status.msg}
        </div>
      )}

      {data.accounts.length > 0 && (
        <Card className="mb-6">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">Summary</h3>
          <div className="flex flex-wrap gap-6">
            <div>
              <span className="text-slate-500 text-sm">Total accounts</span>
              <p className="text-xl font-semibold text-navy">{data.accounts.length}</p>
            </div>
            {Object.entries(balanceByCurrency).map(([currency, balance]) => {
              const curInfo = data.currencies.find((c) => c.code === currency);
              const symbol = curInfo?.symbol ?? currency;
              return (
                <div key={currency}>
                  <span className="text-slate-500 text-sm">{currency} balance</span>
                  <p className="text-xl font-semibold text-navy">
                    {symbol}
                    {balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="space-y-6">
        {data.accounts.length === 0 ? (
          <Card>
            <div className="py-8 text-center">
              <p className="text-gray-500 mb-6">No accounts yet. Add one to get started.</p>
              {availableCurrencies.length > 0 ? (
                <form onSubmit={handleAddAccount} className="inline-flex flex-wrap items-end justify-center gap-3">
                  <Select
                    label="Currency"
                    value={addingCurrency}
                    onChange={(e) => setAddingCurrency(e.target.value)}
                    options={[
                      { value: "", label: "— Select currency —" },
                      ...availableCurrencies.map((c) => ({ value: c.code, label: `${c.code} (${c.name})` })),
                    ]}
                  />
                  <Button type="submit" disabled={loading || !addingCurrency}>
                    Add first account
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-slate-500">All supported currencies already have accounts.</p>
              )}
            </div>
          </Card>
        ) : (
          data.accounts.map((acc) => {
            const currencyInfo = data.currencies.find((c) => c.code === acc.currency);
            const symbol = currencyInfo?.symbol ?? acc.currency;
            return (
              <Card key={acc.id}>
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-navy">
                        {acc.currency} Account
                        {acc.account_number && (
                          <>
                            <span className="ml-2 font-mono text-sm font-normal text-gray-600">{acc.account_number}</span>
                            <button
                              type="button"
                              onClick={() => copyAccountNumber(acc.account_number!)}
                              className="inline-flex p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                              title="Copy account number"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </>
                        )}
                      </h3>
                    </div>
                    <p className="mt-1 text-2xl font-semibold text-navy">
                      {symbol}
                      {acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Created {new Date(acc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {adjustingId === acc.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          openConfirmModal(acc.id, acc, symbol);
                        }}
                        className="flex flex-wrap items-end gap-3"
                      >
                        <Input
                          label="Amount"
                          type="number"
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          required
                        />
                        <Input
                          label="Description (required)"
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="e.g. Initial deposit, correction"
                          required
                        />
                        <div className="flex gap-3 items-center">
                          <div className="flex gap-2">
                            <label className="flex items-center gap-1">
                              <input
                                type="radio"
                                name={`tx-${acc.id}`}
                                checked={txType === "credit"}
                                onChange={() => setTxType("credit")}
                                className="text-primary"
                              />
                              <span className="text-sm">Credit</span>
                            </label>
                            <label className="flex items-center gap-1">
                              <input
                                type="radio"
                                name={`tx-${acc.id}`}
                                checked={txType === "debit"}
                                onChange={() => setTxType("debit")}
                                className="text-primary"
                              />
                              <span className="text-sm">Debit</span>
                            </label>
                          </div>
                          <Button type="submit" disabled={loading}>
                            Continue
                          </Button>
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustingId(null);
                              setAmount("");
                              setDescription("");
                            }}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setAdjustingId(acc.id);
                            setAmount("");
                            setTxType("credit");
                            setDescription("");
                          }}
                        >
                          Adjust balance
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => loadHistory(acc.id)}
                          disabled={historyLoading}
                        >
                          {historyAccountId === acc.id
                            ? `Hide history${transactions.length ? ` (${transactions.length})` : ""}`
                            : "View history"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                {historyAccountId === acc.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-navy mb-4">
                      Transaction history {transactions.length ? `(${transactions.length})` : ""}
                    </h4>
                    {historyLoading ? (
                      <p className="text-sm text-gray-500">Loading…</p>
                    ) : (
                      <DataTable
                        columns={[
                          { key: "created_at", header: "Date", render: (t) => new Date(t.created_at).toLocaleString() },
                          { key: "type", header: "Type", render: (t) => <span className="capitalize">{t.type}</span> },
                          {
                            key: "amount",
                            header: "Amount",
                            render: (t) => (
                              <span className={t.type === "credit" ? "text-emerald-600" : "text-red-600"}>
                                {t.type === "credit" ? "+" : "−"}
                                {symbol}
                                {t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </span>
                            ),
                          },
                          { key: "description", header: "Description", render: (t) => t.description ?? "—" },
                          { key: "tx_ref", header: "Ref", render: (t) => t.tx_ref ?? "—" },
                          { key: "status", header: "Status", render: (t) => <span className="capitalize">{t.status}</span> },
                        ]}
                        data={transactions}
                        keyExtractor={(t) => t.id}
                        emptyMessage="No transactions yet."
                      />
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}

        {availableCurrencies.length > 0 && data.accounts.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-navy mb-4">Add account</h3>
            <form onSubmit={handleAddAccount} className="flex flex-wrap items-end gap-3">
              <Select
                label="Currency"
                value={addingCurrency}
                onChange={(e) => setAddingCurrency(e.target.value)}
                options={[
                  { value: "", label: "— Select currency —" },
                  ...availableCurrencies.map((c) => ({ value: c.code, label: `${c.code} (${c.name})` })),
                ]}
              />
              <Button type="submit" disabled={loading || !addingCurrency}>
                Add account
              </Button>
            </form>
          </Card>
        )}
      </div>

      {showConfirmModal && pendingAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowConfirmModal(false); setPendingAdjust(null); }} aria-hidden />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-navy mb-4">Confirm balance adjustment</h3>
            <p className="text-slate-600 mb-2">
              You are about to <span className={txType === "credit" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                {txType === "credit" ? "credit" : "debit"}
              </span>{" "}
              <strong>
                {pendingAdjust.symbol}
                {parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </strong>{" "}
              to the {pendingAdjust.acc.currency} account.
            </p>
            <p className="text-slate-600 mb-2">
              Current balance: {pendingAdjust.symbol}
              {pendingAdjust.acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-slate-600 mb-4">
              New balance:{" "}
              <strong>
                {pendingAdjust.symbol}
                {(
                  pendingAdjust.acc.balance +
                  (txType === "credit" ? parseFloat(amount) : -parseFloat(amount))
                ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </strong>
              {txType === "debit" && pendingAdjust.acc.balance - parseFloat(amount) < 0 && (
                <span className="block text-amber-600 text-sm mt-1">(Debit will be capped; balance cannot go below 0)</span>
              )}
            </p>
            <p className="text-sm text-slate-500 mb-4">Reason: {description}</p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingAdjust(null);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleBalanceUpdate} disabled={loading}>
                {loading ? "Applying…" : "Apply"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
