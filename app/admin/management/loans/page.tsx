"use client";

import { useEffect, useState } from "react";
import { PageHeader, DataTable } from "@/components/ui";

interface Loan {
  id: number;
  userid: number;
  amount: number;
  duration: string;
  loan_type: string;
  loan_id: string;
  status: string;
  date: string;
}

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    fetch("/api/admin/loans")
      .then((r) => r.json())
      .then((d) => setLoans(d.loans ?? []))
      .catch(() => setLoans([]));
  }, []);

  return (
    <div>
      <PageHeader title="Loans" subtitle="Manage loan applications" />
      <DataTable
        columns={[
          { key: "id", header: "ID" },
          { key: "loan_id", header: "Loan ID" },
          { key: "userid", header: "User ID" },
          { key: "amount", header: "Amount" },
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
      />
    </div>
  );
}
