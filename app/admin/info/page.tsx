"use client";

import { useEffect, useState } from "react";
import { Card, PageHeader } from "@/components/ui";

export default function AdminInfoPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/admin/info")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div>
        <PageHeader title="Server Info" backHref="/admin" subtitle="Loading..." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Server / System Info" backHref="/admin" subtitle="Mock server information" />
      <div className="space-y-6">
        <Card>
          <h3 className="text-lg font-semibold text-navy mb-4">Runtime</h3>
          <dl className="grid sm:grid-cols-2 gap-3">
            <div>
              <dt className="text-sm text-gray-500">Server</dt>
              <dd className="font-medium">{String(data.server ?? "-")}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Node Version</dt>
              <dd className="font-mono text-sm">{String(data.nodeVersion ?? "-")}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Platform</dt>
              <dd className="font-medium">{String(data.platform ?? "-")}</dd>
            </div>
            {data.env != null && typeof data.env === "object" ? (
              <div>
                <dt className="text-sm text-gray-500">NODE_ENV</dt>
                <dd className="font-medium">{String((data.env as Record<string, string>).nodeEnv ?? "-")}</dd>
              </div>
            ) : null}
          </dl>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-navy mb-4">Paths</h3>
          <dl className="space-y-3">
            {data.paths != null && typeof data.paths === "object"
              ? Object.entries(data.paths as Record<string, string>).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-sm text-gray-500">{k}</dt>
                    <dd className="font-mono text-sm break-all">{v}</dd>
                  </div>
                ))
              : null}
          </dl>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-navy mb-4">DB Config (Mock)</h3>
          <pre className="text-sm bg-gray-50 p-4 rounded-xl overflow-x-auto">
            {JSON.stringify((data.config as { db?: object })?.db ?? {}, null, 2)}
          </pre>
        </Card>
      </div>
    </div>
  );
}
