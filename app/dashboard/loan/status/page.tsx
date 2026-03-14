"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, DataTable, Button } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoanStatusPage() {
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
        title="Loan Status"
        backHref="/dashboard"
        subtitle="Track your loan applications"
        actions={
          <Button asChild href="/dashboard/loan/apply">
            New Application
          </Button>
        }
      />
      <DataTable
        columns={[
          { key: "loan_id", header: "Loan ID" },
          { key: "amount", header: "Amount", render: (l) => `$${l.amount.toLocaleString()}` },
          { key: "duration", header: "Duration" },
          { key: "loan_type", header: "Type" },
          {
            key: "status",
            header: "Status",
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
          { key: "date", header: "Date", render: (l) => new Date(l.date).toLocaleDateString() },
        ]}
        data={loans}
        keyExtractor={(l) => String(l.id)}
        emptyMessage="No loan applications."
        striped
      />
    </div>
  );
}
