"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, Button, PageHeader, Switch, Spinner } from "@/components/ui";

const AUTO_DELETE_MIN = 0;
const AUTO_DELETE_MAX = 365;

type UserSettingsForm = {
  enableAffiliate: boolean;
  requireEmailConfirmationAtSignup: boolean;
  preventEmailUpdate: boolean;
  resendConfirmOnEmailUpdate: boolean;
  defaultRole: "member" | "administrator";
  autoDeleteUnconfirmedDays: string;
  disableSignup: boolean;
};

function parseDays(value: string): { valid: boolean; num: number; error?: string } {
  const trimmed = value.trim();
  if (trimmed === "") return { valid: false, num: 0, error: "Enter a number between 0 and 365." };
  const num = parseInt(trimmed, 10);
  if (Number.isNaN(num)) return { valid: false, num: 0, error: "Enter a number between 0 and 365." };
  if (num < AUTO_DELETE_MIN || num > AUTO_DELETE_MAX) {
    return { valid: false, num, error: `Enter a number between ${AUTO_DELETE_MIN} and ${AUTO_DELETE_MAX}.` };
  }
  return { valid: true, num };
}

export default function UserSettingsPage() {
  const [form, setForm] = useState<UserSettingsForm>({
    enableAffiliate: false,
    requireEmailConfirmationAtSignup: false,
    preventEmailUpdate: false,
    resendConfirmOnEmailUpdate: false,
    defaultRole: "member",
    autoDeleteUnconfirmedDays: "7",
    disableSignup: false,
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
        setForm((prev) => ({
          ...prev,
          enableAffiliate: o.user_affiliation === "1",
          requireEmailConfirmationAtSignup: o.user_require_email_confirmation === "1",
          preventEmailUpdate: o.user_lock_email === "1",
          resendConfirmOnEmailUpdate: o.user_reconfirm_email === "1",
          defaultRole: (o.user_default_role === "administrator" ? "administrator" : "member") as "member" | "administrator",
          autoDeleteUnconfirmedDays: String(o.user_auto_trash_unverified_after_day ?? 7),
          disableSignup: o.user_disable_signup === "1",
        }));
      })
      .catch(() => setLoadError("Could not load settings. Try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const daysValidation = parseDays(form.autoDeleteUnconfirmedDays);
  const canSave = daysValidation.valid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setStatus(null);
    setSaving(true);
    const options = {
      user_affiliation: form.enableAffiliate ? "1" : "0",
      user_require_email_confirmation: form.requireEmailConfirmationAtSignup ? "1" : "0",
      user_lock_email: form.preventEmailUpdate ? "1" : "0",
      user_reconfirm_email: form.resendConfirmOnEmailUpdate ? "1" : "0",
      user_default_role: form.defaultRole,
      user_auto_trash_unverified_after_day: String(daysValidation.num),
      user_disable_signup: form.disableSignup ? "1" : "0",
    };
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
        setStatus({ type: "success", msg: "User settings saved." });
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
        <PageHeader title="User Settings" backHref="/admin/settings" subtitle="User options and defaults" />
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
        <PageHeader title="User Settings" backHref="/admin/settings" subtitle="User options and defaults" />
        <Card className="p-6">
          <p className="text-red-600 mb-4">{loadError}</p>
          <Button variant="secondary" onClick={loadSettings}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="User Settings" backHref="/admin/settings" subtitle="User options and defaults" />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
          {status && (
            <div className={`p-4 rounded-xl text-sm ${status.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
              {status.msg}
            </div>
          )}

          {/* Profile & signup */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Profile & signup</h3>
            <p className="text-sm text-gray-500">What to require and allow during registration.</p>
            <div className="space-y-4">
              <Switch
                label="Require email confirmation at signup"
                hint="New users must confirm their email before they can sign in or use the account."
                checked={form.requireEmailConfirmationAtSignup}
                onChange={(v) => setForm({ ...form, requireEmailConfirmationAtSignup: v })}
              />
              <Switch
                label="Enable affiliate program"
                hint="Users get a unique referral link to invite others."
                checked={form.enableAffiliate}
                onChange={(v) => setForm({ ...form, enableAffiliate: v })}
              />
            </div>
          </section>

          {/* Email */}
          <section className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="text-base font-semibold text-gray-900">Email</h3>
            <p className="text-sm text-gray-500">Rules for changing and confirming email addresses.</p>
            <div className="space-y-4">
              <Switch
                label="Prevent users from updating their email"
                hint="Users cannot change their email from account settings."
                checked={form.preventEmailUpdate}
                onChange={(v) => setForm({ ...form, preventEmailUpdate: v })}
              />
              <Switch
                label="Resend confirmation email when email is updated"
                hint="User must confirm the new address before it takes effect."
                checked={form.resendConfirmOnEmailUpdate}
                onChange={(v) => setForm({ ...form, resendConfirmOnEmailUpdate: v })}
              />
            </div>
          </section>

          {/* Default registration role */}
          <section className="border-t border-gray-200 pt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Default registration role</h3>
            <p className="text-sm text-gray-500 mb-3">Role assigned to new users when created from the admin panel.</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultRole"
                  checked={form.defaultRole === "member"}
                  onChange={() => setForm({ ...form, defaultRole: "member" })}
                  className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                />
                <span className="font-medium">Member</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultRole"
                  checked={form.defaultRole === "administrator"}
                  onChange={() => setForm({ ...form, defaultRole: "administrator" })}
                  className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                />
                <span className="font-medium">Administrator</span>
              </label>
            </div>
          </section>

          {/* Data retention */}
          <section className="space-y-2 border-t border-gray-200 pt-6">
            <h3 className="text-base font-semibold text-gray-900">Data retention</h3>
            <label className="block text-sm text-gray-700">
              Automatically delete unconfirmed accounts after:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={AUTO_DELETE_MIN}
                max={AUTO_DELETE_MAX}
                value={form.autoDeleteUnconfirmedDays}
                onChange={(e) => setForm({ ...form, autoDeleteUnconfirmedDays: e.target.value })}
                className={`w-20 px-4 py-3 rounded-xl border bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                  !daysValidation.valid ? "border-red-400" : "border-gray-200"
                }`}
              />
              <span className="text-gray-600">days</span>
            </div>
            {daysValidation.error && (
              <p className="text-sm text-red-600">{daysValidation.error}</p>
            )}
            <p className="text-sm text-gray-500">Unverified accounts older than this are permanently deleted. Set to 0 to never delete.</p>
          </section>

          {/* Restrict access (danger zone) */}
          <section className="border-t border-gray-200 pt-6">
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <h3 className="text-base font-semibold text-amber-900 mb-1">Restrict access</h3>
              <p className="text-sm text-amber-800 mb-3">Use these options to temporarily lock down registration.</p>
              <Switch
                label="Temporarily disable signup"
                hint="New users cannot register until this is turned off."
                checked={form.disableSignup}
                onChange={(v) => setForm({ ...form, disableSignup: v })}
              />
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={saving || !canSave}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
