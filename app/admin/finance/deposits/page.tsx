"use client";

import { useEffect, useState } from "react";
import { PageHeader, DataTable } from "@/components/ui";

interface Deposit {
  id: number;
  tx_ref: string;
  userid: number;
  usd_amount: number;
  network?: string;
  status: string;
}

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);

  useEffect(() => {
    fetch("/api/admin/deposits")
      .then((r) => r.json())
      .then((d) => setDeposits(d.deposits ?? []))
      .catch(() => setDeposits([]));
  }, []);

  return (
    <div>
      <PageHeader title="Deposits" subtitle="View deposit requests" />
      <DataTable
        columns={[
          { key: "id", header: "ID" },
          { key: "tx_ref", header: "Ref", render: (d) => String(d.tx_ref).slice(0, 12) + "..." },
          { key: "userid", header: "User ID" },
          { key: "usd_amount", header: "Amount (USD)" },
          { key: "network", header: "Network", render: (d) => String(d.network ?? "-") },
          {
            key: "status",
            header: "Status",
            render: (d) => (
              <span className={String(d.status) === "completed" ? "text-emerald-600" : "text-amber-600"}>
                {String(d.status)}
              </span>
            ),
          },
        ]}
        data={deposits}
        keyExtractor={(d) => String(d.id)}
        emptyMessage="No deposits."
      />
    </div>
  );
}
