"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, Button, PageHeader, Input, Spinner } from "@/components/ui";

interface CredentialData {
  user: {
    id: number;
    usercode: string;
    firstname: string;
    lastname: string;
    bankNumber: string;
    canTransfer: boolean;
    verified: boolean;
  };
  meta: {
    accountType: string;
    kycDocument: string | null;
    kycStatus?: string;
    kycRejectionReason?: string | null;
    kycDocuments?: Record<string, string> | null;
  };
  currencies: Array<{ code: string; name: string; symbol: string }>;
  balances: Array<{ code: string; name: string; symbol: string; balance: number }>;
  pendingTransfers?: Array<{ tx_ref: string; otp_code: string | null; recipient_account: string; amount: number; currency: string; tx_region: string; expires_at: string }>;
}

export default function CredentialsPage() {
  const params = useParams();
  const usercode = params.usercode as string;
  const [data, setData] = useState<CredentialData | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [activateTransfer, setActivateTransfer] = useState(false);
  const [verifyAccount, setVerifyAccount] = useState(false);
  const [transferCodes, setTransferCodes] = useState<Array<{ id: string; code_type: string; sort_order: number }>>([]);
  const [tcLoading, setTcLoading] = useState(false);
  const [tcAction, setTcAction] = useState<"add" | null>(null);
  const [tcNewType, setTcNewType] = useState("");
  const [tcNewValue, setTcNewValue] = useState("");
  const [tcEditId, setTcEditId] = useState<string | null>(null);
  const [tcEditValue, setTcEditValue] = useState("");

  const [kycRejectReason, setKycRejectReason] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const refetchTransferCodes = () => {
    fetch(`/api/admin/users/${usercode}/transfer-codes`)
      .then((r) => r.json())
      .then((d) => setTransferCodes(d.codes ?? []))
      .catch(() => setTransferCodes([]));
  };

  const handleTcCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!tcNewType.trim() || !tcNewValue || tcNewValue.length < 4) {
      setStatus({ type: "error", msg: "Code type and value (min 4 chars) required" });
      return;
    }
    fetch(`/api/admin/users/${usercode}/transfer-codes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", code_type: tcNewType.trim(), value: tcNewValue }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStatus({ type: "success", msg: "Transfer code added" });
          setTcNewType("");
          setTcNewValue("");
          setTcAction(null);
          refetchTransferCodes();
        } else setStatus({ type: "error", msg: d.error ?? "Failed" });
      })
      .catch(() => setStatus({ type: "error", msg: "Request failed" }));
  };

  const handleTcUpdate = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!tcEditValue || tcEditValue.length < 4) {
      setStatus({ type: "error", msg: "Code value must be at least 4 characters" });
      return;
    }
    setStatus(null);
    fetch(`/api/admin/users/${usercode}/transfer-codes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, value: tcEditValue }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStatus({ type: "success", msg: "Code updated" });
          setTcEditId(null);
          setTcEditValue("");
          refetchTransferCodes();
        } else setStatus({ type: "error", msg: d.error ?? "Failed" });
      })
      .catch(() => setStatus({ type: "error", msg: "Request failed" }));
  };

  const handleTcDelete = (id: string) => {
    if (!confirm("Delete this transfer code?")) return;
    setStatus(null);
    fetch(`/api/admin/users/${usercode}/transfer-codes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStatus({ type: "success", msg: "Code deleted" });
          refetchTransferCodes();
        } else setStatus({ type: "error", msg: d.error ?? "Failed" });
      })
      .catch(() => setStatus({ type: "error", msg: "Request failed" }));
  };

  const handleTcReorder = (fromIdx: number, direction: "up" | "down") => {
    const sorted = [...transferCodes].sort((a, b) => a.sort_order - b.sort_order);
    const toIdx = direction === "up" ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= sorted.length) return;
    const order = sorted.map((c) => ({ id: c.id }));
    [order[fromIdx], order[toIdx]] = [order[toIdx], order[fromIdx]];
    fetch(`/api/admin/users/${usercode}/transfer-codes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", order }),
    })
      .then((r) => r.json())
      .then((d) => d.success && refetchTransferCodes())
      .catch(() => {});
  };

  useEffect(() => {
    fetch(`/api/admin/users/${usercode}/credentials`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setData(null);
          return;
        }
        setData(d);
        setActivateTransfer(d.user?.canTransfer ?? false);
        setVerifyAccount(d.user?.verified ?? false);
      })
      .catch(() => setData(null));
  }, [usercode]);

  useEffect(() => {
    if (!usercode) return;
    setTcLoading(true);
    fetch(`/api/admin/users/${usercode}/transfer-codes`)
      .then((r) => r.json())
      .then((d) => setTransferCodes(d.codes ?? []))
      .catch(() => setTransferCodes([]))
      .finally(() => setTcLoading(false));
  }, [usercode]);

  const handleModify = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    fetch(`/api/admin/users/${usercode}/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "modify",
        canTransfer: activateTransfer,
        verified: verifyAccount,
      }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setStatus({ type: "success", msg: "Banking settings updated" });
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  user: { ...prev.user, canTransfer: activateTransfer, verified: verifyAccount },
                  meta: { ...prev.meta },
                }
              : null
          );
        } else {
          setStatus({ type: "error", msg: json.error ?? "Update failed" });
        }
      })
      .catch(() => setStatus({ type: "error", msg: "Request failed" }));
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", msg: "Passwords do not match" });
      return;
    }
    if (newPassword.length < 6) {
      setStatus({ type: "error", msg: "Password must be at least 6 characters" });
      return;
    }
    setStatus(null);
    fetch(`/api/admin/users/${usercode}/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset_password", password: newPassword }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setStatus({ type: "success", msg: json.message });
          setNewPassword("");
          setConfirmPassword("");
        } else {
          setStatus({ type: "error", msg: json.error ?? "Password reset failed" });
        }
      })
      .catch(() => setStatus({ type: "error", msg: "Request failed" }));
  };

  const handleResetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      setStatus({ type: "error", msg: "PINs do not match" });
      return;
    }
    if (newPin.length < 4 || newPin.length > 6 || !/^\d+$/.test(newPin)) {
      setStatus({ type: "error", msg: "PIN must be 4–6 digits" });
      return;
    }
    setStatus(null);
    fetch(`/api/admin/users/${usercode}/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset_pin", pin: newPin }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setStatus({ type: "success", msg: json.message });
          setNewPin("");
          setConfirmPin("");
        } else {
          setStatus({ type: "error", msg: json.error ?? "PIN reset failed" });
        }
      })
      .catch(() => setStatus({ type: "error", msg: "Request failed" }));
  };

  const handleKycAction = (action: "approve" | "reject") => {
    setStatus(null);
    fetch(`/api/admin/users/${usercode}/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "kyc", kycAction: action, reason: action === "reject" ? kycRejectReason : undefined }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setStatus({ type: "success", msg: json.message });
          setVerifyAccount(action === "approve");
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  user: { ...prev.user, verified: action === "approve" },
                  meta: {
                    ...prev.meta,
                    kycStatus: action === "approve" ? "approved" : "rejected",
                    kycRejectionReason: action === "reject" ? kycRejectReason : null,
                  },
                }
              : null
          );
          setKycRejectReason("");
        } else {
          setStatus({ type: "error", msg: json.error ?? "KYC action failed" });
        }
      })
      .catch(() => setStatus({ type: "error", msg: "Request failed" }));
  };

  if (!data) {
    return (
      <div>
        <PageHeader title="Banking Credentials" backHref="/admin/users" subtitle="Loading or user not found." />
      </div>
    );
  }

  const kycStatus = data.meta?.kycStatus ?? "none";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <PageHeader
          title="Banking Credentials"
          backHref="/admin/users"
          subtitle={`${data.user.usercode} — ${data.user.firstname} ${data.user.lastname}`}
        />
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/users/manage-users/${usercode}/activity`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <span>Activity</span>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href={`/admin/users/manage-users/${usercode}/accounts`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <span>Manage accounts</span>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href={`/admin/users/${usercode}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary bg-primary/5 border border-primary/30 rounded-xl hover:bg-primary/10 transition-colors"
          >
            Edit profile
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Pending transfers */}
      {data.pendingTransfers && data.pendingTransfers.length > 0 && (
        <Card className="p-6 border-primary/20 bg-primary/5">
          <h3 className="text-base font-semibold text-navy mb-3">Pending transfers</h3>
          <p className="text-sm text-slate-600 mb-4">Client must enter their transfer codes to complete. If they don&apos;t have the codes, share them from the Transfer Codes section below.</p>
          <div className="space-y-3">
            {data.pendingTransfers.map((pt) => (
              <div key={pt.tx_ref} className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-white border border-slate-200">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-500">Ref: <span className="font-mono">{pt.tx_ref}</span></p>
                  <p className="text-sm text-slate-500">{pt.amount} {pt.currency} → {pt.recipient_account}</p>
                  <p className="text-xs text-slate-400">Expires {new Date(pt.expires_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/admin/finance/pending-transfers"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:underline"
          >
            View all pending transfers →
          </Link>
        </Card>
      )}

      {status && (
        <div
          className={`p-4 rounded-xl text-sm ${
            status.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {status.msg}
        </div>
      )}

      {/* User summary bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
              <span className="text-2xl text-navy/60 font-heading font-semibold">
                {data.user.firstname[0]}
                {data.user.lastname[0]}
              </span>
            </div>
            <div>
              <p className="font-semibold text-navy">
                {data.user.firstname} {data.user.lastname}
              </p>
              <p className="text-sm text-slate-500 font-mono">{data.user.bankNumber}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                data.user.verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {data.user.verified ? "Verified" : "Not verified"}
            </span>
            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${activateTransfer ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
              Transfer {activateTransfer ? "On" : "Off"}
            </span>
          </div>
          {data.balances && data.balances.length > 0 && (
            <div className="flex gap-4 ml-auto border-l border-slate-200 pl-6">
              {data.balances.slice(0, 3).map((b) => (
                <div key={b.code} className="text-sm">
                  <p className="text-slate-500">{b.code}</p>
                  <p className="font-semibold text-navy">{b.symbol} {Number(b.balance).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Banking settings */}
        <Card className="p-6">
          <h3 className="text-base font-semibold text-navy mb-4">Banking settings</h3>
          <form onSubmit={handleModify} className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={activateTransfer}
                  onChange={(e) => setActivateTransfer(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <div>
                  <span className="block text-sm font-medium text-navy">Activate transfer</span>
                  <span className="block text-xs text-slate-500">Allow user to send money</span>
                </div>
              </label>
            </div>
            <Button type="submit" className="w-full">
              Save banking settings
            </Button>
          </form>
        </Card>

        {/* Transfer codes (admin-set) */}
        <Card className="p-6">
          <h3 className="text-base font-semibold text-navy mb-1">Transfer codes</h3>
          <p className="text-xs text-slate-500 mb-4">
            Codes required during transfer. User must enter these or contact you to obtain them.
          </p>
          {tcAction === "add" ? (
            <form onSubmit={handleTcCreate} className="space-y-3 mb-4">
              <Input
                label="Code type (OTP, COT, IMF, TAX, etc.)"
                value={tcNewType}
                onChange={(e) => setTcNewType(e.target.value.toUpperCase().replace(/\s+/g, "_"))}
                placeholder="OTP"
              />
              <Input
                label="Code value"
                type="password"
                value={tcNewValue}
                onChange={(e) => setTcNewValue(e.target.value)}
                placeholder="User's code"
              />
              <div className="flex gap-2">
                <Button type="submit">Add</Button>
                <Button type="button" variant="secondary" onClick={() => { setTcAction(null); setTcNewType(""); setTcNewValue(""); }}>Cancel</Button>
              </div>
            </form>
          ) : (
            <Button onClick={() => setTcAction("add")} variant="secondary" size="sm" className="mb-4">Add transfer code</Button>
          )}
          {tcLoading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Spinner size="sm" />
              Loading...
            </div>
          ) : transferCodes.length === 0 ? (
            <p className="text-sm text-slate-500">No transfer codes. Add one to require codes during transfers.</p>
          ) : (
            <div className="space-y-2">
              {[...transferCodes].sort((a, b) => a.sort_order - b.sort_order).map((c, idx) => (
                <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex flex-col">
                    <button type="button" onClick={() => handleTcReorder(idx, "up")} disabled={idx === 0} className="text-slate-400 hover:text-navy disabled:opacity-30">↑</button>
                    <button type="button" onClick={() => handleTcReorder(idx, "down")} disabled={idx === transferCodes.length - 1} className="text-slate-400 hover:text-navy disabled:opacity-30">↓</button>
                  </div>
                  <span className="font-mono font-semibold text-navy w-16">{c.code_type}</span>
                  {tcEditId === c.id ? (
                    <form onSubmit={(e) => handleTcUpdate(e, c.id)} className="flex-1 flex items-center gap-2">
                      <Input type="password" value={tcEditValue} onChange={(e) => setTcEditValue(e.target.value)} placeholder="New value" />
                      <Button type="submit" size="sm">Save</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => { setTcEditId(null); setTcEditValue(""); }}>Cancel</Button>
                    </form>
                  ) : (
                    <>
                      <span className="text-slate-400 flex-1">••••</span>
                      <Button variant="ghost" size="sm" onClick={() => { setTcEditId(c.id); setTcEditValue(""); }}>Change</Button>
                      <button type="button" onClick={() => handleTcDelete(c.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* KYC verification */}
        <Card className="p-6">
          <h3 className="text-base font-semibold text-navy mb-4">KYC verification</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold uppercase ${
                  kycStatus === "approved"
                    ? "bg-emerald-100 text-emerald-700"
                    : kycStatus === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : kycStatus === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-600"
                }`}
              >
                {kycStatus}
              </span>
              {data.meta?.kycRejectionReason && (
                <p className="text-sm text-red-600">{data.meta.kycRejectionReason}</p>
              )}
            </div>

            {data.meta?.kycDocuments && Object.keys(data.meta.kycDocuments).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(data.meta.kycDocuments).map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-primary text-sm font-medium transition-colors"
                  >
                    View {key.replace(/_/g, " ")} →
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-2">No KYC documents uploaded</p>
            )}

            {(kycStatus === "pending" || kycStatus === "none") && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                {kycStatus === "none" && (
                  <p className="text-sm text-slate-500">No documents uploaded. You can approve KYC manually (e.g. verified via other means) or reject.</p>
                )}
                <Input
                  label="Rejection reason (optional)"
                  value={kycRejectReason}
                  onChange={(e) => setKycRejectReason(e.target.value)}
                  placeholder={kycStatus === "none" ? "e.g. Identity verified via other means" : "e.g. ID document unclear"}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleKycAction("approve")}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKycAction("reject")}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Security: Reset password & PIN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-base font-semibold text-navy mb-4">Reset password</h3>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
            />
            <Input
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••"
            />
            <Button type="submit" variant="secondary" className="w-full">
              Reset password
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="text-base font-semibold text-navy mb-4">Reset PIN</h3>
          <form onSubmit={handleResetPin} className="space-y-4">
            <Input
              label="New PIN"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              placeholder="4–6 digits"
            />
            <Input
              label="Confirm PIN"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
            />
            <Button type="submit" variant="secondary" className="w-full">
              Reset PIN
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
