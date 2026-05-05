"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, Input, Button, PageHeader, Spinner } from "@/components/ui";

const TITLE_MAX = 80;
const TAGLINE_MAX = 120;
const DESCRIPTION_MAX = 160;

type FormState = { site_title: string; site_tagline: string; site_description: string };

function validate(form: FormState): { titleError?: string; taglineError?: string; descriptionError?: string } {
  const title = form.site_title.trim();
  const tagline = form.site_tagline.trim();
  const description = form.site_description.trim();
  const errors: { titleError?: string; taglineError?: string; descriptionError?: string } = {};
  if (title.length === 0) errors.titleError = "Site title is required.";
  else if (title.length > TITLE_MAX) errors.titleError = `Use ${TITLE_MAX} characters or fewer.`;
  if (tagline.length > TAGLINE_MAX) errors.taglineError = `Use ${TAGLINE_MAX} characters or fewer.`;
  if (description.length > DESCRIPTION_MAX) errors.descriptionError = `Use ${DESCRIPTION_MAX} characters or fewer (e.g. for meta description).`;
  return errors;
}

export default function GeneralSettingsPage() {
  const [form, setForm] = useState<FormState>({ site_title: "", site_tagline: "", site_description: "" });
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
          site_title: o.site_title ?? "",
          site_tagline: o.site_tagline ?? "",
          site_description: o.site_description ?? "",
        };
        setForm(next);
        setLoaded(next);
      })
      .catch(() => setLoadError("Could not load settings. Try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const errors = validate(form);
  const isValid = !errors.titleError && !errors.taglineError && !errors.descriptionError;
  const isDirty =
    loaded != null &&
    (form.site_title !== loaded.site_title ||
      form.site_tagline !== loaded.site_tagline ||
      form.site_description !== loaded.site_description);
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
          site_title: form.site_title.trim(),
          site_tagline: form.site_tagline.trim(),
          site_description: form.site_description.trim(),
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
          site_title: o.site_title ?? "",
          site_tagline: o.site_tagline ?? "",
          site_description: o.site_description ?? "",
        };
        setLoaded(next);
        setForm(next);
        setStatus({ type: "success", msg: "General settings saved." });
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
        <PageHeader title="General Settings" backHref="/admin/settings" subtitle="Site title, tagline, description" />
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
        <PageHeader title="General Settings" backHref="/admin/settings" subtitle="Site title, tagline, description" />
        <Card className="p-6">
          <p className="text-red-600 mb-4">{loadError}</p>
          <Button variant="secondary" onClick={loadSettings}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="General Settings" backHref="/admin/settings" subtitle="Site title, tagline, description" />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
          {status && (
            <div className={`p-4 rounded-xl text-sm ${status.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
              {status.msg}
            </div>
          )}

          <section className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Site identity</h3>
            <p className="text-sm text-gray-500">
              Name and short text used across the site (browser tab, headers, and meta description).
            </p>

            <Input
              label="Site title"
              value={form.site_title}
              onChange={(e) => setForm({ ...form, site_title: e.target.value })}
              placeholder="e.g. Alpha Bank"
              maxLength={TITLE_MAX}
              error={errors.titleError}
              hint={!errors.titleError ? "Shown in the browser tab and site header." : undefined}
            />
            <div className="text-right text-xs text-slate-400">{form.site_title.length}/{TITLE_MAX}</div>

            <Input
              label="Tagline"
              value={form.site_tagline}
              onChange={(e) => setForm({ ...form, site_tagline: e.target.value })}
              placeholder="e.g. E-Banking"
              maxLength={TAGLINE_MAX}
              error={errors.taglineError}
              hint={!errors.taglineError ? "Short line under the logo or in the header." : undefined}
            />
            <div className="text-right text-xs text-slate-400">{form.site_tagline.length}/{TAGLINE_MAX}</div>

            <div className="space-y-2">
              <label htmlFor="site-description" className="block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                id="site-description"
                value={form.site_description}
                onChange={(e) => setForm({ ...form, site_description: e.target.value })}
                placeholder="Brief summary for search engines and social previews."
                maxLength={DESCRIPTION_MAX}
                rows={3}
                className={`
                  w-full px-4 py-3 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400
                  focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary
                  resize-y min-h-[80px]
                  ${errors.descriptionError ? "border-red-400 focus:ring-red-200 focus:border-red-500" : "border-slate-200"}
                `}
              />
              {errors.descriptionError && <p className="text-sm text-red-600">{errors.descriptionError}</p>}
              {!errors.descriptionError && (
                <p className="text-sm text-slate-500">Used for meta description and SEO; keep it brief.</p>
              )}
              <div className="text-right text-xs text-slate-400">{form.site_description.length}/{DESCRIPTION_MAX}</div>
            </div>
          </section>

          <Button type="submit" disabled={!canSave}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
