"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, Card, PageLoader, CardSkeleton } from "@/components/ui";

interface KycUser {
  id: string;
  usercode: string | null;
  email: string;
  full_name: string;
  bank_number: string | null;
  verified: boolean;
  kyc_submitted_at: string | null;
  kyc_rejection_reason: string | null;
}

export default function AdminKycPage() {
  const [pending, setPending] = useState<KycUser[]>([]);
  const [rejected, setRejected] = useState<KycUser[]>([]);
  const [notSubmitted, setNotSubmitted] = useState<KycUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/kyc")
      .then((r) => r.json())
      .then((d) => {
        setPending(d.pending ?? []);
        setRejected(d.rejected ?? []);
        setNotSubmitted(d.notSubmitted ?? []);
      })
      .catch(() => {
        setPending([]);
        setRejected([]);
        setNotSubmitted([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="KYC Verification" subtitle="Loading..." />
        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="mt-6 flex justify-center">
          <PageLoader message="Loading KYC requests" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="KYC Verification"
        subtitle="Review and approve identity verification requests"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Pending ({pending.length})
          </h3>
          {pending.length === 0 ? (
            <p className="text-gray-500">No pending KYC requests</p>
          ) : (
            <ul className="space-y-3">
              {pending.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100"
                >
                  <div>
                    <p className="font-medium text-navy">{u.full_name}</p>
                    <p className="text-sm text-gray-600">{u.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {u.kyc_submitted_at
                        ? `Submitted ${new Date(u.kyc_submitted_at).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                  <Link
                    href={`/admin/users/manage-users/${u.usercode ?? u.id}/credentials`}
                    className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5"
                  >
                    Review →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Rejected ({rejected.length})
          </h3>
          {rejected.length === 0 ? (
            <p className="text-gray-500">No rejected KYC submissions</p>
          ) : (
            <ul className="space-y-3">
              {rejected.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100"
                >
                  <div>
                    <p className="font-medium text-navy">{u.full_name}</p>
                    <p className="text-sm text-gray-600">{u.email}</p>
                    {u.kyc_rejection_reason && (
                      <p className="text-xs text-red-600 mt-1">{u.kyc_rejection_reason}</p>
                    )}
                  </div>
                  <Link
                    href={`/admin/users/manage-users/${u.usercode ?? u.id}/credentials`}
                    className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5"
                  >
                    View →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Not Submitted ({notSubmitted.length})
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Users who have not yet submitted KYC documents. You can view their profile and KYC status.
          </p>
          {notSubmitted.length === 0 ? (
            <p className="text-gray-500">All users have submitted KYC or have a verification status</p>
          ) : (
            <ul className="space-y-3">
              {notSubmitted.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div>
                    <p className="font-medium text-navy">{u.full_name}</p>
                    <p className="text-sm text-gray-600">{u.email}</p>
                  </div>
                  <Link
                    href={`/admin/users/manage-users/${u.usercode ?? u.id}/credentials`}
                    className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5"
                  >
                    View KYC →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
