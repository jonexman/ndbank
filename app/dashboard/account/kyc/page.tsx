"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, PageHeader, Button, PageLoader } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";

type KycStatus = "none" | "pending" | "approved" | "rejected";

interface KycData {
  kycStatus: KycStatus;
  kycRejectionReason: string | null;
  kycSubmittedAt: string | null;
  documents: Record<string, string> | null;
  hasDocuments: boolean;
}

export default function KycPage() {
  const { userId, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<KycData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [formFiles, setFormFiles] = useState<{ id_doc?: File; address_doc?: File; selfie?: File }>({});

  useEffect(() => {
    if (!userId) {
      if (!isLoading) router.push("/dashboard/signin");
      return;
    }
    fetch("/api/dashboard/kyc")
      .then((r) => {
        if (r.status === 401) {
          router.push("/dashboard/signin");
          return null;
        }
        return r.json();
      })
      .then((d) => d != null && setData(d))
      .catch(() => setData(null));
  }, [userId, isLoading, router]);

  const canSubmit = data?.kycStatus === "none" || data?.kycStatus === "rejected";
  const canResubmit = data?.kycStatus === "rejected";

  const handleFileChange = (key: "id_doc" | "address_doc" | "selfie") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormFiles((f) => ({ ...f, [key]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFiles.id_doc || !formFiles.address_doc || !formFiles.selfie) {
      setError("Please select all three documents");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("id_doc", formFiles.id_doc);
      fd.append("address_doc", formFiles.address_doc);
      fd.append("selfie", formFiles.selfie);
      const res = await fetch("/api/dashboard/kyc", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Upload failed");
        return;
      }
      setFormFiles({});
      setData((prev) =>
        prev
          ? {
              ...prev,
              kycStatus: "pending",
              kycRejectionReason: null,
              kycSubmittedAt: new Date().toISOString(),
              hasDocuments: true,
            }
          : null
      );
    } finally {
      setUploading(false);
    }
  };

  if (!userId && !isLoading) return null;
  if (!data) {
    return (
      <div>
        <PageHeader title="KYC Verification" backHref="/dashboard/account" subtitle="Loading..." />
        <PageLoader message="Loading KYC status" />
      </div>
    );
  }

  const statusConfig: Record<KycStatus, { label: string; icon: string; bg: string; text: string }> = {
    none: { label: "Not Submitted", icon: "📄", bg: "bg-slate-100", text: "text-slate-600" },
    pending: { label: "Under Review", icon: "⏳", bg: "bg-amber-100", text: "text-amber-700" },
    approved: { label: "Verified", icon: "✓", bg: "bg-emerald-100", text: "text-emerald-700" },
    rejected: { label: "Rejected", icon: "✗", bg: "bg-red-100", text: "text-red-700" },
  };
  const cfg = statusConfig[data.kycStatus];

  return (
    <div>
      <PageHeader title="KYC Verification" backHref="/dashboard/account" subtitle="Identity verification status" />
      <Card variant="elevated" className="mb-6">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${cfg.bg} ${cfg.text}`}>
            {cfg.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-navy">{cfg.label}</h3>
            <p className="text-slate-500 mt-1">
              {data.kycStatus === "approved" &&
                "Your identity has been verified. You have full access to all services."}
              {data.kycStatus === "pending" &&
                "Your documents are under review. You will be notified when verification is complete."}
              {data.kycStatus === "rejected" &&
                (data.kycRejectionReason || "Your submission was rejected. Please resubmit valid documents.")}
              {data.kycStatus === "none" &&
                "Submit your identity documents to verify your account and unlock all features."}
            </p>
          </div>
        </div>
      </Card>

      {/* Document requirements */}
      <Card variant="elevated" className="mb-6">
        <h3 className="text-lg font-semibold text-navy mb-4">Required Documents</h3>
        <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
          <li><strong>Government-issued ID</strong> — Passport, driver&apos;s license, or national ID</li>
          <li><strong>Proof of address</strong> — Utility bill, bank statement, or similar (within 3 months)</li>
          <li><strong>Selfie with ID</strong> — Clear photo of you holding your ID</li>
        </ul>
        <p className="mt-3 text-xs text-slate-500">Accepted: JPEG, PNG, WebP, PDF. Max 5MB per file.</p>
      </Card>

      {/* Upload form */}
      {canSubmit && (
        <Card variant="elevated">
          <h3 className="text-lg font-semibold text-navy mb-4">
            {canResubmit ? "Resubmit Documents" : "Submit Documents"}
          </h3>
          {error && <div className="form-alert-error mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Government-issued ID *</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange("id_doc")}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Proof of address *</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange("address_doc")}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Selfie with ID *</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange("selfie")}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium"
              />
            </div>
            <Button type="submit" fullWidth disabled={uploading}>
              {uploading ? "Uploading…" : "Submit for Verification"}
            </Button>
          </form>
        </Card>
      )}

      {/* View submitted documents (own user) */}
      {data.hasDocuments && data.documents && !canSubmit && (
        <Card variant="elevated" className="mt-6">
          <h3 className="text-lg font-semibold text-navy mb-4">Submitted Documents</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {Object.entries(data.documents).map(([key, url]) => (
              <div key={key} className="space-y-2">
                <p className="text-sm font-medium text-slate-600 capitalize">
                  {key.replace(/_/g, " ")}
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg border border-slate-200 bg-slate-50 text-primary text-sm font-medium hover:bg-slate-100"
                >
                  View document →
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
