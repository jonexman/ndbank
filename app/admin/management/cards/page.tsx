"use client";

import { useEffect, useState } from "react";
import { PageHeader, DataTable } from "@/components/ui";

interface Card {
  id: number;
  userid: number;
  card_type: string;
  vendor: string;
  card_number: string;
  expiry: string;
  status: string;
}

export default function AdminCardsPage() {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    fetch("/api/admin/cards")
      .then((r) => r.json())
      .then((d) => setCards(d.cards ?? []))
      .catch(() => setCards([]));
  }, []);

  return (
    <div>
      <PageHeader title="Card Applications" subtitle="Manage card requests" />
      <DataTable
        columns={[
          { key: "id", header: "ID" },
          { key: "userid", header: "User ID" },
          { key: "card_type", header: "Type", render: (c) => c.card_type?.toUpperCase() ?? "-" },
          { key: "vendor", header: "Vendor" },
          { key: "card_number", header: "Card" },
          { key: "expiry", header: "Expiry" },
          {
            key: "status",
            header: "Status",
            render: (c) => (
              <span
                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  c.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : c.status === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {c.status}
              </span>
            ),
          },
        ]}
        data={cards}
        keyExtractor={(c) => String(c.id)}
        emptyMessage="No card applications."
      />
    </div>
  );
}
