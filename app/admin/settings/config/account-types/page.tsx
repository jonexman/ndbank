"use client";

import { useEffect, useState } from "react";
import { PageHeader, DataTable } from "@/components/ui";

interface AccountType {
  id: number;
  name: string;
  code: string;
  min_balance?: number;
  description?: string;
}

export default function AccountTypesPage() {
  const [types, setTypes] = useState<AccountType[]>([]);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((d) => setTypes(d.accountTypes ?? []))
      .catch(() => setTypes([]));
  }, []);

  return (
    <div>
      <PageHeader title="Account Types" backHref="/admin/settings/config" subtitle="Configure account types (Savings, Current, Premium)" />
      <DataTable
        columns={[
          { key: "id", header: "ID" },
          { key: "name", header: "Name" },
          { key: "code", header: "Code" },
          { key: "min_balance", header: "Min Balance", render: (t) => t.min_balance ?? "-" },
          { key: "description", header: "Description", render: (t) => t.description ?? "-" },
        ]}
        data={types}
        keyExtractor={(t) => String(t.id)}
        emptyMessage="No account types."
      />
    </div>
  );
}
