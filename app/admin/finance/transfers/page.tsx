"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader, DataTable, TableSkeleton } from "@/components/ui";

interface Transfer {
  id: number;
  tx_ref: string;
  amount: number;
  currency: string;
  tx_type: string;
  status?: string;
  tx_date: string;
  tx_region: string;
  bank_account: string;
  usercode?: string;
  bank_holder?: string;
}

const PAGE_SIZE = 25;

function formatAmount(amount: number, currency: string) {
  return `${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`;
}

export default function AdminTransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[] | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "debit" | "credit" | "transfer">("all");
  const [filterRegion, setFilterRegion] = useState<"all" | "local" | "international">("all");
  const [page, setPage] = useState(1);

  const loadTransfers = () => {
    setTransfers(null);
    fetch("/api/admin/transfers")
      .then((r) => r.json())
      .then((d) => setTransfers(d.transfers ?? []))
      .catch(() => setTransfers([]));
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  const filteredTransfers = useMemo(() => {
    if (!transfers) return [];
    const q = search.trim().toLowerCase();
    return transfers.filter((t) => {
      const matchSearch = !q || 
        (t.tx_ref ?? "").toLowerCase().includes(q) ||
        (t.bank_account ?? "").toLowerCase().includes(q) ||
        (t.usercode ?? "").toLowerCase().includes(q) ||
        (t.bank_holder ?? "").toLowerCase().includes(q);
      const matchType = filterType === "all" || t.tx_type === filterType;
      const matchRegion = filterRegion === "all" || (t.tx_region ?? "local").toLowerCase() === filterRegion;
      return matchSearch && matchType && matchRegion;
    });
  }, [transfers, search, filterType, filterRegion]);

  const paginatedTransfers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTransfers.slice(start, start + PAGE_SIZE);
  }, [filteredTransfers, page]);

  const totalPages = Math.ceil(filteredTransfers.length / PAGE_SIZE);

  const totals = useMemo(() => {
    if (!transfers) return null;
    const debits = transfers.filter((t) => t.tx_type === "debit").reduce((s, t) => s + Number(t.amount), 0);
    const credits = transfers.filter((t) => t.tx_type === "credit").reduce((s, t) => s + Number(t.amount), 0);
    return { debits, credits, count: transfers.length };
  }, [transfers]);

  if (transfers === null) {
    return (
      <div>
        <PageHeader title="Transfers" subtitle="View transfer history" />
        <TableSkeleton rows={10} cols={7} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <PageHeader title="Transfers" subtitle="View transfer history" />
        <button
          type="button"
          onClick={loadTransfers}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {totals && (
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Total Debits</p>
            <p className="text-xl font-semibold text-red-600">{formatAmount(totals.debits, "USD")}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Total Credits</p>
            <p className="text-xl font-semibold text-emerald-600">{formatAmount(totals.credits, "USD")}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Transactions</p>
            <p className="text-xl font-semibold text-navy">{totals.count}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="search"
          placeholder="Search by ref, recipient, usercode..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          aria-label="Search transfers"
        />
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value as typeof filterType); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="all">All types</option>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
          <option value="transfer">Transfer</option>
        </select>
        <select
          value={filterRegion}
          onChange={(e) => { setFilterRegion(e.target.value as typeof filterRegion); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="all">All regions</option>
          <option value="local">Local</option>
          <option value="international">International</option>
        </select>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          Showing {filteredTransfers.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, filteredTransfers.length)} of {filteredTransfers.length}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 px-2">Page {page} of {totalPages}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {filteredTransfers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-card">
          <p className="text-slate-600 font-medium">
            {transfers.length === 0 ? "No transfers yet." : "No transfers match your search or filters."}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {transfers.length === 0 ? "" : "Try adjusting your search or filter."}
          </p>
        </div>
      ) : (
        <DataTable
          striped
          columns={[
            {
              key: "tx_ref",
              header: "Ref",
              render: (t) => (
                <Link href={`/admin/finance/receipt/${t.tx_ref}`} className="font-mono text-sm text-primary hover:underline">
                  {String(t.tx_ref ?? "").slice(0, 14)}…
                </Link>
              ),
            },
            {
              key: "tx_type",
              header: "Type",
              render: (t) => (
                <span className={`capitalize font-medium ${
                  t.tx_type === "debit" ? "text-red-600" : t.tx_type === "credit" ? "text-emerald-600" : "text-slate-600"
                }`}>
                  {t.tx_type}
                </span>
              ),
            },
            {
              key: "amount",
              header: "Amount",
              render: (t) => (
                <span className={t.tx_type === "debit" ? "text-red-600 font-medium" : "text-emerald-600 font-medium"}>
                  {t.tx_type === "debit" ? "−" : "+"}{formatAmount(t.amount, t.currency)}
                </span>
              ),
            },
            { key: "bank_account", header: "Recipient", render: (t) => t.bank_account ?? "—" },
            {
              key: "holder",
              header: "Holder",
              render: (t) => (
                t.usercode ? (
                  <Link href={`/admin/users/manage-users/${t.usercode}/transactions`} className="text-primary hover:underline">
                    {t.bank_holder ?? t.usercode}
                  </Link>
                ) : (t.bank_holder ?? "—")
              ),
            },
            {
              key: "tx_region",
              header: "Region",
              render: (t) => <span className="capitalize">{t.tx_region ?? "local"}</span>,
            },
            {
              key: "status",
              header: "Status",
              render: (t) => (
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                  (t.status ?? "completed") === "processing" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {(t.status ?? "completed") === "processing" ? "Processing" : "Completed"}
                </span>
              ),
            },
            {
              key: "tx_date",
              header: "Date",
              render: (t) => new Date(t.tx_date).toLocaleString(),
            },
          ]}
          data={paginatedTransfers}
          keyExtractor={(t) => String(t.id)}
          emptyMessage="No transfers."
        />
      )}
    </div>
  );
}
