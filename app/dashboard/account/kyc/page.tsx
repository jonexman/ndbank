"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("accountKyc");
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
      setError(t("selectAllDocs"));
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
        setError(json.error ?? t("uploadFailed"));
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
        <PageHeader title={t("title")} backHref="/dashboard/account" subtitle={t("loading")} />
        <PageLoader message={t("loadingKyc")} />
      </div>
    );
  }

  const statusConfig: Record<KycStatus, { label: string; icon: string; bg: string; text: string }> = {
    none: { label: t("notSubmitted"), icon: "📄", bg: "bg-slate-100", text: "text-slate-600" },
    pending: { label: t("underReview"), icon: "⏳", bg: "bg-amber-100", text: "text-amber-700" },
    approved: { label: t("verified"), icon: "✓", bg: "bg-emerald-100", text: "text-emerald-700" },
    rejected: { label: t("rejected"), icon: "✗", bg: "bg-red-100", text: "text-red-700" },
  };
  const cfg = statusConfig[data.kycStatus];

  return (
    <div>
      <PageHeader title={t("title")} backHref="/dashboard/account" subtitle={t("subtitle")} />
      <Card variant="elevated" className="mb-6">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${cfg.bg} ${cfg.text}`}>
            {cfg.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-navy">{cfg.label}</h3>
            <p className="text-slate-500 mt-1">
              {data.kycStatus === "approved" && t("verifiedMessage")}
              {data.kycStatus === "pending" && t("pendingMessage")}
              {data.kycStatus === "rejected" &&
                (data.kycRejectionReason || t("rejectedDefault"))}
              {data.kycStatus === "none" && t("noneMessage")}
            </p>
          </div>
        </div>
      </Card>

      {/* Document requirements */}
      <Card variant="elevated" className="mb-6">
        <h3 className="text-lg font-semibold text-navy mb-4">{t("requiredDocs")}</h3>
        <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
          <li><strong>{t("govId")}</strong> — {t("govIdDesc")}</li>
          <li><strong>{t("proofOfAddress")}</strong> — {t("proofOfAddressDesc")}</li>
          <li><strong>{t("selfieWithId")}</strong> — {t("selfieWithIdDesc")}</li>
        </ul>
        <p className="mt-3 text-xs text-slate-500">{t("acceptedFormats")}</p>
      </Card>

      {/* Upload form */}
      {canSubmit && (
        <Card variant="elevated">
          <h3 className="text-lg font-semibold text-navy mb-4">
            {canResubmit ? t("resubmitDocs") : t("submitDocs")}
          </h3>
          {error && <div className="form-alert-error mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t("govIdLabel")}</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange("id_doc")}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t("proofOfAddressLabel")}</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange("address_doc")}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t("selfieLabel")}</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange("selfie")}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium"
              />
            </div>
            <Button type="submit" fullWidth disabled={uploading}>
              {uploading ? t("uploading") : t("submitForVerification")}
            </Button>
          </form>
        </Card>
      )}

      {/* View submitted documents (own user) */}
      {data.hasDocuments && data.documents && !canSubmit && (
        <Card variant="elevated" className="mt-6">
          <h3 className="text-lg font-semibold text-navy mb-4">{t("submittedDocs")}</h3>
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
                  {t("viewDocument")}
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
