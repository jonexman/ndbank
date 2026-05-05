"use client";

import { useEffect, useState } from "react";
import { PageHeader, DataTable } from "@/components/ui";

interface Exchange {
  id: number;
  userid: number;
  paid_amount: number;
  paid_currency: string;
  expected_amount: number;
  expected_currency: string;
  status: string;
  funded: number;
  date: string;
}

export default function AdminExchangesPage() {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);

  useEffect(() => {
    fetch("/api/admin/exchanges")
      .then((r) => r.json())
      .then((d) => setExchanges(d.exchanges ?? []))
      .catch(() => setExchanges([]));
  }, []);

  return (
    <div>
      <PageHeader title="Exchange Requests" subtitle="Manage currency exchange requests" />
      <DataTable
        columns={[
          { key: "id", header: "ID" },
          { key: "userid", header: "User" },
          {
            key: "paid",
            header: "Paid",
            render: (e) => `${e.paid_amount} ${e.paid_currency}`,
          },
          {
            key: "expected",
            header: "Expected",
            render: (e) => `${e.expected_amount} ${e.expected_currency}`,
          },
          {
            key: "status",
            header: "Status",
            render: (e) => (
              <span
                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  e.status === "approved"
                    ? "bg-emerald-100 text-emerald-700"
                    : e.status === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {e.status}
              </span>
            ),
          },
          { key: "date", header: "Date", render: (e) => new Date(e.date).toLocaleDateString() },
        ]}
        data={exchanges}
        keyExtractor={(e) => String(e.id)}
        emptyMessage="No exchange requests."
      />
    </div>
  );
}
