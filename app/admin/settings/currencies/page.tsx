"use client";

import { useState } from "react";
import { mockCurrencies } from "@/lib/mockData";
import { PageHeader, DataTable } from "@/components/ui";

export default function AdminCurrenciesPage() {
  const [currencies] = useState(mockCurrencies);

  return (
    <div>
      <PageHeader title="Currencies" backHref="/admin/settings" subtitle="Supported currencies and rates" />
      <DataTable
        columns={[
          { key: "code", header: "Code" },
          { key: "name", header: "Name" },
          { key: "symbol", header: "Symbol" },
          { key: "rate", header: "Rate (vs USD)" },
        ]}
        data={currencies}
        keyExtractor={(c) => c.code}
        emptyMessage="No currencies."
      />
    </div>
  );
}
