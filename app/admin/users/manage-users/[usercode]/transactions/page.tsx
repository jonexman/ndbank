"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader, Card, DataTable } from "@/components/ui";

interface TxRow {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  tx_ref: string | null;
  recipient_account: string | null;
  created_at: string;
}

interface PendingRow {
  tx_ref: string;
  otp_code: string;
  recipient_account: string;
  amount: number;
  currency: string;
  tx_region: string;
  expires_at: string;
}

const PAGE_SIZE = 15;

export default function ClientTransactionsPage() {
  const params = useParams();
  const usercode = params.usercode as string;
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ user?: { usercode: string; full_name: string }; transactions: TxRow[]; pending: PendingRow[]; hasMore?: boolean } | null>(null);

  useEffect(() => {
    setData(null);
    setPage(1);
  }, [usercode]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/users/${usercode}/transactions?limit=${PAGE_SIZE}&page=${page}`).then((r) => r.json()),
      fetch(`/api/admin/users/${usercode}/accounts`).then((r) => r.json()),
    ])
      .then(([txRes, accRes]) => {
        if (txRes.error) {
          setData(null);
          return;
        }
        setData({
          user: accRes.user ? { usercode: accRes.user.usercode, full_name: accRes.user.full_name } : undefined,
          transactions: txRes.transactions ?? [],
          pending: txRes.pending ?? [],
          hasMore: txRes.hasMore ?? false,
        });
      })
      .catch(() => setData(null));
  }, [usercode, page]);

  if (!data) {
    return (
      <div>
        <PageHeader title="Transactions" backHref="/admin/users" subtitle="Loading or user not found." />
      </div>
    );
  }

  const { transactions, pending } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Client transactions"
          backHref="/admin/users"
          subtitle={data.user ? `${data.user.usercode} — ${data.user.full_name}` : usercode}
        />
        <div className="flex gap-2">
          <Link
            href={`/admin/users/manage-users/${usercode}/credentials`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Credentials
          </Link>
          <Link
            href={`/admin/users/manage-users/${usercode}/accounts`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Accounts
          </Link>
        </div>
      </div>

      {/* Pending transactions */}
      {pending.length > 0 && (
        <Card className="overflow-hidden border-amber-200 bg-amber-50/50">
          <h3 className="px-6 py-4 text-base font-semibold text-navy border-b border-slate-200">
            Pending transactions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-6 py-3 text-left font-semibold text-navy">Ref</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">Recipient</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">OTP</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">Expires</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <tr key={p.tx_ref} className="border-b border-slate-100">
                    <td className="px-6 py-3 font-mono text-xs">{p.tx_ref}</td>
                    <td className="px-6 py-3 font-mono">{p.recipient_account}</td>
                    <td className="px-6 py-3">{p.amount} {p.currency}</td>
                    <td className="px-6 py-3 font-mono font-semibold text-primary">{p.otp_code}</td>
                    <td className="px-6 py-3 text-slate-600">{new Date(p.expires_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50">
            <Link href="/admin/finance/pending-transfers" className="text-sm font-medium text-primary hover:underline">
              View all pending transfers →
            </Link>
          </div>
        </Card>
      )}

      {/* Transaction history */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-navy">Transaction history</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 px-2">Page {page}</span>
            <button
              type="button"
              disabled={!data.hasMore}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
        <DataTable
          columns={[
            { key: "created_at", header: "Date", render: (t) => new Date(t.created_at).toLocaleString() },
            { key: "type", header: "Type", render: (t) => <span className="capitalize">{t.type}</span> },
            {
              key: "amount",
              header: "Amount",
              render: (t) => (
                <span className={t.type === "debit" ? "text-red-600" : "text-emerald-600"}>
                  {t.type === "debit" ? "−" : "+"}{t.amount} {t.currency}
                </span>
              ),
            },
            { key: "status", header: "Status", render: (t) => <span className="capitalize">{t.status}</span> },
            { key: "tx_ref", header: "Ref", render: (t) => t.tx_ref ? <span className="font-mono text-xs">{t.tx_ref}</span> : "—" },
            {
              key: "detail",
              header: "Detail",
              render: (t) => t.recipient_account || t.description || "—",
            },
          ]}
          data={transactions}
          keyExtractor={(t) => t.id}
          emptyMessage="No transactions yet."
        />
      </Card>
    </div>
  );
}
