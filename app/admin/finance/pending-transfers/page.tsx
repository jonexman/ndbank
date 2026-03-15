"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader, Card, Button, TableSkeleton } from "@/components/ui";

interface PendingTransfer {
  id: string;
  tx_ref: string;
  user_id: string;
  user_usercode?: string;
  user_email: string;
  user_name: string;
  recipient_account: string;
  amount: number;
  fee_amount: number;
  currency: string;
  tx_region: string;
  otp_code: string;
  status: string;
  created_at: string;
  expires_at: string;
  awaiting_user?: boolean;
}

type FilterStatus = "all" | "ready" | "awaiting_user";

export default function PendingTransfersPage() {
  const [pending, setPending] = useState<PendingTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPending = () => {
    setLoading(true);
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

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(t);
  }, [message]);

  const filtered = useMemo(() => {
    if (filter === "ready") return pending.filter((p) => !p.awaiting_user && new Date(p.expires_at) >= new Date());
    if (filter === "awaiting_user") return pending.filter((p) => p.awaiting_user);
    return pending;
  }, [pending, filter]);

  const counts = useMemo(() => {
    const now = new Date();
    const ready = pending.filter((p) => !p.awaiting_user && new Date(p.expires_at) >= now).length;
    const awaiting = pending.filter((p) => p.awaiting_user).length;
    return { ready, awaiting, total: pending.length };
  }, [pending]);

  const handleApprove = (txRef: string) => {
    setMessage(null);
    setApproving(txRef);
    fetch("/api/admin/transfers/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tx_ref: txRef }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setMessage({ type: "success", text: `Transfer ${txRef} approved.` });
          fetchPending();
        } else {
          setMessage({ type: "error", text: json.error ?? "Approval failed" });
        }
      })
      .catch(() => setMessage({ type: "error", text: "Request failed" }))
      .finally(() => setApproving(null));
  };

  const handleReject = (txRef: string) => {
    if (!confirm("Reject this transfer? The client will need to start a new transfer.")) return;
    setMessage(null);
    setRejecting(txRef);
    fetch("/api/admin/transfers/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tx_ref: txRef }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setMessage({ type: "success", text: `Transfer ${txRef} rejected.` });
          fetchPending();
        } else {
          setMessage({ type: "error", text: json.error ?? "Reject failed" });
        }
      })
      .catch(() => setMessage({ type: "error", text: "Request failed" }))
      .finally(() => setRejecting(null));
  };

  if (loading && pending.length === 0) {
    return (
      <div>
        <PageHeader title="Pending Transfers" subtitle="Loading..." />
        <TableSkeleton rows={6} cols={10} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <PageHeader
          title="Pending Transfers"
          subtitle="Awaiting user verification or admin approval"
        />
        <Button variant="secondary" onClick={fetchPending} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm ${
            message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <p className="mb-4 text-sm text-slate-600">
        <strong>Awaiting user verification:</strong> client has not yet entered their transfer codes.{" "}
        <strong>Pending admin approval:</strong> client has completed codes; you can approve or reject.
      </p>

      {pending.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <span className="text-sm text-slate-600">
            <span className="font-medium text-blue-700">{counts.ready} ready to approve</span>
            {" · "}
            <span className="font-medium text-amber-700">{counts.awaiting} awaiting user</span>
            {" · "}
            <span className="text-slate-500">{counts.total} total</span>
          </span>
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            {(["all", "ready", "awaiting_user"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filter === f ? "bg-white text-navy shadow-sm" : "text-slate-600 hover:text-navy"
                }`}
              >
                {f === "all" ? "All" : f === "ready" ? "Ready to approve" : "Awaiting user"}
              </button>
            ))}
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-slate-500">
            {pending.length === 0 ? "No pending transfers." : "No transfers match the selected filter."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left font-semibold text-navy">Ref</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">User</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">Recipient</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">Fee</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">Region</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">OTP Code</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">Expires</th>
                  <th className="px-6 py-3 text-left font-semibold text-navy">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const expired = new Date(p.expires_at) < new Date();
                  const canApprove = !p.awaiting_user && !expired;
                  const canReject = !expired;
                  return (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono text-xs">{p.tx_ref}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold ${
                            p.awaiting_user ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {p.awaiting_user ? "Awaiting user verification" : "Pending admin approval"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {p.user_usercode ? (
                          <Link
                            href={`/admin/users/manage-users/${p.user_usercode}/credentials`}
                            className="text-primary hover:underline font-medium"
                          >
                            {p.user_name || p.user_usercode}
                          </Link>
                        ) : (
                          <p className="font-medium">{p.user_name || "—"}</p>
                        )}
                        <p className="text-slate-500 text-xs">{p.user_email}</p>
                      </td>
                      <td className="px-6 py-4 font-mono">{p.recipient_account}</td>
                      <td className="px-6 py-4">
                        {p.amount.toLocaleString()} {p.currency}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {p.fee_amount > 0 ? `${p.fee_amount.toLocaleString()} ${p.currency}` : "—"}
                      </td>
                      <td className="px-6 py-4 capitalize">{p.tx_region}</td>
                      <td className="px-6 py-4 font-mono font-semibold text-primary">{p.otp_code}</td>
                      <td className={`px-6 py-4 ${expired ? "text-red-600" : "text-slate-600"}`}>
                        {new Date(p.expires_at).toLocaleString()}
                        {expired && " (expired)"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            disabled={!canApprove || approving === p.tx_ref}
                            onClick={() => handleApprove(p.tx_ref)}
                            title={p.awaiting_user ? "Client must enter transfer codes first" : undefined}
                          >
                            {approving === p.tx_ref ? "Approving…" : "Approve"}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={!canReject || rejecting === p.tx_ref}
                            onClick={() => handleReject(p.tx_ref)}
                          >
                            {rejecting === p.tx_ref ? "Rejecting…" : "Reject"}
                          </Button>
                        </div>
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
