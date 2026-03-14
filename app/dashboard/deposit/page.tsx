"use client";

import { useState } from "react";
import { Card, Input, Select, Button, PageHeader } from "@/components/ui";

const PAYMENT_METHODS = [
  { id: 1, name: "Bitcoin (BTC)", medium: "crypto" },
  { id: 2, name: "Bank Transfer", medium: "bank" },
];

type DepositType = "bank" | "cheque";

export default function DepositPage() {
  const [depositType, setDepositType] = useState<DepositType>("bank");
  const [methodId, setMethodId] = useState(1);
  const [usdAmount, setUsdAmount] = useState("");
  const [rate, setRate] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [chequeAmount, setChequeAmount] = useState("");
  const [chequeCurrency, setChequeCurrency] = useState("USD");
  const [payee, setPayee] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const res = await fetch("/api/monetary/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        methodId,
        usd_amount: parseFloat(usdAmount),
        rate: parseFloat(rate) || 0,
      }),
    });
    const json = await res.json();
    if (json.status === "success") {
      setStatus({ type: "success", msg: json.message });
      setUsdAmount("");
      setRate("");
    } else {
      setStatus({ type: "error", msg: json.message || "Deposit failed" });
    }
  };

  const handleChequeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const res = await fetch("/api/monetary/cheque", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cheque_number: chequeNumber,
        amount: parseFloat(chequeAmount),
        currency: chequeCurrency,
        payee,
      }),
    });
    const json = await res.json();
    if (json.status === "success") {
      setStatus({ type: "success", msg: json.message });
      setChequeNumber("");
      setChequeAmount("");
      setPayee("");
    } else {
      setStatus({ type: "error", msg: json.message || "Cheque deposit failed" });
    }
  };

  return (
    <div>
      <PageHeader title="Deposit" backHref="/dashboard" subtitle="Add funds to your account" />

      {/* Deposit type tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 max-w-lg mb-6">
        <button
          type="button"
          onClick={() => { setDepositType("bank"); setStatus(null); }}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
            depositType === "bank" ? "bg-white text-navy shadow-sm" : "text-slate-600 hover:text-navy"
          }`}
        >
          Bank / Crypto
        </button>
        <button
          type="button"
          onClick={() => { setDepositType("cheque"); setStatus(null); }}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
            depositType === "cheque" ? "bg-white text-navy shadow-sm" : "text-slate-600 hover:text-navy"
          }`}
        >
          Cheque
        </button>
      </div>

      <Card variant="elevated" className="max-w-lg">
        {depositType === "bank" ? (
          <form onSubmit={handleBankSubmit} className="space-y-6">
            {status && (
              <div className={status.type === "success" ? "form-alert-success" : "form-alert-error"}>
                {status.msg}
              </div>
            )}
            <Select
              label="Payment Method"
              value={String(methodId)}
              onChange={(e) => setMethodId(Number(e.target.value))}
              options={PAYMENT_METHODS.map((m) => ({ value: String(m.id), label: m.name }))}
            />
            <Input
              label="USD Amount"
              type="number"
              step="0.01"
              value={usdAmount}
              onChange={(e) => setUsdAmount(e.target.value)}
              placeholder="0.00"
              required
            />
            {methodId === 1 && (
              <Input
                label="BTC Rate (optional)"
                type="number"
                step="0.00000001"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="0"
              />
            )}
            <Button type="submit" fullWidth>
              Submit Deposit
            </Button>
          </form>
        ) : (
          <form onSubmit={handleChequeSubmit} className="space-y-6">
            {status && (
              <div className={status.type === "success" ? "form-alert-success" : "form-alert-error"}>
                {status.msg}
              </div>
            )}
            <Input
              label="Cheque Number"
              value={chequeNumber}
              onChange={(e) => setChequeNumber(e.target.value)}
              placeholder="e.g. CHQ001234"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Amount"
                type="number"
                step="0.01"
                min="0"
                value={chequeAmount}
                onChange={(e) => setChequeAmount(e.target.value)}
                placeholder="0.00"
                required
              />
              <Select
                label="Currency"
                value={chequeCurrency}
                onChange={(e) => setChequeCurrency(e.target.value)}
                options={[
                  { value: "USD", label: "USD" },
                  { value: "GBP", label: "GBP" },
                  { value: "EUR", label: "EUR" },
                ]}
              />
            </div>
            <Input
              label="Payee Name"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              placeholder="Name on the cheque"
              required
            />
            <p className="text-xs text-slate-500">
              Cheques typically clear in 3–5 business days. Funds will be credited once cleared.
            </p>
            <Button type="submit" fullWidth>
              Submit Cheque
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
