"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { PageHeader, DataTable, PageLoader, TableSkeleton } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";

const PAGE_SIZE = 15;

export default function TransferHistoryPage() {
  const t = useTranslations("transferHistory");
  const locale = useLocale();
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
        <PageHeader title={t("title")} backHref="/dashboard" subtitle={t("loading")} />
        <TableSkeleton rows={8} cols={6} />
        <div className="mt-4 flex justify-center">
          <PageLoader message={t("loadingTransactions")} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <PageHeader title={t("title")} backHref="/dashboard" subtitle={t("subtitle")} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("previous")}
          </button>
          <span className="text-sm text-slate-600 px-2">{t("page", { page })}</span>
          <button
            type="button"
            disabled={!data.hasMore}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("next")}
          </button>
        </div>
      </div>
      <DataTable
        striped
        columns={[
          {
            key: "tx_ref",
            header: t("reference"),
            render: (row) => (
              <Link href={`/dashboard/receipt/${row.tx_ref}`} className="font-medium text-primary hover:underline">
                {String(row.tx_ref).slice(0, 12)}...
              </Link>
            ),
          },
          {
            key: "principal",
            header: t("amount"),
            render: (row) => (
              <span className={row.tx_type === "credit" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                {row.tx_type === "credit" ? "+" : "-"}
                {row.principal.toFixed(2)} {row.currency}
              </span>
            ),
          },
          { key: "tx_type", header: t("type") },
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
                {(row as { status?: string }).status === "processing" ? t("processing") : t("completed")}
              </span>
            ),
          },
          { key: "tx_date", header: t("date"), render: (row) => new Date(row.tx_date).toLocaleString(locale === "ar" ? "ar" : "en-US") },
          {
            key: "slip",
            header: "",
            render: (row) => (
              <Link href={`/dashboard/receipt/${row.tx_ref}`} className="text-primary text-sm font-medium hover:underline">
                {t("viewSlip")}
              </Link>
            ),
          },
        ]}
        data={allItems}
        keyExtractor={(row) => row.tx_ref}
        emptyMessage={t("noTransactions")}
      />
    </div>
  );
}
