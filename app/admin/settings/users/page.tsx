"use client";

import { useEffect, useState } from "react";
import { Card, Button, PageHeader, Switch } from "@/components/ui";

type UserSettingsForm = {
  collectUsername: boolean;
  enableAffiliate: boolean;
  preventEmailUpdate: boolean;
  resendConfirmOnEmailUpdate: boolean;
  defaultRole: "member" | "administrator";
  autoDeleteUnconfirmedDays: string;
  disableSignup: boolean;
};

export default function UserSettingsPage() {
  const [form, setForm] = useState<UserSettingsForm>({
    collectUsername: false,
    enableAffiliate: false,
    preventEmailUpdate: false,
    resendConfirmOnEmailUpdate: true,
    defaultRole: "member",
    autoDeleteUnconfirmedDays: "7",
    disableSignup: false,
  });
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => setIsSuperAdmin(!!d.isSuperAdmin))
      .catch(() => setIsSuperAdmin(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        const o = d.options ?? {};
        setForm((prev) => ({
          ...prev,
          collectUsername: o.user_collect_username === "1",
          enableAffiliate: o.user_affiliation === "1",
          preventEmailUpdate: o.user_lock_email === "1",
          resendConfirmOnEmailUpdate: o.user_reconfirm_email !== "0",
          defaultRole: (o.user_default_role === "administrator" ? "administrator" : "member") as "member" | "administrator",
          autoDeleteUnconfirmedDays: String(o.user_auto_trash_unverified_after_day ?? 7),
          disableSignup: o.user_disable_signup === "1",
        }));
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "success", msg: "User settings saved." });
  };

  return (
    <div>
      <PageHeader title="User Settings" backHref="/admin/settings" subtitle="User options and defaults" />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          {status && (
            <div className={`p-4 rounded-xl text-sm ${status.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
              {status.msg}
            </div>
          )}

          <div className="space-y-6">
            <Switch
              label="Collect username at signup"
              hint="Self explanatory"
              checked={form.collectUsername}
              onChange={(v) => setForm({ ...form, collectUsername: v })}
            />
            <Switch
              label="Enable Affiliate Program"
              hint="Users will have unique affiliation link to invite referrals"
              checked={form.enableAffiliate}
              onChange={(v) => setForm({ ...form, enableAffiliate: v })}
            />
            <Switch
              label="Prevent User from updating their email."
              hint="Discourage user from changing to fake email after logging in"
              checked={form.preventEmailUpdate}
              onChange={(v) => setForm({ ...form, preventEmailUpdate: v })}
            />
            <Switch
              label="Resend confirmation email on every email update."
              hint="Force user to confirm the new email address"
              checked={form.resendConfirmOnEmailUpdate}
              onChange={(v) => setForm({ ...form, resendConfirmOnEmailUpdate: v })}
            />
          </div>

          {isSuperAdmin && (
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-base font-medium text-gray-900 mb-3">Default Registration role</label>
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
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-base font-medium text-gray-900">
              Automatically delete unconfirmed account after:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={form.autoDeleteUnconfirmedDays}
                onChange={(e) => setForm({ ...form, autoDeleteUnconfirmedDays: e.target.value })}
                className="w-20 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <span className="text-gray-600">Days</span>
            </div>
            <p className="text-sm text-gray-500">Set to zero (0) to avoid deleting unconfirmed account</p>
          </div>

          <Switch
            label="Temporarily Disable Signup"
            hint="Disallow registration until this option is turned off"
            checked={form.disableSignup}
            onChange={(v) => setForm({ ...form, disableSignup: v })}
          />

          <div className="flex justify-end pt-4">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
