"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { PageHeader, DataTable, Button } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoanStatusPage() {
  const t = useTranslations("loanStatus");
  const locale = useLocale();
  const { userId, isLoading } = useAuth();
  const router = useRouter();
  const [loans, setLoans] = useState<
    Array<{ id: string; amount: number; duration: string; loan_type: string; loan_id: string; status: string; date: string }>
  >([]);

  useEffect(() => {
    if (!userId) {
      if (!isLoading) router.push("/dashboard/signin");
      return;
    }
    fetch("/api/dashboard/loan/status")
      .then((r) => {
        if (r.status === 401) {
          router.push("/dashboard/signin");
          return null;
        }
        return r.json();
      })
      .then((d) => d != null && setLoans(d.loans ?? []))
      .catch(() => setLoans([]));
  }, [userId, isLoading, router]);

  if (!userId && isLoading) return null;

  return (
    <div>
      <PageHeader
        title={t("title")}
        backHref="/dashboard"
        subtitle={t("subtitle")}
        actions={
          <Button asChild href="/dashboard/loan/apply">
            {t("newApplication")}
          </Button>
        }
      />
      <DataTable
        columns={[
          { key: "loan_id", header: t("loanId") },
          { key: "amount", header: t("amount"), render: (l) => `$${l.amount.toLocaleString()}` },
          { key: "duration", header: t("duration") },
          { key: "loan_type", header: t("type") },
          {
            key: "status",
            header: t("status"),
            render: (l) => (
              <span
                className={
                  l.status === "approved"
                    ? "text-emerald-600"
                    : l.status === "rejected"
                    ? "text-red-600"
                    : "text-amber-600"
                }
              >
                {l.status}
              </span>
            ),
          },
          { key: "date", header: t("date"), render: (l) => new Date(l.date).toLocaleDateString(locale === "ar" ? "ar" : "en-US") },
        ]}
        data={loans}
        keyExtractor={(l) => String(l.id)}
        emptyMessage={t("emptyMessage")}
        striped
      />
    </div>
  );
}
