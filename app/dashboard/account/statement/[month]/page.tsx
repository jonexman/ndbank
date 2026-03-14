"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, PageHeader, DataTable, PageLoader } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";

export default function MonthlyStatementPage() {
  const params = useParams();
  const month = params.month as string;
  const { userId, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<{
    user?: { firstname: string; lastname: string; bank_number: string };
    transactions?: Array<{ tx_ref: string; principal: number; tx_type: string; tx_date: string; currency: string }>;
  } | null>(null);

  useEffect(() => {
    if (!month || !userId) {
      if (!userId && !isLoading) router.push("/dashboard/signin");
      return;
    }
    fetch(`/api/dashboard/statement?month=${month}`)
      .then((r) => {
        if (r.status === 401) {
          router.push("/dashboard/signin");
          return null;
        }
        return r.json();
      })
      .then((d) => d != null && setData(d))
      .catch(() => setData(null));
  }, [month, userId, isLoading, router]);

  const monthLabel = month
    ? new Date(month + "-01").toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "Unknown";

  if (!userId && !isLoading) return null;
  if (!data?.user) {
    return (
      <div>
        <PageHeader title={`Statement - ${monthLabel}`} backHref="/dashboard/account/statement" subtitle="Loading..." />
        <PageLoader message="Loading statement" />
      </div>
    );
  }

  const { user, transactions = [] } = data;

  return (
    <div>
      <PageHeader
        title={`Statement - ${monthLabel}`}
        backHref="/dashboard/account/statement"
        subtitle={`${user.firstname} ${user.lastname} - ${user.bank_number}`}
      />
      <Card className="p-0 overflow-hidden">
        <DataTable
          columns={[
            {
              key: "tx_ref",
              header: "Reference",
              render: (t) => (
                <Link href={`/dashboard/receipt/${t.tx_ref}`} className="font-medium text-primary hover:underline">
                  {String(t.tx_ref).slice(0, 14)}...
                </Link>
              ),
            },
            {
              key: "principal",
              header: "Amount",
              render: (t) => (
                <span className={t.tx_type === "credit" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                  {t.tx_type === "credit" ? "+" : "-"}{t.principal.toFixed(2)} {t.currency}
                </span>
              ),
            },
            { key: "tx_type", header: "Type", render: (t) => String(t.tx_type).toUpperCase() },
            { key: "tx_date", header: "Date", render: (t) => new Date(t.tx_date).toLocaleString() },
          ]}
          data={transactions}
          keyExtractor={(t) => t.tx_ref}
          emptyMessage="No transactions in this month."
        />
      </Card>
    </div>
  );
}
