"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Input, Select, Button, PageHeader } from "@/components/ui";

export default function LoanApplyPage() {
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
      setError("Enter a valid amount");
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
    else setError(data.error ?? "Request failed");
  }

  return (
    <div>
      <PageHeader title="Apply for Loan" backHref="/dashboard" subtitle="Submit your loan application" />
      <Card variant="elevated" className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="form-alert-error">{error}</div>}
          <Input
            label="Amount (USD)"
            type="number"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="100"
            required
          />
          <Select
            label="Duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            options={[
              { value: "6", label: "6 months" },
              { value: "12", label: "12 months" },
              { value: "24", label: "24 months" },
              { value: "36", label: "36 months" },
            ]}
          />
          <Select
            label="Loan Type"
            value={loanType}
            onChange={(e) => setLoanType(e.target.value)}
            options={[
              { value: "personal", label: "Personal" },
              { value: "mortgage", label: "Mortgage" },
              { value: "auto", label: "Auto" },
            ]}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors"
            />
          </div>
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Submitting..." : "Apply"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
