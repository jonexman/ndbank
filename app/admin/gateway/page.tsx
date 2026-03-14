"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, DataTable, Button } from "@/components/ui";

interface PaymentMethod {
  id: number;
  medium: string;
  network?: string | null;
  name: string;
  detail: string;
}

export default function GatewayPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    fetch("/api/admin/gateway")
      .then((r) => r.json())
      .then((d) => setMethods(d.paymentMethods ?? []))
      .catch(() => setMethods([]));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Payment Methods" subtitle="Gateway payment methods" />
        <Link href="/admin/gateway/add">
          <Button>Add Payment Method</Button>
        </Link>
      </div>
      <DataTable
        columns={[
          { key: "id", header: "ID" },
          { key: "name", header: "Name" },
          { key: "medium", header: "Medium", render: (m) => m.medium?.toUpperCase() ?? "-" },
          { key: "network", header: "Network", render: (m) => m.network ?? "-" },
          {
            key: "actions",
            header: "Actions",
            render: (m) => (
              <Link href={`/admin/gateway/${m.id}`} className="text-primary text-sm font-medium hover:underline">
                Edit
              </Link>
            ),
          },
        ]}
        data={methods}
        keyExtractor={(m) => String(m.id)}
        emptyMessage="No payment methods."
      />
    </div>
  );
}
