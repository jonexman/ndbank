"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, Input, Select, Button, PageHeader } from "@/components/ui";

const ROLES = ["member", "administrator", "super-admin"];

export default function EditUserPage() {
  const params = useParams();
  const usercode = params.usercode as string;
  const [data, setData] = useState<{
    user: {
      id: string;
      usercode: string;
      email: string;
      firstname: string;
      lastname: string;
      bankNumber: string | null;
      roles: string[];
      register_time: string;
    };
    profile: Record<string, string>;
    options: {
      countries: Array<{ iso_2: string; name: string }>;
      genders: Array<{ value: string; label: string }>;
      religions: Array<{ value: string; label: string }>;
      relationships: Array<{ value: string; label: string }>;
    };
  } | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<string[]>([]);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => setIsSuperAdmin(!!d.isSuperAdmin))
      .catch(() => setIsSuperAdmin(false));
  }, []);

  useEffect(() => {
    fetch(`/api/admin/users/${usercode}/edit`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setData(null);
          return;
        }
        setData(d);
        setRoles(d.user?.roles ?? ["member"]);
        const p = d.profile ?? {};
        setForm({
          email: d.user?.email ?? "",
          firstname: d.user?.firstname ?? p.firstname ?? "",
          lastname: d.user?.lastname ?? p.lastname ?? "",
          phone: p.phone ?? "",
          birthdate: p.birthdate ?? "",
          gender: p.gender ?? "",
          religion: p.religion ?? "",
          address: p.address ?? "",
          state: p.state ?? "",
          city: p.city ?? "",
          country: p.country ?? "",
          zipcode: p.zipcode ?? "",
          nok_name: p.nok_name ?? "",
          nok_relationship: p.nok_relationship ?? "",
          nok_address: p.nok_address ?? "",
        });
      })
      .catch(() => setData(null));
  }, [usercode]);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const toggleRole = (role: string) => {
    setRoles((r) => (r.includes(role) ? r.filter((x) => x !== role) : [...r, role]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${usercode}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          firstname: form.firstname,
          lastname: form.lastname,
          phone: form.phone || undefined,
          birthdate: form.birthdate || undefined,
          gender: form.gender || undefined,
          religion: form.religion || undefined,
          address: form.address || undefined,
          state: form.state || undefined,
          city: form.city || undefined,
          country: form.country || undefined,
          zipcode: form.zipcode || undefined,
          nok_name: form.nok_name || undefined,
          nok_relationship: form.nok_relationship || undefined,
          nok_address: form.nok_address || undefined,
          ...(isSuperAdmin && { roles }),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus({ type: "success", msg: "Profile updated" });
      } else {
        setStatus({ type: "error", msg: json.error ?? "Update failed" });
      }
    } catch {
      setStatus({ type: "error", msg: "Request failed" });
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div>
        <PageHeader title="Edit User" backHref="/admin/users" subtitle="Loading or user not found." />
      </div>
    );
  }

  const displayName = [data.user.firstname, data.user.lastname].filter(Boolean).join(" ") || "User";

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <PageHeader
            title="Edit User"
            backHref="/admin/users"
            subtitle={`${displayName} (${data.user.usercode})`}
          />
          <div className="flex gap-2 mt-2">
            {data.user.roles?.map((r) => (
              <span
                key={r}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/15 text-primary capitalize"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/users/manage-users/${usercode}/accounts`}
            className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5"
          >
            Manage accounts
          </Link>
          <Link
            href={`/admin/users/manage-users/${usercode}/credentials`}
            className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5"
          >
            Banking credentials
          </Link>
          <Link
            href={`/admin/users/manage-users/${usercode}/activity`}
            className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5"
          >
            Login activity
          </Link>
        </div>
      </div>

      {status && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm ${
            status.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {status.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identity */}
        <Card>
          <h3 className="text-base font-semibold text-navy mb-4">Identity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First name"
              value={form.firstname}
              onChange={(e) => update("firstname", e.target.value)}
              required
            />
            <Input
              label="Last name"
              value={form.lastname}
              onChange={(e) => update("lastname", e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Bank number: {data.user.bankNumber ?? "—"} · Registered: {data.user.register_time || "—"}
          </p>
        </Card>

        {/* Contact */}
        <Card>
          <h3 className="text-base font-semibold text-navy mb-4">Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
            <Input
              label="Birth date"
              type="date"
              value={form.birthdate}
              onChange={(e) => update("birthdate", e.target.value)}
            />
            <Select
              label="Gender"
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
              options={data.options.genders}
            />
            <Select
              label="Religion"
              value={form.religion}
              onChange={(e) => update("religion", e.target.value)}
              options={data.options.religions}
            />
          </div>
        </Card>

        {/* Address */}
        <Card>
          <h3 className="text-base font-semibold text-navy mb-4">Address</h3>
          <div className="space-y-4">
            <Input
              label="Street address"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="City"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
              <Input
                label="State"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
              />
              <Input
                label="Zip code"
                value={form.zipcode}
                onChange={(e) => update("zipcode", e.target.value)}
              />
            </div>
            <Select
              label="Country"
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
              options={[{ value: "", label: "— Select —" }, ...data.options.countries.map((c) => ({ value: c.iso_2, label: c.name }))]}
            />
          </div>
        </Card>

        {/* Next of kin */}
        <Card>
          <h3 className="text-base font-semibold text-navy mb-4">Next of kin</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full name"
              value={form.nok_name}
              onChange={(e) => update("nok_name", e.target.value)}
            />
            <Select
              label="Relationship"
              value={form.nok_relationship}
              onChange={(e) => update("nok_relationship", e.target.value)}
              options={data.options.relationships}
            />
            <Input
              label="Address"
              value={form.nok_address}
              onChange={(e) => update("nok_address", e.target.value)}
              className="sm:col-span-2"
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {isSuperAdmin && (
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <h3 className="text-base font-semibold text-navy mb-4">Access control</h3>
                <div className="flex flex-wrap gap-4">
                  {ROLES.map((role) => (
                    <label key={role} className="flex items-center gap-2 cursor-pointer capitalize">
                      <input
                        type="checkbox"
                        checked={roles.includes(role)}
                        onChange={() => toggleRole(role)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium">{role}</span>
                    </label>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Submit */}
          <div className={isSuperAdmin ? "lg:col-span-1" : "lg:col-span-3"}>
            <div className="sticky top-6">
              <Button type="submit" fullWidth size="lg" disabled={loading}>
                {loading ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
