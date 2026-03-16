"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, Input, Button, PageHeader, Spinner } from "@/components/ui";

export default function SignInPage() {
  const t = useTranslations("dashboard");
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const reasonDisabled = searchParams.get("reason") === "disabled";
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      let data: { error?: string } = {};
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: "Sign in failed" };
      }
      if (!res.ok) {
        setError(data.error ?? "Sign in failed");
        return;
      }
      const fromServer = (data as { redirectTo?: string }).redirectTo;
      const urlRedirect =
        redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
          ? redirectTo
          : undefined;
      const target = fromServer ?? urlRedirect ?? "/dashboard";
      window.location.href = target;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 lg:py-20">
      <PageHeader
        title={t("signIn")}
        subtitle={t("useEmailOrAccount")}
      />
      <Card variant="elevated" className="mt-8 relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Spinner size="lg" />
              <span className="text-sm font-medium text-slate-600">{t("signingIn")}</span>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {reasonDisabled && (
            <div className="p-4 rounded-xl bg-amber-50 text-amber-800 text-sm border border-amber-200">
              Your account has been disabled. Please contact support.
            </div>
          )}
          {error && <div className="form-alert-error">{error}</div>}
          <Input
            label={t("emailOrAccount")}
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            autoComplete="username"
            required
            disabled={loading}
          />
          <Input
            label={t("password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            disabled={loading}
          />
          <Button type="submit" fullWidth disabled={loading}>
            {t("signIn")}
          </Button>
        </form>
      </Card>
      <p className="mt-8 text-center text-slate-600">
        {t("noAccountYet")}{" "}
        <Link href="/dashboard/signup" className="font-medium text-primary hover:underline">
          {t("signUp")}
        </Link>
      </p>
    </div>
  );
}
