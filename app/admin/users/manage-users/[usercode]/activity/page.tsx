"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader, Card, DataTable, TableSkeleton } from "@/components/ui";

interface ActivityRow {
  id: string;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export default function UserActivityPage() {
  const params = useParams();
  const usercode = params.usercode as string;
  const [data, setData] = useState<{ user?: { usercode: string; full_name: string }; activity: ActivityRow[] } | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    setData(null);
    setForbidden(false);
    fetch(`/api/admin/users/${usercode}/activity`)
      .then(async (r) => {
        const d = await r.json();
        return { ...d, _status: r.status };
      })
      .then((d) => {
        if (d.error) {
          setData(null);
          setForbidden(d._status === 403);
        } else setData({ user: d.user, activity: d.activity ?? [] });
      })
      .catch(() => setData(null));
  }, [usercode]);

  if (!data) {
    return (
      <div>
        <PageHeader
          title="Login Activity"
          backHref="/admin/users"
          subtitle={
            forbidden
              ? "You don't have permission to view this user."
              : "Loading..."
          }
        />
        {!forbidden && <TableSkeleton rows={10} cols={4} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Login Activity"
          backHref="/admin/users"
          subtitle={data.user ? `${data.user.usercode} — ${data.user.full_name}` : usercode}
        />
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/users/manage-users/${usercode}/credentials`}
            className="inline-flex px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Credentials
          </Link>
          <Link
            href={`/admin/users/manage-users/${usercode}/transactions`}
            className="inline-flex px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Transactions
          </Link>
          <Link
            href={`/admin/users/manage-users/${usercode}/accounts`}
            className="inline-flex px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Accounts
          </Link>
          <Link
            href={`/admin/users/${usercode}/edit`}
            className="inline-flex px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Edit
          </Link>
        </div>
      </div>

      <Card>
        <p className="text-sm text-slate-600 mb-4">
          Login and logout events with IP address. Last 100 entries.
        </p>
        {data.activity.length === 0 ? (
          <p className="py-12 text-center text-slate-500">No activity recorded yet.</p>
        ) : (
          <DataTable
            striped
            columns={[
              {
                key: "event_type",
                header: "Event",
                render: (r) => (
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      r.event_type === "login" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {r.event_type}
                  </span>
                ),
              },
              {
                key: "ip_address",
                header: "IP Address",
                render: (r) => r.ip_address ?? "—",
              },
              {
                key: "created_at",
                header: "When",
                render: (r) => new Date(r.created_at).toLocaleString(),
              },
              {
                key: "user_agent",
                header: "User Agent",
                render: (r) => (
                  <span className="text-slate-600 max-w-[240px] truncate block" title={r.user_agent ?? ""}>
                    {r.user_agent ?? "—"}
                  </span>
                ),
              },
            ]}
            data={data.activity}
            keyExtractor={(r) => r.id}
            emptyMessage="No activity."
          />
        )}
      </Card>
    </div>
  );
}
