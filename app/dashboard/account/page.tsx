"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, PageHeader, PageLoader } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AccountProfilePage() {
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
        <PageHeader title="Profile" backHref="/dashboard" subtitle="Loading..." />
        <PageLoader message="Loading profile" />
      </div>
    );
  }

  const { user, profile = {} } = data;
  const p = profile as { bio?: string; address?: string; city?: string; country?: string; phone?: string; nok_name?: string; nok_phone?: string; nok_relationship?: string };

  return (
    <div>
      <PageHeader title="Account Profile" backHref="/dashboard" subtitle="Your personal and bank information" />
      <div className="grid gap-6 md:grid-cols-2">
        <Card variant="elevated">
          <h3 className="text-lg font-semibold text-navy font-heading mb-4">Personal Info</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-slate-500">Full Name</dt>
              <dd className="font-medium">{user.firstname} {user.lastname}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            {p.phone && (
              <div>
                <dt className="text-sm text-slate-500">Phone</dt>
                <dd className="font-medium">{p.phone}</dd>
              </div>
            )}
            {p.bio && (
              <div>
                <dt className="text-sm text-slate-500">Bio</dt>
                <dd className="font-medium">{p.bio}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card variant="elevated">
          <h3 className="text-lg font-semibold text-navy font-heading mb-4">Address</h3>
          <dl className="space-y-3">
            {p.address && (
              <div>
                <dt className="text-sm text-slate-500">Address</dt>
                <dd className="font-medium">{p.address}</dd>
              </div>
            )}
            {(p.city || p.country) && (
              <div>
                <dt className="text-sm text-slate-500">City / Country</dt>
                <dd className="font-medium">{[p.city, p.country].filter(Boolean).join(", ")}</dd>
              </div>
            )}
          </dl>
          {!p.address && !p.city && !p.country && (
            <p className="text-sm text-slate-500">No address on file.</p>
          )}
        </Card>

        <Card variant="elevated">
          <h3 className="text-lg font-semibold text-navy font-heading mb-4">Next of Kin (NOK)</h3>
          <dl className="space-y-3">
            {p.nok_name && (
              <>
                <div>
                  <dt className="text-sm text-slate-500">Name</dt>
                  <dd className="font-medium">{p.nok_name}</dd>
                </div>
                {p.nok_phone && (
                  <div>
                    <dt className="text-sm text-slate-500">Phone</dt>
                    <dd className="font-medium">{p.nok_phone}</dd>
                  </div>
                )}
                {p.nok_relationship && (
                  <div>
                    <dt className="text-sm text-slate-500">Relationship</dt>
                    <dd className="font-medium">{p.nok_relationship}</dd>
                  </div>
                )}
              </>
            )}
            {!p.nok_name && <p className="text-sm text-slate-500">No next of kin on file.</p>}
          </dl>
        </Card>

        <Card variant="elevated">
          <h3 className="text-lg font-semibold text-navy font-heading mb-4">Bank Info</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-slate-500">Account Number</dt>
              <dd className="font-mono font-medium">{user.bank_number}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Balance</dt>
              <dd className="font-medium">{user.currency} {user.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Verification</dt>
              <dd>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${user.verified ? "bg-success-light text-success-dark" : "bg-amber-100 text-amber-700"}`}>
                  {user.verified ? "Verified" : "Pending"}
                </span>
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
