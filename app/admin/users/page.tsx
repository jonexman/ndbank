"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader, DataTable, Button, TableSkeleton } from "@/components/ui";

interface User {
  id: number | string;
  usercode?: string;
  email: string;
  firstname: string;
  lastname: string;
  bankNumber: string;
  balance: number;
  currency: string;
  canTransfer?: boolean;
  verified?: boolean;
  roles?: string[];
}

const PAGE_SIZE = 25;

function formatBalance(balance: number, currency: string) {
  return `${Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`;
}

function maskAccount(account: string | null | undefined) {
  if (!account || account.length < 4) return "—";
  return `***${account.slice(-4)}`;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [search, setSearch] = useState("");
  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "unverified">("all");
  const [filterRole, setFilterRole] = useState<"all" | "member" | "administrator" | "super-admin">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setUsers(null);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .catch(() => setUsers([]));
  }, []);

  const usercode = (u: User) => u.usercode ?? String(u.id);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchSearch = !q || 
        (u.email ?? "").toLowerCase().includes(q) ||
        `${u.firstname} ${u.lastname}`.toLowerCase().includes(q) ||
        (usercode(u)).toLowerCase().includes(q);
      const matchVerified = filterVerified === "all" ||
        (filterVerified === "verified" && u.verified) ||
        (filterVerified === "unverified" && !u.verified);
      const roles = u.roles ?? ["member"];
      const matchRole = filterRole === "all" || roles.includes(filterRole);
      return matchSearch && matchVerified && matchRole;
    });
  }, [users, search, filterVerified, filterRole]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

  if (users === null) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <PageHeader title="Clients" subtitle="Manage clients: credentials, accounts, and profile" />
          <Link href="/admin/users/new">
            <Button>New User</Button>
          </Link>
        </div>
        <p className="text-sm text-slate-600 mb-4">Use the search and filters below to find clients.</p>
        <TableSkeleton rows={10} cols={6} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <PageHeader title="Clients" subtitle="Manage clients: credentials, accounts, and profile" />
        <Link href="/admin/users/new">
          <Button>New User</Button>
        </Link>
      </div>
      <p className="text-sm text-slate-600 mb-4">Use the search and filters below to find clients.</p>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="search"
          placeholder="Search by name, email, or code..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          aria-label="Search clients"
        />
        <select
          value={filterVerified}
          onChange={(e) => { setFilterVerified(e.target.value as typeof filterVerified); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          aria-label="Filter by verification"
        >
          <option value="all">All</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
        <select
          value={filterRole}
          onChange={(e) => { setFilterRole(e.target.value as typeof filterRole); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          aria-label="Filter by role"
        >
          <option value="all">All roles</option>
          <option value="member">Member</option>
          <option value="administrator">Administrator</option>
          <option value="super-admin">Super Admin</option>
        </select>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          Showing {filteredUsers.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length} client{filteredUsers.length !== 1 ? "s" : ""}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 px-2">Page {page} of {totalPages}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-card">
          <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium mb-1">
            {users.length === 0 ? "No clients yet" : "No clients match your search or filters"}
          </p>
          <p className="text-sm text-slate-500 mb-4">
            {users.length === 0 ? "Add your first client to get started." : "Try adjusting your search or filter criteria."}
          </p>
          {users.length === 0 && (
            <Link href="/admin/users/new">
              <Button>Add Client</Button>
            </Link>
          )}
        </div>
      ) : (
      <DataTable
        striped
        columns={[
          { key: "usercode", header: "Code", render: (u) => <span className="font-mono text-sm">{usercode(u)}</span> },
          { key: "name", header: "Name", render: (u) => `${u.firstname} ${u.lastname}`.trim() || "—" },
          { key: "email", header: "Email", render: (u) => u.email || "—" },
          { key: "account", header: "Account", render: (u) => maskAccount(u.bankNumber) },
          {
            key: "balance",
            header: "Balance",
            render: (u) => formatBalance(u.balance, u.currency),
          },
          {
            key: "status",
            header: "Status",
            render: (u) => (
              <span className="flex flex-wrap gap-1">
                {u.verified ? (
                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">Verified</span>
                ) : (
                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Unverified</span>
                )}
                {((u.roles ?? []).filter((r) => r !== "member")).map((r) => (
                  <span key={r} className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary capitalize">
                    {r.replace("-", " ")}
                  </span>
                ))}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (u) => (
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/admin/users/manage-users/${usercode(u)}/credentials`}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Credentials
                </Link>
                <Link
                  href={`/admin/users/manage-users/${usercode(u)}/activity`}
                  className="text-slate-600 text-sm font-medium hover:underline"
                >
                  Activity
                </Link>
                <Link
                  href={`/admin/users/manage-users/${usercode(u)}/transactions`}
                  className="text-slate-600 text-sm font-medium hover:underline"
                >
                  Transactions
                </Link>
                <Link
                  href={`/admin/users/manage-users/${usercode(u)}/accounts`}
                  className="text-slate-600 text-sm font-medium hover:underline"
                >
                  Accounts
                </Link>
                <Link
                  href={`/admin/users/${usercode(u)}/edit`}
                  className="text-slate-600 text-sm font-medium hover:underline"
                >
                  Edit
                </Link>
              </div>
            ),
          },
        ]}
        data={paginatedUsers}
        keyExtractor={(u) => String(u.id)}
        emptyMessage="No clients."
      />
      )}
    </div>
  );
}
