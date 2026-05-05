"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PageHeader, PageLoader } from "@/components/ui";
import { siteConfig } from "@/lib/siteConfig";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTranslations } from "next-intl";

export default function ReceiptPage() {
  const params = useParams();
  const txRef = params.tx_ref as string;
  const { userId, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<{
    tx_ref: string;
    principal: number;
    tx_type: string;
    tx_date: string;
    currency: string;
    status?: string;
    recipient_account?: string | null;
  } | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [copiedRef, setCopiedRef] = useState(false);
  const tCommon = useTranslations("common");

  useEffect(() => {
    if (!txRef || !userId) {
      if (!userId && !isLoading) router.push("/dashboard/signin");
      return;
    }
    setDataLoading(true);
    fetch("/api/dashboard/user")
      .then((r) => {
        if (r.status === 401) {
          router.push("/dashboard/signin");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        const tx = (d.transactions ?? []).find((t: { tx_ref: string }) => t.tx_ref === txRef);
        const pending = (d.pendingTransfers ?? []).find((t: { tx_ref: string }) => t.tx_ref === txRef);
        setData(tx ?? pending ?? null);
      })
      .catch(() => setData(null))
      .finally(() => setDataLoading(false));
  }, [txRef, userId, isLoading, router]);

  const copyRef = () => {
    if (!data?.tx_ref) return;
    navigator.clipboard?.writeText(data.tx_ref).then(() => {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!data) return;
    const text = `Transfer ${data.tx_type}: ${data.tx_type === "credit" ? "+" : "-"}${data.principal.toFixed(2)} ${data.currency}\nRef: ${data.tx_ref}\n${siteConfig.title}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Transfer Receipt",
          text,
        });
      } catch {
        navigator.clipboard?.writeText(text);
      }
    } else {
      navigator.clipboard?.writeText(text);
    }
  };

  if (!userId && !isLoading) return null;
  if (dataLoading && !data) {
    return (
      <div>
        <PageHeader title="Transaction Details" backHref="/dashboard" subtitle="Loading..." />
        <PageLoader message="Loading receipt" />
      </div>
    );
  }
  if (!data) {
    return (
      <div>
        <PageHeader title="Transaction Details" backHref="/dashboard" subtitle="Transaction not found." />
      </div>
    );
  }

  const txStatus = data.status ?? "completed";
  const isAwaitingAdmin = txStatus === "awaiting_admin";
  const isProcessing = txStatus === "pending" || txStatus === "processing" || isAwaitingAdmin;
  const fee = 0;
  const amountPaid = data.principal + fee;

  return (
    <div className="max-w-lg mx-auto print:max-w-none">
      <div className="print:hidden">
        <PageHeader title="Transaction Details" backHref="/dashboard/transfer/history" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden print:shadow-none print:border">
        {/* Logo */}
        <div className="flex justify-center pt-8 pb-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center overflow-hidden">
            <Image src={siteConfig.icon} alt={siteConfig.title} width={48} height={48} className="object-contain" />
          </div>
        </div>

        {/* Transfer summary */}
        <div className="px-6 pb-6 text-center">
          <p className="text-sm text-slate-500 mb-1">
            {data.tx_type === "debit"
              ? data.recipient_account
                ? `Transfer to ${data.recipient_account}`
                : "Transfer"
              : "Credit received"}
          </p>
          <p
            className={`text-3xl font-bold font-heading ${
              data.tx_type === "credit" ? "text-emerald-600" : "text-slate-900"
            }`}
          >
            {data.tx_type === "credit" ? "+" : "-"}
            {data.principal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {data.currency}
          </p>
          <p
            className={`mt-2 font-semibold ${
              isProcessing ? "text-amber-600" : "text-emerald-600"
            }`}
          >
            {isAwaitingAdmin ? "Awaiting admin confirmation" : isProcessing ? "Processing" : "Completed"}
          </p>
        </div>

        {/* Timeline (simplified) */}
        <div className="px-6 pb-4 border-t border-slate-100">
          <div className="flex items-center gap-2 pt-4">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-800">
              {isAwaitingAdmin ? "Awaiting admin confirmation" : isProcessing ? "Payment processing" : "Payment successful"}
            </p>
              <p className="text-sm text-slate-500">{new Date(data.tx_date).toLocaleString()}</p>
            </div>
          </div>
          {isAwaitingAdmin && (
            <p className="mt-4 text-sm text-slate-500">
              You have completed your part. The transfer is pending admin approval and will be processed shortly.
            </p>
          )}
          {isProcessing && !isAwaitingAdmin && (
            <p className="mt-4 text-sm text-slate-500">
              The recipient account is expected to be credited within 5 minutes to 48 hours, subject to notification by the bank.
            </p>
          )}
          {!isProcessing && (
            <p className="mt-4 text-sm text-slate-500">
              Transaction completed successfully. The recipient account has been credited.
            </p>
          )}
        </div>

        {/* Financial breakdown */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100">
          <div className="flex justify-between text-sm py-2">
            <span className="text-slate-600">Amount</span>
            <span className="font-medium">
              {data.principal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {data.currency}
            </span>
          </div>
          <div className="flex justify-between text-sm py-2">
            <span className="text-slate-600">Fee</span>
            <span className="font-medium">
              {fee.toLocaleString(undefined, { minimumFractionDigits: 2 })} {data.currency}
            </span>
          </div>
          <div className="flex justify-between text-sm py-2 border-t border-slate-200">
            <span className="text-slate-700 font-medium">Amount paid</span>
            <span className="font-semibold">
              {amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })} {data.currency}
            </span>
          </div>
        </div>

        {/* Transaction details */}
        <div className="px-6 py-6 space-y-4 border-t border-slate-100">
          {data.recipient_account && data.tx_type === "debit" && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Recipient details</p>
              <p className="font-medium">{siteConfig.title} | {data.recipient_account}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Transaction No.</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{data.tx_ref}</span>
              <button
                type="button"
                onClick={copyRef}
                className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                title={copiedRef ? "Copied" : "Copy"}
              >
                {copiedRef ? (
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Payment method</p>
            <p className="font-medium">{siteConfig.title} · {tCommon("online")}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Transaction date</p>
            <p>{new Date(data.tx_date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</p>
            <p className={`font-semibold ${isProcessing ? "text-amber-600" : "text-emerald-600"}`}>
              {isAwaitingAdmin ? "Awaiting admin confirmation" : isProcessing ? "Processing" : "Completed"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-8 space-y-3 print:hidden">
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/dashboard/transfer" className="font-medium text-primary hover:underline">
              Transfer again
            </Link>
            <Link href="/contact" className="font-medium text-slate-600 hover:text-slate-800">
              Report issue
            </Link>
          </div>
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {copiedRef ? "Reference copied to clipboard" : ""}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 py-3 rounded-xl border border-primary/30 text-primary font-medium hover:bg-primary/5 transition-colors"
            >
              Share receipt
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-95 transition-opacity"
              title="Print or save as PDF using your browser's print dialog"
            >
              Print / Save as PDF
            </button>
          </div>
          <p className="text-xs text-slate-500 text-center mt-2">
            Use your browser&apos;s print dialog to save this receipt as a PDF.
          </p>
        </div>
      </div>
    </div>
  );
}
