"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, Input, Button, PageHeader } from "@/components/ui";

export default function SecurityPage() {
  const t = useTranslations("accountSecurity");
  const tCommon = useTranslations("common");
  const [section, setSection] = useState<"pin" | "password" | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (pin !== confirmPin) {
      setStatus({ type: "error", msg: t("pinsNoMatch") });
      return;
    }
    if (pin.length !== 4) {
      setStatus({ type: "error", msg: t("pinMustBe4") });
      return;
    }
    setStatus({ type: "success", msg: t("pinUpdated") });
    setPin("");
    setConfirmPin("");
    setSection(null);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", msg: t("passwordsNoMatch") });
      return;
    }
    if (newPassword.length < 8) {
      setStatus({ type: "error", msg: t("passwordMinLength") });
      return;
    }
    setStatus({ type: "success", msg: t("passwordUpdated") });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSection(null);
  };

  return (
    <div>
      <PageHeader title={t("title")} backHref="/dashboard" subtitle={t("subtitle")} />
      {status && (
        <div className={`mb-6 ${status.type === "success" ? "form-alert-success" : "form-alert-error"}`}>
          {status.msg}
        </div>
      )}

      <div className="space-y-6 max-w-2xl">
        <Card variant="elevated">
          <h3 className="text-lg font-semibold text-navy font-heading mb-2">{t("transactionPin")}</h3>
          <p className="text-sm text-slate-500 mb-4">{t("pinDescription")}</p>
          {section === "pin" ? (
            <form onSubmit={handlePinSubmit} className="space-y-4 max-w-sm">
              <Input
                label={t("newPin")}
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
              />
              <Input
                label={t("confirmPin")}
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
              />
              <div className="flex gap-2">
                <Button type="submit">{t("updatePin")}</Button>
                <Button type="button" onClick={() => { setSection(null); setPin(""); setConfirmPin(""); }} variant="secondary">
                  {tCommon("cancel")}
                </Button>
              </div>
            </form>
          ) : (
            <Button onClick={() => setSection("pin")}>{t("changePin")}</Button>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-navy mb-2">{t("password")}</h3>
          <p className="text-sm text-gray-500 mb-4">{t("passwordDescription")}</p>
          {section === "password" ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
              <Input
                label={t("currentPassword")}
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Input
                label={t("newPassword")}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Input
                label={t("confirmNewPassword")}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
              <div className="flex gap-2">
                <Button type="submit">{t("updatePassword")}</Button>
                <Button type="button" onClick={() => { setSection(null); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }} variant="secondary">
                  {tCommon("cancel")}
                </Button>
              </div>
            </form>
          ) : (
            <Button onClick={() => setSection("password")}>{t("changePassword")}</Button>
          )}
        </Card>
      </div>
    </div>
  );
}
