"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, Input, Select, Button, PageHeader } from "@/components/ui";

export default function LoanApplyPage() {
  const t = useTranslations("loanApply");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("12");
  const [loanType, setLoanType] = useState("personal");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError(t("validAmount"));
      return;
    }
    setLoading(true);
    const res = await fetch("/api/dashboard/loan/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amt, duration: `${duration} months`, loanType, reason }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) router.push("/dashboard/loan/status");
    else setError(data.error ?? t("requestFailed"));
  }

  return (
    <div>
      <PageHeader title={t("title")} backHref="/dashboard" subtitle={t("subtitle")} />
      <Card variant="elevated" className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="form-alert-error">{error}</div>}
          <Input
            label={t("amountUsd")}
            type="number"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="100"
            required
          />
          <Select
            label={t("duration")}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            options={[
              { value: "6", label: t("months6") },
              { value: "12", label: t("months12") },
              { value: "24", label: t("months24") },
              { value: "36", label: t("months36") },
            ]}
          />
          <Select
            label={t("loanType")}
            value={loanType}
            onChange={(e) => setLoanType(e.target.value)}
            options={[
              { value: "personal", label: t("personal") },
              { value: "mortgage", label: t("mortgage") },
              { value: "auto", label: t("auto") },
            ]}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">{t("reasonOptional")}</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors"
            />
          </div>
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? t("submitting") : t("apply")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
