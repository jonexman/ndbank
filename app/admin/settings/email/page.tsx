"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, Input, Button, PageHeader, Spinner } from "@/components/ui";

export default function EmailSettingsPage() {
  const [form, setForm] = useState({
    admin_email: "",
    smtp_host: "",
    smtp_port: "",
    smtp_user: "",
    smtp_pass: "",
  });
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadSettings = useCallback(() => {
    setLoadError(null);
    setLoading(true);
    fetch("/api/admin/settings")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load settings");
        return r.json();
      })
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
      .catch(() => setLoadError("Could not load settings. Try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setSaving(true);
    const options: Record<string, string> = {
      admin_email: form.admin_email,
      smtp_host: form.smtp_host,
      smtp_port: form.smtp_port,
      smtp_user: form.smtp_user,
    };
    if (form.smtp_pass.trim() !== "") options.smtp_pass = form.smtp_pass;
    fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ options }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(new Error(d.error || "Failed to save")));
        return r.json();
      })
      .then(() => {
        setStatus({ type: "success", msg: "Email settings saved." });
        setTimeout(() => setStatus(null), 4000);
      })
      .catch((err) => {
        setStatus({ type: "error", msg: err.message || "Could not save settings. Try again." });
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Email Settings" backHref="/admin/settings" subtitle="Admin email, SMTP configuration" />
        <Card className="flex items-center gap-3 p-8">
          <Spinner size="sm" />
          <span className="text-slate-600">Loading settings…</span>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div>
        <PageHeader title="Email Settings" backHref="/admin/settings" subtitle="Admin email, SMTP configuration" />
        <Card className="p-6">
          <p className="text-red-600 mb-4">{loadError}</p>
          <Button variant="secondary" onClick={loadSettings}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Email Settings" backHref="/admin/settings" subtitle="Admin email, SMTP configuration" />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          {status && (
            <div className={`p-4 rounded-xl text-sm ${status.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
              {status.msg}
            </div>
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
          <div className="space-y-2">
            <Input
              label="SMTP Password"
              type="password"
              value={form.smtp_pass}
              onChange={(e) => setForm({ ...form, smtp_pass: e.target.value })}
              placeholder="••••••••"
            />
            <p className="text-xs text-slate-500">Leave blank to keep the current password. Only enter a value to change it.</p>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
