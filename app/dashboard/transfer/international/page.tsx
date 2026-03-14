"use client";

import { useState } from "react";
import { Card, Input, Select, Button, PageHeader } from "@/components/ui";
import Link from "next/link";

type Step = "form" | "confirm" | "codes" | "processing" | "success";

export default function InternationalTransferPage() {
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [pin, setPin] = useState("");
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [txRef, setTxRef] = useState("");
  const [codeTypes, setCodeTypes] = useState<Array<{ type: string; order: number }>>([]);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setBankAccount("");
    setBankName("");
    setSwiftCode("");
    setAmount("");
    setPin("");
    setCodes({});
    setTxRef("");
    setCodeTypes([]);
    setStep("form");
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setStep("confirm");
  };

  const handleInitiate = async () => {
    setStatus(null);
    setSubmitting(true);
    setStep("processing");
    try {
      const res = await fetch("/api/transfer/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_account: bankAccount,
          amount: parseFloat(amount),
          currency,
          tx_region: "international",
          pin,
        }),
      });
      const json = await res.json();
      setSubmitting(false);
      if (json.status === "success") {
        setTxRef(json.tx_ref);
        setPin("");
        if (json.requires_codes && json.code_types?.length > 0) {
          setCodeTypes(json.code_types);
          setCodes({});
          setStep("codes");
        } else {
          setStep("success");
        }
      } else {
        setStep("form");
        setStatus({ type: "error", msg: json.message || "Transfer initiation failed" });
      }
    } catch {
      setSubmitting(false);
      setStep("form");
      setStatus({ type: "error", msg: "Request failed" });
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    setStep("processing");
    try {
      const res = await fetch("/api/transfer/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tx_ref: txRef, codes }),
      });
      const json = await res.json();
      setSubmitting(false);
      if (json.status === "success") {
        setStep("success");
      } else {
        setStep("codes");
        setStatus({ type: "error", msg: json.message || "Transfer failed" });
      }
    } catch {
      setSubmitting(false);
      setStep("codes");
      setStatus({ type: "error", msg: "Request failed" });
    }
  };

  // Processing overlay
  if (step === "processing") {
    return (
      <div>
        <PageHeader title="International Transfer" backHref="/dashboard" subtitle="Processing your transfer" />
        <Card variant="elevated" className="max-w-lg overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"
                style={{ animationDuration: "1s" }}
              />
              <div className="absolute inset-2 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 002.5-2.5V8m-8 0a9 9 0 1018 0" />
                </svg>
              </div>
            </div>
            <p className="text-lg font-semibold text-navy">Processing transfer</p>
            <p className="text-sm text-slate-500 mt-1">Please wait while we process your international transfer</p>
          </div>
        </Card>
      </div>
    );
  }

  // Success receipt
  if (step === "success") {
    const amountNum = parseFloat(amount);
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "EUR" ? "€" : "";
    return (
      <div>
        <PageHeader title="International Transfer" backHref="/dashboard" subtitle="Transfer completed" />
        <Card variant="elevated" className="max-w-lg overflow-hidden">
          <div className="text-center py-6 bg-emerald-50 border-b border-emerald-100">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-emerald-800">Transfer submitted successfully</p>
            <p className="text-sm text-emerald-700 mt-1">Reference: <span className="font-mono font-medium">{txRef}</span></p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Amount</span>
              <span className="font-semibold text-navy">{currencySymbol}{amountNum.toFixed(2)} {currency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Beneficiary account</span>
              <span className="font-mono text-right max-w-[180px] truncate">{bankAccount}</span>
            </div>
            {bankName && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Bank</span>
                <span className="text-right max-w-[180px] truncate">{bankName}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800">Processing</span>
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
              <p className="font-medium text-slate-700 mb-1">What happens next?</p>
              <p>Your international transfer is being processed. It may take up to <strong>2 working days</strong> to be completed and credited to the beneficiary. You will be notified once the transfer is approved.</p>
            </div>
            <div className="mt-6 flex gap-3">
              <Link
                href={`/dashboard/receipt/${txRef}`}
                className="inline-flex items-center justify-center w-full px-5 py-2.5 text-sm font-semibold rounded-full bg-gradient-to-r from-primary-dark to-primary-light text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                View transfer slip
              </Link>
              <Button variant="secondary" onClick={resetForm} fullWidth>
                New transfer
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Confirmation step
  if (step === "confirm") {
    const amountNum = parseFloat(amount);
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "EUR" ? "€" : "";
    return (
      <div>
        <PageHeader title="International Transfer" backHref="/dashboard" subtitle="Confirm your transfer" />
        <Card variant="elevated" className="max-w-lg">
          <h3 className="text-base font-semibold text-navy mb-4">Review transfer details</h3>
          <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Beneficiary account</span>
              <span className="font-mono font-medium text-right max-w-[180px] truncate">{bankAccount}</span>
            </div>
            {bankName && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Bank</span>
                <span className="text-right max-w-[180px] truncate">{bankName}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Amount</span>
              <span className="font-semibold">{currencySymbol}{amountNum.toFixed(2)} {currency}</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            International transfers may take up to <strong>2 working days</strong> to be processed and credited.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={() => setStep("form")} fullWidth>
              Back
            </Button>
            <Button onClick={handleInitiate} fullWidth>
              Confirm & transfer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Codes step
  if (step === "codes") {
    return (
      <div>
        <PageHeader title="International Transfer" backHref="/dashboard" subtitle="Enter your transfer codes" />
        <Card variant="elevated" className="max-w-lg">
          <p className="text-sm text-slate-600 mb-4">Enter your transfer codes below. If you don&apos;t have them, contact your administrator.</p>
          <form onSubmit={handleComplete} className="space-y-6">
            {status && (
              <div className={status.type === "success" ? "form-alert-success" : "form-alert-error"}>{status.msg}</div>
            )}
            {codeTypes
              .sort((a, b) => a.order - b.order)
              .map(({ type }) => (
                <Input
                  key={type}
                  label={`${type} Code`}
                  value={codes[type] ?? ""}
                  onChange={(e) => setCodes((prev) => ({ ...prev, [type]: e.target.value }))}
                  placeholder={`Enter ${type} code`}
                  type="password"
                  required
                />
              ))}
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setStep("confirm")} fullWidth>
                Back
              </Button>
              <Button type="submit" fullWidth disabled={submitting}>
                Complete transfer
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // Form step
  return (
    <div>
      <PageHeader title="International Transfer" backHref="/dashboard" subtitle="Send money overseas" />
      <Card variant="elevated" className="max-w-lg">
        <form onSubmit={handleConfirm} className="space-y-6">
          {status && (
            <div className={status.type === "success" ? "form-alert-success" : "form-alert-error"}>{status.msg}</div>
          )}
          <Input
            label="Beneficiary Account (IBAN or account number)"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="e.g. GB82WEST12345698765432"
            required
          />
          <Input
            label="Bank Name"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g. Barclays Bank"
          />
          <Input
            label="SWIFT/BIC Code"
            value={swiftCode}
            onChange={(e) => setSwiftCode(e.target.value)}
            placeholder="e.g. BARCGB22"
          />
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
          <Select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            options={[
              { value: "USD", label: "USD" },
              { value: "GBP", label: "GBP" },
              { value: "EUR", label: "EUR" },
            ]}
          />
          <Input
            label="PIN"
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter your PIN"
            required
          />
          <Button type="submit" fullWidth>
            Continue
          </Button>
        </form>
        <p className="mt-4 text-xs text-slate-500">International transfers may take up to 2 working days to complete.</p>
      </Card>
    </div>
  );
}
