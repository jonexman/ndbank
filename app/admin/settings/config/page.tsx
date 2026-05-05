"use client";

import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";

const links = [
  { href: "/admin/settings/config/account-types", label: "Account Types", desc: "Configure account types (Savings, Current, etc.)" },
];

export default function ConfigHubPage() {
  return (
    <div>
      <PageHeader title="Config" backHref="/admin/settings" subtitle="System configuration" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card hover>
              <h3 className="font-semibold text-navy">{l.label}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{l.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
