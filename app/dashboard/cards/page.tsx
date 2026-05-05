"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, Select, Button, PageHeader } from "@/components/ui";

export default function CardsPage() {
  const t = useTranslations("cards");
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
      setStatus({ type: "error", msg: json.message || t("applicationFailed") });
    }
  };

  return (
    <div>
      <PageHeader title={t("title")} backHref="/dashboard" subtitle={t("subtitle")} />
      <Card variant="elevated" className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {status && (
            <div className={status.type === "success" ? "form-alert-success" : "form-alert-error"}>
              {status.msg}
            </div>
          )}
          <Select
            label={t("cardType")}
            value={cardType}
            onChange={(e) => setCardType(e.target.value)}
            options={[
              { value: "debit", label: t("debit") },
              { value: "credit", label: t("credit") },
            ]}
          />
          <Select
            label={t("vendor")}
            value={cardVendor}
            onChange={(e) => setCardVendor(e.target.value as "visa" | "mastercard")}
            options={[
              { value: "visa", label: t("visa") },
              { value: "mastercard", label: t("mastercard") },
            ]}
          />
          <Button type="submit" fullWidth>
            {t("apply")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
