"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, Input, Select, Button, PageHeader } from "@/components/ui";
import Link from "next/link";

type Step = "form" | "confirm" | "codes" | "processing" | "success";

export default function InternationalTransferPage() {
  const t = useTranslations("transfer");
  const searchParams = useSearchParams();
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
  const [currentCodeIndex, setCurrentCodeIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [chargePct, setChargePct] = useState<number>(0);
  const [feeAmount, setFeeAmount] = useState<number>(0);
  const [totalDebit, setTotalDebit] = useState<number>(0);
  const [resumedForCodes, setResumedForCodes] = useState(false);

  useEffect(() => {
    fetch("/api/transfer/charge-rates")
      .then((r) => r.json())
      .then((d) => setChargePct(Number(d.international_transfer_charge_pct) || 0))
      .catch(() => {});
  }, []);

  const resumeTxRef = searchParams.get("tx_ref");
  useEffect(() => {
    if (!resumeTxRef) return;
    fetch("/api/transfer/awaiting-codes")
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d?.awaiting) ? d.awaiting : [];
        const match = list.find((a: { tx_ref: string; tx_region: string }) => a.tx_ref === resumeTxRef && a.tx_region === "international");
        if (match) {
          setTxRef(match.tx_ref);
          setCodeTypes(match.code_types ?? []);
          setAmount(String(match.amount));
          setCurrency(match.currency ?? "USD");
          setBankAccount(match.recipient_account ?? "");
          setFeeAmount(Number(match.fee_amount) || 0);
          setTotalDebit(Number(match.amount) + Number(match.fee_amount) || 0);
          setStep("codes");
          setResumedForCodes(true);
        }
      })
      .catch(() => {});
  }, [resumeTxRef]);

  const resetForm = () => {
    setBankAccount("");
    setBankName("");
    setSwiftCode("");
    setAmount("");
    setPin("");
    setCodes({});
    setTxRef("");
    setCodeTypes([]);
    setCurrentCodeIndex(0);
    setStep("form");
    setResumedForCodes(false);
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
        setFeeAmount(Number(json.fee_amount) || 0);
        setTotalDebit(Number(json.total_debit) || parseFloat(amount));
        if (json.requires_codes && json.code_types?.length > 0) {
          setCodeTypes(json.code_types);
          setCodes({});
          setStep("codes");
        } else {
          setStep("success");
        }
      } else {
        setStep("form");
        setStatus({ type: "error", msg: json.message || t("initiationFailed") });
      }
    } catch {
      setSubmitting(false);
      setStep("form");
      setStatus({ type: "error", msg: t("requestFailed") });
    }
  };

  const handleValidateCodeStep = async (e: React.FormEvent) => {
    e.preventDefault();
    const sortedCodeTypes = [...codeTypes].sort((a, b) => a.order - b.order);
    const currentType = sortedCodeTypes[currentCodeIndex]?.type;
    if (!currentType || !txRef) return;
    const value = (codes[currentType] ?? "").trim();
    if (!value) {
      setStatus({ type: "error", msg: t("codeRequired", { type: currentType }) });
      return;
    }
    setStatus(null);
    setSubmitting(true);
    setStep("processing");
    try {
      const res = await fetch("/api/transfer/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tx_ref: txRef, code_type: currentType, value }),
      });
      const json = await res.json();
      setSubmitting(false);
      if (json.status === "success") {
        if (json.completed) {
          setStep("success");
        } else {
          setCurrentCodeIndex((i) => i + 1);
          setStep("codes");
        }
      } else {
        setStep("codes");
        setStatus({ type: "error", msg: json.message || t("transferFailed") });
      }
    } catch {
      setSubmitting(false);
      setStep("codes");
      setStatus({ type: "error", msg: t("requestFailed") });
    }
  };

  // Processing overlay
  if (step === "processing") {
    return (
      <div>
        <PageHeader title={t("internationalTitle")} backHref="/dashboard" subtitle={t("processingSubtitle")} />
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
            <p className="text-lg font-semibold text-navy">{t("processingTitle")}</p>
            <p className="text-sm text-slate-500 mt-1">{t("processingPleaseWaitInternational")}</p>
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
        <PageHeader title={t("internationalTitle")} backHref="/dashboard" subtitle={t("transferCompleted")} />
        <Card variant="elevated" className="max-w-lg overflow-hidden">
          <div className="text-center py-6 bg-emerald-50 border-b border-emerald-100">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-emerald-800">{t("transferSubmitted")}</p>
            <p className="text-sm text-emerald-700 mt-1">{t("reference")}: <span className="font-mono font-medium">{txRef}</span></p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("amount")}</span>
              <span className="font-semibold text-navy">{currencySymbol}{amountNum.toFixed(2)} {currency}</span>
            </div>
            {feeAmount > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Fee</span>
                  <span className="text-slate-700">{currencySymbol}{feeAmount.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-700">{t("totalDebit")}</span>
                  <span className="text-navy">{currencySymbol}{totalDebit.toFixed(2)} {currency}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("beneficiaryAccount")}</span>
              <span className="font-mono text-right max-w-[180px] truncate">{bankAccount}</span>
            </div>
            {bankName && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t("bank")}</span>
                <span className="text-right max-w-[180px] truncate">{bankName}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("status")}</span>
              <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800">{t("processing")}</span>
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
              <p className="font-medium text-slate-700 mb-1">{t("whatHappensNext")}</p>
              <p>{t("whatHappensNextInternational", { days: "2" })}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <Link
                href={`/dashboard/receipt/${txRef}`}
                className="inline-flex items-center justify-center w-full px-5 py-2.5 text-sm font-semibold rounded-full bg-gradient-to-r from-primary-dark to-primary-light text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {t("viewTransferSlip")}
              </Link>
              <Button variant="secondary" onClick={resetForm} fullWidth>
                {t("newTransfer")}
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
    const fee = Math.round(amountNum * (chargePct / 100) * 100) / 100;
    const total = amountNum + fee;
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "EUR" ? "€" : "";
    return (
      <div>
        <PageHeader title={t("internationalTitle")} backHref="/dashboard" subtitle={t("confirmSubtitle")} />
        <Card variant="elevated" className="max-w-lg">
          <h3 className="text-base font-semibold text-navy mb-4">{t("reviewDetails")}</h3>
          <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("beneficiaryAccount")}</span>
              <span className="font-mono font-medium text-right max-w-[180px] truncate">{bankAccount}</span>
            </div>
            {bankName && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t("bank")}</span>
                <span className="text-right max-w-[180px] truncate">{bankName}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("amount")}</span>
              <span className="font-semibold">{currencySymbol}{amountNum.toFixed(2)} {currency}</span>
            </div>
            {chargePct > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t("transferFee", { pct: chargePct })}</span>
                  <span className="text-slate-700">{currencySymbol}{fee.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t border-slate-200 pt-3">
                  <span className="text-slate-700">{t("totalDebit")}</span>
                  <span className="text-navy">{currencySymbol}{total.toFixed(2)} {currency}</span>
                </div>
              </>
            )}
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {t("daysConfirmInternational", { days: "2" })}
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={() => setStep("form")} fullWidth>
              {t("back")}
            </Button>
            <Button onClick={handleInitiate} fullWidth>
              {t("confirmAndTransfer")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Codes step (one code at a time; each step validates with server and shows processing animation)
  if (step === "codes") {
    const sortedCodeTypes = [...codeTypes].sort((a, b) => a.order - b.order);
    const totalCodes = sortedCodeTypes.length;
    const isLastStep = currentCodeIndex >= totalCodes - 1;
    const currentType = sortedCodeTypes[currentCodeIndex]?.type;

    return (
      <div>
        <PageHeader title={t("internationalTitle")} backHref="/dashboard" subtitle={t("codesSubtitle")} />
        <Card variant="elevated" className="max-w-lg overflow-hidden">
          <p className="text-sm text-slate-600 mb-1 px-6 pt-6">{t("codesInstructions")}</p>
          <p className="text-sm text-slate-500 mb-4 px-6">{t("codesValidFor")}</p>

          <form onSubmit={handleValidateCodeStep} className="relative px-6 pb-6">
            {status && (
              <div className={`mb-4 ${status.type === "success" ? "form-alert-success" : "form-alert-error"}`}>
                {status.msg}
              </div>
            )}

            <div key={currentCodeIndex} className="transition-opacity duration-300 opacity-100">
              {currentType && (
                <Input
                  label={t("codeLabel", { type: currentType })}
                  value={codes[currentType] ?? ""}
                  onChange={(e) => setCodes((prev) => ({ ...prev, [currentType]: e.target.value }))}
                  placeholder={t("enterCodePlaceholder", { type: currentType })}
                  type="password"
                  inputMode="numeric"
                  autoFocus
                  required
                  disabled={submitting}
                />
              )}
            </div>

            <div className="flex gap-3 mt-6">
              {currentCodeIndex === 0 ? (
                resumedForCodes ? (
                  <Link href="/dashboard" className="w-full">
                    <Button type="button" variant="secondary" fullWidth>
                      {t("backToDashboard")}
                    </Button>
                  </Link>
                ) : (
                  <Button type="button" variant="secondary" onClick={() => setStep("confirm")} fullWidth>
                    {t("back")}
                  </Button>
                )
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCurrentCodeIndex((i) => i - 1)}
                  fullWidth
                >
                  {t("back")}
                </Button>
              )}
              <Button type="submit" fullWidth disabled={submitting}>
                {isLastStep ? t("completeTransfer") : t("continue")}
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
      <PageHeader title={t("internationalTitle")} backHref="/dashboard" subtitle={t("formSubtitleInternational")} />
      <Card variant="elevated" className="max-w-lg">
        <form onSubmit={handleConfirm} className="space-y-6">
          {status && (
            <div className={status.type === "success" ? "form-alert-success" : "form-alert-error"}>{status.msg}</div>
          )}
          <Input
            label={t("beneficiaryAccountIban")}
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder={t("placeholderIban")}
            required
          />
          <Input
            label={t("bankName")}
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder={t("placeholderBank")}
          />
          <Input
            label={t("swiftCode")}
            value={swiftCode}
            onChange={(e) => setSwiftCode(e.target.value)}
            placeholder={t("placeholderSwift")}
          />
          <Input
            label={t("amount")}
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
          <Select
            label={t("currency")}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            options={[
              { value: "USD", label: "USD" },
              { value: "GBP", label: "GBP" },
              { value: "EUR", label: "EUR" },
            ]}
          />
          <Input
            label={t("pin")}
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder={t("enterPin")}
            required
          />
          <Button type="submit" fullWidth>
            {t("continue")}
          </Button>
        </form>
        <p className="mt-4 text-xs text-slate-500">{t("daysNoteInternational")}</p>
      </Card>
    </div>
  );
}
