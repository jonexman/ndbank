"use client";

import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";

const links = [
  { href: "/admin/settings/general", label: "General", desc: "Site title, tagline, description" },
  { href: "/admin/settings/email", label: "Email", desc: "Admin email, SMTP settings" },
  { href: "/admin/settings/users", label: "Users", desc: "User options and defaults" },
];

export default function SettingsHubPage() {
  return (
    <div>
      <PageHeader title="Settings" backHref="/admin" subtitle="Configure site and system options" />
      <p className="text-sm text-slate-600 mb-6">Choose a section below to update general site settings, email configuration, or user defaults.</p>
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
