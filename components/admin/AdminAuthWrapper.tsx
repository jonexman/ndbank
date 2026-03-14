"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Spinner } from "@/components/ui";

export function AdminAuthWrapper({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => {
        if (r.status === 401) {
          setAllowed(false);
          return;
        }
        setAllowed(true);
      })
      .catch(() => setAllowed(false));
  }, []);

  if (allowed === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-navy mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need administrator privileges to access this area.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (allowed === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <Spinner size="lg" />
        <p className="text-slate-600 font-medium">Checking access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
