"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBadge, CardSkeleton } from "@/components/ui";

interface OverviewStats {
  totalUsers: number;
  totalDebits: number;
  totalCredits: number;
  totalTransactions: number;
  approvedDeposits: number;
  pendingDeposits: number;
  declinedDeposits: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then(setStats)
      .catch(() =>
        setStats({
          totalUsers: 0,
          totalDebits: 0,
          totalCredits: 0,
          totalTransactions: 0,
          approvedDeposits: 0,
          pendingDeposits: 0,
          declinedDeposits: 0,
        })
      );
  }, []);

  const items = [
    { href: "/admin/users", label: "Total Users", count: stats?.totalUsers ?? "-", desc: "Registered users" },
    { href: "/admin/finance/transfers", label: "Total Debits", count: stats?.totalDebits != null ? `$${stats.totalDebits.toLocaleString()}` : "-", desc: "Total debit amount" },
    { href: "/admin/finance/transfers", label: "Total Credits", count: stats?.totalCredits != null ? `$${stats.totalCredits.toLocaleString()}` : "-", desc: "Total credit amount" },
    { href: "/admin/finance/transfers", label: "Transactions", count: stats?.totalTransactions ?? "-", desc: "All transfers" },
    { href: "/admin/finance/deposits", label: "Approved Deposits", count: stats?.approvedDeposits ?? "-", desc: "Deposits approved", variant: "success" as const },
    { href: "/admin/finance/deposits", label: "Pending Deposits", count: stats?.pendingDeposits ?? "-", desc: "Awaiting approval", variant: "warning" as const },
    { href: "/admin/finance/deposits", label: "Declined Deposits", count: stats?.declinedDeposits ?? "-", desc: "Deposits declined", variant: "warning" as const },
  ];

  if (stats === null) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-navy font-heading mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-4">Overview of users, debits, credits, transactions, and deposits.</p>
        <p className="text-sm text-slate-600 mb-8">Use the menu to navigate to Users, Finance, Settings, and more.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy font-heading mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-4">Overview of users, debits, credits, transactions, and deposits.</p>

      <div className="mb-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <h2 className="text-base font-semibold text-navy mb-2">Quick navigation</h2>
        <p className="text-sm text-slate-600 mb-2">Use the menu to move around:</p>
        <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
          <li><strong>Users</strong> — Manage clients, add new users, review KYC submissions</li>
          <li><strong>Tools</strong> — System info and site settings</li>
          <li><strong>Managements</strong> — Cards, loans, currencies, exchanges</li>
          <li><strong>Gateway</strong> — Payment methods</li>
          <li><strong>Finance</strong> — Transactions, pending transfers, deposits, cheques</li>
          <li><strong>Configure</strong> — Account types and config hub</li>
        </ul>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link key={item.href + item.label} href={item.href}>
            <Card hover>
              <CardBadge variant={item.variant ?? "primary"}>{item.count}</CardBadge>
              <h3 className="font-semibold text-navy">{item.label}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
