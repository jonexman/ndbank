"use client";

import { useEffect, useState } from "react";
import { Card, Input, Button, PageHeader } from "@/components/ui";

export default function EmailSettingsPage() {
  const [form, setForm] = useState({
    admin_email: "",
    smtp_host: "",
    smtp_port: "",
    smtp_user: "",
    smtp_pass: "",
  });
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        const o = d.options ?? {};
        setForm({
          admin_email: o.admin_email ?? "",
          smtp_host: o.smtp_host ?? "",
          smtp_port: o.smtp_port ?? "",
          smtp_user: o.smtp_user ?? "",
          smtp_pass: "",
        });
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "success", msg: "Email settings saved (mock)." });
  };

  return (
    <div>
      <PageHeader title="Email Settings" backHref="/admin/settings" subtitle="Admin email, SMTP configuration" />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          {status && (
            <div className="p-4 rounded-xl text-sm bg-emerald-50 text-emerald-800">{status.msg}</div>
          )}
          <Input
            label="Admin Email"
            type="email"
            value={form.admin_email}
            onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
          />
          <Input
            label="SMTP Host"
            value={form.smtp_host}
            onChange={(e) => setForm({ ...form, smtp_host: e.target.value })}
            placeholder="smtp.example.com"
          />
          <Input
            label="SMTP Port"
            value={form.smtp_port}
            onChange={(e) => setForm({ ...form, smtp_port: e.target.value })}
            placeholder="587"
          />
          <Input
            label="SMTP User"
            value={form.smtp_user}
            onChange={(e) => setForm({ ...form, smtp_user: e.target.value })}
          />
          <Input
            label="SMTP Password"
            type="password"
            value={form.smtp_pass}
            onChange={(e) => setForm({ ...form, smtp_pass: e.target.value })}
            placeholder="••••••••"
          />
          <Button type="submit">Save</Button>
        </form>
      </Card>
    </div>
  );
}
