"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, PageHeader, Button, Input, Select, DataTable } from "@/components/ui";

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

export default function ManageAccountsPage() {
  const params = useParams();
  const usercode = params.usercode as string;
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

  useEffect(() => {
    fetch(`/api/admin/users/${usercode}/accounts`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setData(null);
        else setData(d);
      })
      .catch(() => setData(null));
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

  const handleBalanceUpdate = (e: React.FormEvent, accountId: string) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setStatus({ type: "error", msg: "Enter a valid amount" });
      return;
    }
    setStatus(null);
    setLoading(true);
    fetch(`/api/admin/users/${usercode}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "balance",
        account_id: accountId,
        amount: amt,
        tx_type: txType,
        description: description || undefined,
      }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setStatus({ type: "success", msg: json.message });
          setAdjustingId(null);
          setAmount("");
          setDescription("");
          refresh();
        } else {
          setStatus({ type: "error", msg: json.error ?? "Update failed" });
        }
      })
      .catch(() => setStatus({ type: "error", msg: "Request failed" }))
      .finally(() => setLoading(false));
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

  if (!data) {
    return (
      <div>
        <PageHeader title="Manage Accounts" backHref="/admin/users" subtitle="Loading or user not found." />
      </div>
    );
  }

  const existingCurrencies = new Set(data.accounts.map((a) => a.currency));
  const availableCurrencies = data.currencies.filter((c) => !existingCurrencies.has(c.code));

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <PageHeader
          title="Manage Accounts"
          backHref="/admin/users"
          subtitle={`${data.user.usercode} — ${data.user.full_name}. View and adjust balances, add accounts.`}
        />
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/users/manage-users/${usercode}/transactions`}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Transactions
          </Link>
          <Link
            href={`/admin/users/${usercode}/edit`}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Edit profile
          </Link>
          <Link
            href={`/admin/users/manage-users/${usercode}/credentials`}
            className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5"
          >
            Banking credentials
          </Link>
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

      <div className="space-y-6">
        {data.accounts.length === 0 ? (
          <Card>
            <p className="text-gray-500 py-4">No accounts yet. Add one below.</p>
          </Card>
        ) : (
          data.accounts.map((acc) => {
            const currencyInfo = data.currencies.find((c) => c.code === acc.currency);
            const symbol = currencyInfo?.symbol ?? acc.currency;
            return (
              <Card key={acc.id}>
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-navy">
                      {acc.currency} Account
                      {acc.account_number && (
                        <span className="ml-2 font-mono text-sm font-normal text-gray-600">
                          {acc.account_number}
                        </span>
                      )}
                    </h3>
                    <p className="mt-1 text-2xl font-semibold text-navy">
                      {symbol}
                      {acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {adjustingId === acc.id ? (
                      <form
                        onSubmit={(e) => handleBalanceUpdate(e, acc.id)}
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
                        <input
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Description"
                          className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                        />
                        <Button type="submit" disabled={loading}>
                          Apply
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
                          {historyAccountId === acc.id ? "Hide history" : "View history"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                {historyAccountId === acc.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-navy mb-4">Transaction history</h4>
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

        {availableCurrencies.length > 0 && (
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
    </div>
  );
}
