"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, PageHeader, PageLoader } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AccountProfilePage() {
  const t = useTranslations("accountProfile");
  const { userId, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<{
    user?: { firstname: string; lastname: string; email: string; bank_number: string; balance: number; currency: string; verified: boolean };
    profile?: { bio?: string; address?: string; city?: string; country?: string; phone?: string; nok_name?: string; nok_phone?: string; nok_relationship?: string; verified?: boolean };
  } | null>(null);

  useEffect(() => {
    if (!userId) {
      if (!isLoading) router.push("/dashboard/signin");
      return;
    }
    fetch("/api/dashboard/account")
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

  if (!userId && !isLoading) return null;
  if (!data?.user) {
    return (
      <div>
        <PageHeader title={t("profile")} backHref="/dashboard" subtitle={t("loading")} />
        <PageLoader message={t("loadingProfile")} />
      </div>
    );
  }

  const { user, profile = {} } = data;
  const p = profile as { bio?: string; address?: string; city?: string; country?: string; phone?: string; nok_name?: string; nok_phone?: string; nok_relationship?: string };

  const completenessFields: { key: string; label: string; filled: boolean }[] = [
    { key: "phone", label: t("phone"), filled: !!p.phone },
    { key: "address", label: t("address"), filled: !!(p.address || p.city || p.country) },
    { key: "nok", label: t("nok"), filled: !!(p.nok_name || p.nok_phone) },
  ];
  const filledCount = completenessFields.filter((f) => f.filled).length;
  const totalCount = completenessFields.length;
  const completenessPercent = totalCount ? Math.round((filledCount / totalCount) * 100) : 100;
  const missing = completenessFields.filter((f) => !f.filled).map((f) => f.label);

  return (
    <div>
      <PageHeader title={t("title")} backHref="/dashboard" subtitle={t("subtitle")} />
      {missing.length > 0 && (
        <Card variant="elevated" className="mb-6 border-primary/20 bg-primary/5">
          <h3 className="text-sm font-semibold text-navy font-heading mb-2">{t("profileCompleteness")}</h3>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${completenessPercent}%` }}
              />
            </div>
            <span className="text-sm font-medium text-slate-600">{completenessPercent}%</span>
          </div>
          <p className="text-sm text-slate-600 mb-1">{t("completeProfile")}</p>
          <p className="text-xs text-slate-500">
            {t("missingFields")}: {missing.join(", ")}
          </p>
        </Card>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        <Card variant="elevated">
          <h3 className="text-lg font-semibold text-navy font-heading mb-4">{t("personalInfo")}</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-slate-500">{t("fullName")}</dt>
              <dd className="font-medium">{user.firstname} {user.lastname}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">{t("email")}</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            {p.phone && (
              <div>
                <dt className="text-sm text-slate-500">{t("phone")}</dt>
                <dd className="font-medium">{p.phone}</dd>
              </div>
            )}
            {p.bio && (
              <div>
                <dt className="text-sm text-slate-500">{t("bio")}</dt>
                <dd className="font-medium">{p.bio}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card variant="elevated">
          <h3 className="text-lg font-semibold text-navy font-heading mb-4">{t("addressSection")}</h3>
          <dl className="space-y-3">
            {p.address && (
              <div>
                <dt className="text-sm text-slate-500">{t("address")}</dt>
                <dd className="font-medium">{p.address}</dd>
              </div>
            )}
            {(p.city || p.country) && (
              <div>
                <dt className="text-sm text-slate-500">{t("cityCountry")}</dt>
                <dd className="font-medium">{[p.city, p.country].filter(Boolean).join(", ")}</dd>
              </div>
            )}
          </dl>
          {!p.address && !p.city && !p.country && (
            <p className="text-sm text-slate-500">{t("noAddress")}</p>
          )}
        </Card>

        <Card variant="elevated">
          <h3 className="text-lg font-semibold text-navy font-heading mb-4">{t("nok")}</h3>
          <dl className="space-y-3">
            {p.nok_name && (
              <>
                <div>
                  <dt className="text-sm text-slate-500">{t("name")}</dt>
                  <dd className="font-medium">{p.nok_name}</dd>
                </div>
                {p.nok_phone && (
                  <div>
                    <dt className="text-sm text-slate-500">{t("phone")}</dt>
                    <dd className="font-medium">{p.nok_phone}</dd>
                  </div>
                )}
                {p.nok_relationship && (
                  <div>
                    <dt className="text-sm text-slate-500">{t("relationship")}</dt>
                    <dd className="font-medium">{p.nok_relationship}</dd>
                  </div>
                )}
              </>
            )}
            {!p.nok_name && <p className="text-sm text-slate-500">{t("noNok")}</p>}
          </dl>
        </Card>

        <Card variant="elevated">
          <h3 className="text-lg font-semibold text-navy font-heading mb-4">{t("bankInfo")}</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-slate-500">{t("accountNumber")}</dt>
              <dd className="font-mono font-medium">{user.bank_number}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">{t("balance")}</dt>
              <dd className="font-medium">{user.currency} {user.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">{t("verification")}</dt>
              <dd>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${user.verified ? "bg-success-light text-success-dark" : "bg-amber-100 text-amber-700"}`}>
                  {user.verified ? t("verified") : t("pending")}
                </span>
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
