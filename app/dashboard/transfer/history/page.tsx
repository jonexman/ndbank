"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader, DataTable, PageLoader, TableSkeleton } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";

const PAGE_SIZE = 15;

export default function TransferHistoryPage() {
  const { userId, isLoading } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{
    transactions?: Array<{ tx_ref: string; principal: number; tx_type: string; tx_date: string; currency: string; status?: string }>;
    pendingTransfers?: Array<{ tx_ref: string; principal: number; tx_type: string; tx_date: string; currency: string; status?: string; recipient_account?: string }>;
    hasMore?: boolean;
  } | null>(null);

  useEffect(() => {
    if (!userId) {
      if (!isLoading) router.push("/dashboard/signin");
      return;
    }
    fetch(`/api/dashboard/transactions?limit=${PAGE_SIZE}&page=${page}`)
      .then((r) => {
        if (r.status === 401) {
          router.push("/dashboard/signin");
          return null;
        }
        return r.json();
      })
      .then((d) => d != null && !d.error && setData(d))
      .catch(() => setData(null));
  }, [userId, isLoading, router, page]);

  const transactions = data?.transactions ?? [];
  const pendingTransfers = data?.pendingTransfers ?? [];
  const allItems = [...pendingTransfers, ...transactions].sort(
    (a, b) => new Date(b.tx_date).getTime() - new Date(a.tx_date).getTime()
  );

  if (!data) {
    return (
      <div>
        <PageHeader title="Transfer History" backHref="/dashboard" subtitle="Loading..." />
        <TableSkeleton rows={8} cols={6} />
        <div className="mt-4 flex justify-center">
          <PageLoader message="Loading transactions" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <PageHeader title="Transfer History" backHref="/dashboard" subtitle="View your transaction and processing transfers" />
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
        striped
        columns={[
          {
            key: "tx_ref",
            header: "Reference",
            render: (t) => (
              <Link href={`/dashboard/receipt/${t.tx_ref}`} className="font-medium text-primary hover:underline">
                {String(t.tx_ref).slice(0, 12)}...
              </Link>
            ),
          },
          {
            key: "principal",
            header: "Amount",
            render: (t) => (
              <span className={t.tx_type === "credit" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                {t.tx_type === "credit" ? "+" : "-"}
                {t.principal.toFixed(2)} {t.currency}
              </span>
            ),
          },
          { key: "tx_type", header: "Type" },
          {
            key: "status",
            header: "Status",
            render: (t) => (
              <span
                className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                  (t as { status?: string }).status === "processing"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {(t as { status?: string }).status === "processing" ? "Processing" : "Completed"}
              </span>
            ),
          },
          { key: "tx_date", header: "Date", render: (t) => new Date(t.tx_date).toLocaleString() },
          {
            key: "slip",
            header: "",
            render: (t) => (
              <Link href={`/dashboard/receipt/${t.tx_ref}`} className="text-primary text-sm font-medium hover:underline">
                View slip
              </Link>
            ),
          },
        ]}
        data={allItems}
        keyExtractor={(t) => t.tx_ref}
        emptyMessage="No transactions yet."
      />
    </div>
  );
}
