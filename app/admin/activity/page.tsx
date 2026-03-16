"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, PageHeader, DataTable, TableSkeleton } from "@/components/ui";
import type { ActivityRow } from "@/app/api/admin/activity/route";

const EVENT_OPTIONS = [
  { value: "", label: "All events" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "login_failed", label: "Login failed" },
];

const PAGE_SIZE = 50;

export default function AdminActivityPage() {
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = (eventType: string, off: number, append: boolean) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(off) });
    if (eventType) params.set("event_type", eventType);
    fetch(`/api/admin/activity?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          if (!append) setActivity([]);
        } else {
          setActivity(append ? (prev) => [...prev, ...(d.activity ?? [])] : (d.activity ?? []));
          setTotal(d.total ?? 0);
        }
      })
      .catch(() => {
        setError("Failed to load activity");
        if (!append) setActivity([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setOffset(0);
    load(eventFilter, 0, false);
  }, [eventFilter]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEventFilter(e.target.value);
    setOffset(0);
  };

  const loadMore = () => {
    const next = offset + PAGE_SIZE;
    setOffset(next);
    load(eventFilter, next, true);
  };

  const hasMore = activity.length < total;

  function userCell(r: ActivityRow) {
    const u = r.users;
    const name = u?.usercode ?? u?.email ?? r.attempted_identifier ?? "—";
    if (u?.usercode) {
      return (
        <Link
          href={`/admin/users/manage-users/${u.usercode}/activity`}
          className="text-primary font-medium hover:underline"
        >
          {u.usercode}
        </Link>
      );
    }
    return <span className="text-slate-600">{name}</span>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        backHref="/admin"
        subtitle="Login and logout events across all users. Failed attempts show the identifier used."
      />
      <Card>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            Event type
            <select
              value={eventFilter}
              onChange={handleFilterChange}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {EVENT_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <span className="text-sm text-slate-500">
            {total} {total === 1 ? "entry" : "entries"}
          </span>
        </div>
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        {loading && activity.length === 0 ? (
          <TableSkeleton rows={10} cols={5} />
        ) : (
          <>
            <DataTable
              striped
              columns={[
                {
                  key: "created_at",
                  header: "When",
                  render: (r) => new Date(r.created_at).toLocaleString(),
                },
                {
                  key: "event_type",
                  header: "Event",
                  render: (r) => {
                    const style =
                      r.event_type === "login"
                        ? "bg-emerald-100 text-emerald-800"
                        : r.event_type === "login_failed"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700";
                    const label =
                      r.event_type === "login_failed" ? "Login failed" : r.event_type;
                    return (
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${style}`}>
                        {label}
                      </span>
                    );
                  },
                },
                { key: "user", header: "User / Identifier", render: userCell },
                {
                  key: "ip_address",
                  header: "IP Address",
                  render: (r) => r.ip_address ?? "—",
                },
                {
                  key: "user_agent",
                  header: "User Agent",
                  render: (r) => (
                    <span
                      className="max-w-[200px] truncate block text-slate-600"
                      title={r.user_agent ?? ""}
                    >
                      {r.user_agent ?? "—"}
                    </span>
                  ),
                },
              ]}
              data={activity}
              keyExtractor={(r) => r.id}
              emptyMessage="No activity recorded yet."
            />
            {hasMore && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 disabled:opacity-50"
                >
                  {loading ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
