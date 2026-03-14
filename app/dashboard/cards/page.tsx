"use client";

import { useState } from "react";
import { Card, Select, Button, PageHeader } from "@/components/ui";

export default function CardsPage() {
  const [cardType, setCardType] = useState("debit");
  const [cardVendor, setCardVendor] = useState<"visa" | "mastercard">("visa");
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const res = await fetch("/api/cards/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardType, cardVendor }),
    });
    const json = await res.json();
    if (json.status === "success") {
      setStatus({ type: "success", msg: json.message });
    } else {
      setStatus({ type: "error", msg: json.message || "Application failed" });
    }
  };

  return (
    <div>
      <PageHeader title="Apply for Card" backHref="/dashboard" subtitle="Request debit or credit card" />
      <Card variant="elevated" className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {status && (
            <div className={status.type === "success" ? "form-alert-success" : "form-alert-error"}>
              {status.msg}
            </div>
          )}
          <Select
            label="Card Type"
            value={cardType}
            onChange={(e) => setCardType(e.target.value)}
            options={[
              { value: "debit", label: "Debit" },
              { value: "credit", label: "Credit" },
            ]}
          />
          <Select
            label="Vendor"
            value={cardVendor}
            onChange={(e) => setCardVendor(e.target.value as "visa" | "mastercard")}
            options={[
              { value: "visa", label: "Visa" },
              { value: "mastercard", label: "Mastercard" },
            ]}
          />
          <Button type="submit" fullWidth>
            Apply
          </Button>
        </form>
      </Card>
    </div>
  );
}
