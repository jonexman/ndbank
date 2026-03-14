"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, PageHeader, Button, PageLoader } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";

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

  if (!userId && !isLoading) return null;
  if (dataLoading && !data) {
    return (
      <div>
        <PageHeader title="Transfer Slip" backHref="/dashboard" subtitle="Loading..." />
        <PageLoader message="Loading transfer slip" />
      </div>
    );
  }
  if (!data) {
    return (
      <div>
        <PageHeader title="Transfer Slip" backHref="/dashboard" subtitle="Transaction not found." />
      </div>
    );
  }

  const txStatus = data.status ?? "completed";
  const isProcessing = txStatus === "pending" || txStatus === "processing";
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const recipientRow = data.recipient_account && data.tx_type === "debit"
      ? `<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#64748b">Recipient:</span><span style="font-family:monospace">${data.recipient_account}</span></div>`
      : "";
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>Transfer Slip - ${data.tx_ref}</title></head>
        <body style="padding:32px;font-family:system-ui,sans-serif;font-size:14px;color:#334155">
          <div style="max-width:400px;margin:0 auto">
            <h1 style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:24px;padding-bottom:8px;border-bottom:1px solid #e2e8f0">TRANSFER SLIP</h1>
            <div style="margin-bottom:24px">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#64748b">Reference:</span><span style="font-family:monospace;font-weight:500">${data.tx_ref}</span></div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#64748b">Type:</span><span style="font-weight:500;text-transform:capitalize">${data.tx_type}</span></div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#64748b">Amount:</span><span style="font-weight:700">${data.tx_type === "credit" ? "+" : "-"}${data.principal.toFixed(2)} ${data.currency}</span></div>
              ${recipientRow}
              <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#64748b">Date:</span><span>${new Date(data.tx_date).toLocaleString()}</span></div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#64748b">Status:</span><span>${isProcessing ? "Processing" : "Completed"}</span></div>
            </div>
            <p style="margin-top:24px;font-size:12px;color:#64748b">This is a computer-generated slip. Valid for record purposes.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <PageHeader title="Transfer Slip" backHref="/dashboard/transfer/history" subtitle={data.tx_ref} />
        <Button variant="secondary" size="sm" onClick={handlePrint}>
          Print slip
        </Button>
      </div>
      <Card variant="elevated" className="max-w-md">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wider">Reference</p>
              <p className="font-mono font-medium">{data.tx_ref}</p>
            </div>
            <span
              className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                isProcessing ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isProcessing ? "Processing" : "Completed"}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-wider">Type</p>
            <p className="font-medium capitalize">{data.tx_type}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-wider">Amount</p>
            <p
              className={`text-xl font-bold ${
                data.tx_type === "credit" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {data.tx_type === "credit" ? "+" : "-"}
              {data.principal.toFixed(2)} {data.currency}
            </p>
          </div>
          {data.recipient_account && data.tx_type === "debit" && (
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wider">Recipient account</p>
              <p className="font-mono">{data.recipient_account}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-wider">Date</p>
            <p>{new Date(data.tx_date).toLocaleString()}</p>
          </div>
          {isProcessing && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
              <p className="font-medium mb-1">Transfer in progress</p>
              <p>This transfer may take up to <strong>2 working days</strong> to be completed. You will be notified once it is approved.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
