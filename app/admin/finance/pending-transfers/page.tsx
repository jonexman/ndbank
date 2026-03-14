"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, Button, PageLoader, TableSkeleton } from "@/components/ui";

interface PendingTransfer {
  id: string;
  tx_ref: string;
  user_id: string;
  user_email: string;
  user_name: string;
  recipient_account: string;
  amount: number;
  currency: string;
  tx_region: string;
  otp_code: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export default function PendingTransfersPage() {
  const [pending, setPending] = useState<PendingTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  const fetchPending = () => {
    fetch("/api/admin/transfers/pending")
      .then((r) => r.json())
      .then((d) => setPending(d.pending ?? []))
      .catch(() => setPending([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = (txRef: string) => {
    setApproving(txRef);
    fetch("/api/admin/transfers/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tx_ref: txRef }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) fetchPending();
      })
      .finally(() => setApproving(null));
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Pending Transfers" subtitle="Loading..." />
        <TableSkeleton rows={6} cols={8} />
        <div className="mt-4 flex justify-center">
          <PageLoader message="Loading pending transfers" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Pending Transfers"
        subtitle="Transfers awaiting admin approval (OTP visible here when user does not receive it by email)"
      />
      <Card className="overflow-hidden">
        {pending.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No pending transfers.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left font-semibold text-navy">Ref</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">User</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">Recipient</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">Region</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">OTP Code</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">Expires</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => {
                  const expired = new Date(p.expires_at) < new Date();
                  return (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono text-xs">{p.tx_ref}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{p.user_name}</p>
                        <p className="text-slate-500 text-xs">{p.user_email}</p>
                      </td>
                      <td className="px-6 py-4 font-mono">{p.recipient_account}</td>
                      <td className="px-6 py-4">
                        {p.amount.toLocaleString()} {p.currency}
                      </td>
                      <td className="px-6 py-4 capitalize">{p.tx_region}</td>
                      <td className="px-6 py-4 font-mono font-semibold text-primary">{p.otp_code}</td>
                      <td className={`px-6 py-4 ${expired ? "text-red-600" : "text-slate-600"}`}>
                        {new Date(p.expires_at).toLocaleString()}
                        {expired && " (expired)"}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          disabled={expired || approving === p.tx_ref}
                          onClick={() => handleApprove(p.tx_ref)}
                        >
                          {approving === p.tx_ref ? "Approving..." : "Approve"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
