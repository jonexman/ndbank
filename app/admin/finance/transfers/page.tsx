"use client";

import { useEffect, useState } from "react";
import { PageHeader, DataTable } from "@/components/ui";

interface Transfer {
  id: number;
  tx_ref: string;
  amount: number;
  currency: string;
  tx_date: string;
  tx_region: string;
  bank_account: string;
}

export default function AdminTransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  useEffect(() => {
    fetch("/api/admin/transfers")
      .then((r) => r.json())
      .then((d) => setTransfers(d.transfers ?? []))
      .catch(() => setTransfers([]));
  }, []);

  return (
    <div>
      <PageHeader title="Transfers" subtitle="View transfer history" />
      <DataTable
        columns={[
          { key: "id", header: "ID" },
          { key: "tx_ref", header: "Ref", render: (t) => String(t.tx_ref).slice(0, 12) + "..." },
          { key: "bank_account", header: "Recipient" },
          { key: "amount", header: "Amount", render: (t) => `${t.amount} ${t.currency}` },
          { key: "tx_region", header: "Region" },
          { key: "tx_date", header: "Date", render: (t) => new Date(t.tx_date).toLocaleDateString() },
        ]}
        data={transfers}
        keyExtractor={(t) => String(t.id)}
        emptyMessage="No transfers."
      />
    </div>
  );
}
