"use client";

import { useEffect, useState } from "react";
import { Card, Input, Button, PageHeader } from "@/components/ui";

export default function GeneralSettingsPage() {
  const [form, setForm] = useState({ site_title: "", site_tagline: "", site_description: "" });
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        const o = d.options ?? {};
        setForm({
          site_title: o.site_title ?? "",
          site_tagline: o.site_tagline ?? "",
          site_description: o.site_description ?? "",
        });
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "success", msg: "General settings saved (mock)." });
  };

  return (
    <div>
      <PageHeader title="General Settings" backHref="/admin/settings" subtitle="Site title, tagline, description" />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          {status && (
            <div className="p-4 rounded-xl text-sm bg-emerald-50 text-emerald-800">{status.msg}</div>
          )}
          <Input
            label="Site Title"
            value={form.site_title}
            onChange={(e) => setForm({ ...form, site_title: e.target.value })}
          />
          <Input
            label="Tagline"
            value={form.site_tagline}
            onChange={(e) => setForm({ ...form, site_tagline: e.target.value })}
          />
          <Input
            label="Description"
            value={form.site_description}
            onChange={(e) => setForm({ ...form, site_description: e.target.value })}
          />
          <Button type="submit">Save</Button>
        </form>
      </Card>
    </div>
  );
}
