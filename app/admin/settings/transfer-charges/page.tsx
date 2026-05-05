"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, Input, Button, PageHeader, Spinner } from "@/components/ui";

const PCT_MIN = 0;
const PCT_MAX = 100;

type FormState = { local_transfer_charge_pct: string; international_transfer_charge_pct: string };

function parsePct(value: string): { valid: boolean; num: number; error?: string } {
  const trimmed = value.trim();
  if (trimmed === "") return { valid: false, num: 0, error: "Enter a number between 0 and 100." };
  const num = parseFloat(trimmed);
  if (Number.isNaN(num)) return { valid: false, num: 0, error: "Enter a number between 0 and 100." };
  if (num < PCT_MIN || num > PCT_MAX) {
    return { valid: false, num, error: `Enter a number between ${PCT_MIN} and ${PCT_MAX}.` };
  }
  return { valid: true, num };
}

export default function TransferChargesPage() {
  const [form, setForm] = useState<FormState>({
    local_transfer_charge_pct: "0",
    international_transfer_charge_pct: "0",
  });
  const [loaded, setLoaded] = useState<FormState | null>(null);
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
        const next = {
          local_transfer_charge_pct: o.local_transfer_charge_pct ?? "0",
          international_transfer_charge_pct: o.international_transfer_charge_pct ?? "0",
        };
        setForm(next);
        setLoaded(next);
      })
      .catch(() => setLoadError("Could not load settings. Try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const localValidation = parsePct(form.local_transfer_charge_pct);
  const internationalValidation = parsePct(form.international_transfer_charge_pct);
  const isValid = localValidation.valid && internationalValidation.valid;
  const isDirty =
    loaded != null &&
    (form.local_transfer_charge_pct !== loaded.local_transfer_charge_pct ||
      form.international_transfer_charge_pct !== loaded.international_transfer_charge_pct);
  const canSave = isValid && isDirty && !saving;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setStatus(null);
    setSaving(true);
    fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        options: {
          local_transfer_charge_pct: String(localValidation.num),
          international_transfer_charge_pct: String(internationalValidation.num),
        },
      }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(new Error(d.error || "Failed to save")));
        return r.json();
      })
      .then((d) => {
        const o = d.options ?? {};
        const next = {
          local_transfer_charge_pct: o.local_transfer_charge_pct ?? "0",
          international_transfer_charge_pct: o.international_transfer_charge_pct ?? "0",
        };
        setLoaded(next);
        setForm(next);
        setStatus({ type: "success", msg: "Transfer charges saved." });
        setTimeout(() => setStatus(null), 4000);
      })
      .catch((err) => {
        setStatus({ type: "error", msg: err.message || "Could not save. Try again." });
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Transfer charges" backHref="/admin/settings" subtitle="Percentage charged on user transfers" />
        <Card className="flex items-center gap-3 p-8">
          <Spinner size="sm" />
          <span className="text-slate-600">Loading…</span>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div>
        <PageHeader title="Transfer charges" backHref="/admin/settings" subtitle="Percentage charged on user transfers" />
        <Card className="p-6">
          <p className="text-red-600 mb-4">{loadError}</p>
          <Button variant="secondary" onClick={loadSettings}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Transfer charges" backHref="/admin/settings" subtitle="Percentage charged on user transfers" />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
          {status && (
            <div className={`p-4 rounded-xl text-sm ${status.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
              {status.msg}
            </div>
          )}

          <section className="space-y-4">
            <p className="text-sm text-slate-600">
              Set the percentage fee applied to transfers. Users are debited the transfer amount plus this fee. Use 0 for no charge.
            </p>
            <Input
              label="Local transfer charge (%)"
              type="number"
              inputMode="decimal"
              min={PCT_MIN}
              max={PCT_MAX}
              step="0.01"
              value={form.local_transfer_charge_pct}
              onChange={(e) => setForm({ ...form, local_transfer_charge_pct: e.target.value })}
              error={!localValidation.valid ? localValidation.error : undefined}
              hint="Fee applied to local (in-network) transfers."
            />
            <Input
              label="International transfer charge (%)"
              type="number"
              inputMode="decimal"
              min={PCT_MIN}
              max={PCT_MAX}
              step="0.01"
              value={form.international_transfer_charge_pct}
              onChange={(e) => setForm({ ...form, international_transfer_charge_pct: e.target.value })}
              error={!internationalValidation.valid ? internationalValidation.error : undefined}
              hint="Fee applied to international transfers."
            />
          </section>

          <Button type="submit" disabled={!canSave}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
