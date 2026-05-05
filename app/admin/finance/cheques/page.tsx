"use client";

import { useEffect, useState } from "react";
import { PageHeader, DataTable } from "@/components/ui";

interface Cheque {
  id: number;
  userid: number;
  cheque_number: string;
  amount: number;
  currency: string;
  payee: string;
  status: string;
  date: string;
}

export default function AdminChequesPage() {
  const [cheques, setCheques] = useState<Cheque[]>([]);

  useEffect(() => {
    fetch("/api/admin/cheques")
      .then((r) => r.json())
      .then((d) => setCheques(d.cheques ?? []))
      .catch(() => setCheques([]));
  }, []);

  return (
    <div>
      <PageHeader title="Manage Cheques" subtitle="View and manage cheque requests" />
      <DataTable
        columns={[
          { key: "id", header: "ID" },
          { key: "userid", header: "User" },
          { key: "cheque_number", header: "Cheque #" },
          {
            key: "amount",
            header: "Amount",
            render: (c) => `${c.amount} ${c.currency}`,
          },
          { key: "payee", header: "Payee" },
          {
            key: "status",
            header: "Status",
            render: (c) => (
              <span
                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  c.status === "cleared"
                    ? "bg-emerald-100 text-emerald-700"
                    : c.status === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : c.status === "bounced"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {c.status}
              </span>
            ),
          },
          { key: "date", header: "Date", render: (c) => new Date(c.date).toLocaleDateString() },
        ]}
        data={cheques}
        keyExtractor={(c) => String(c.id)}
        emptyMessage="No cheques."
      />
    </div>
  );
}
