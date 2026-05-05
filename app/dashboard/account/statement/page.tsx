"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Card, PageHeader, DataTable, PageLoader } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AccountStatementPage() {
  const t = useTranslations("accountStatement");
  const locale = useLocale();
  const { userId, isLoading } = useAuth();
  const MONTHS = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return { value: `${y}-${m}`, label: d.toLocaleDateString(locale === "ar" ? "ar" : "en-US", { year: "numeric", month: "long" }) };
  });
  const router = useRouter();
  const [data, setData] = useState<{
    user?: { firstname: string; lastname: string; bank_number: string };
    transactions?: Array<{ tx_ref: string; principal: number; tx_type: string; tx_date: string; currency: string }>;
  } | null>(null);

  useEffect(() => {
    if (!userId) {
      if (!isLoading) router.push("/dashboard/signin");
      return;
    }
    fetch("/api/dashboard/statement")
      .then((r) => {
        if (r.status === 401) {
          router.push("/dashboard/signin");
          return null;
        }
        return r.json();
      })
      .then((d) => d != null && setData(d))
      .catch(() => setData(null));
  }, [userId, isLoading, router]);

  if (!userId && !isLoading) return null;
  if (!data?.user) {
    return (
      <div>
        <PageHeader title={t("title")} backHref="/dashboard" subtitle={t("loading")} />
        <PageLoader message={t("loadingStatement")} />
      </div>
    );
  }

  const { user, transactions = [] } = data;

  return (
    <div>
      <PageHeader title={t("title")} backHref="/dashboard" subtitle={`${user.firstname} ${user.lastname} - ${user.bank_number}`} />
      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-600 mb-2">{t("viewByMonth")}</h3>
        <div className="flex flex-wrap gap-2">
          {MONTHS.slice(0, 6).map((m) => (
            <Link
              key={m.value}
              href={`/dashboard/account/statement/${m.value}`}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-primary/10 text-slate-700 hover:text-primary text-sm font-medium transition-colors"
            >
              {m.label}
            </Link>
          ))}
        </div>
      </div>
      <Card variant="elevated" className="p-0 overflow-hidden">
        <DataTable
          columns={[
            {
              key: "tx_ref",
              header: t("reference"),
              render: (t) => (
                <Link href={`/dashboard/receipt/${t.tx_ref}`} className="font-medium text-primary hover:underline">
                  {String(t.tx_ref).slice(0, 14)}...
                </Link>
              ),
            },
            {
              key: "principal",
              header: t("amount"),
              render: (t) => (
                <span className={t.tx_type === "credit" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                  {t.tx_type === "credit" ? "+" : "-"}{t.principal.toFixed(2)} {t.currency}
                </span>
              ),
            },
            { key: "tx_type", header: t("type"), render: (row) => String(row.tx_type).toUpperCase() },
            { key: "tx_date", header: t("date"), render: (row) => new Date(row.tx_date).toLocaleString(locale === "ar" ? "ar" : "en-US") },
          ]}
          data={transactions}
          keyExtractor={(t) => t.tx_ref}
          emptyMessage={t("noTransactions")}
        />
      </Card>
    </div>
  );
}
