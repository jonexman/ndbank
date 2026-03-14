"use client";

import { useState } from "react";
import { Card, Input, Button, PageHeader } from "@/components/ui";

export default function SecurityPage() {
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
      setStatus({ type: "error", msg: "PINs do not match" });
      return;
    }
    if (pin.length !== 4) {
      setStatus({ type: "error", msg: "PIN must be 4 digits" });
      return;
    }
    setStatus({ type: "success", msg: "PIN updated successfully (mock)" });
    setPin("");
    setConfirmPin("");
    setSection(null);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", msg: "Passwords do not match" });
      return;
    }
    if (newPassword.length < 8) {
      setStatus({ type: "error", msg: "Password must be at least 8 characters" });
      return;
    }
    setStatus({ type: "success", msg: "Password updated successfully (mock)" });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSection(null);
  };

  return (
    <div>
      <PageHeader title="Security" backHref="/dashboard" subtitle="Manage your PIN and password" />
      {status && (
        <div className={`mb-6 ${status.type === "success" ? "form-alert-success" : "form-alert-error"}`}>
          {status.msg}
        </div>
      )}

      <div className="space-y-6 max-w-2xl">
        <Card variant="elevated">
          <h3 className="text-lg font-semibold text-navy font-heading mb-2">Transaction PIN</h3>
          <p className="text-sm text-slate-500 mb-4">Use a 4-digit PIN to authorize transactions.</p>
          {section === "pin" ? (
            <form onSubmit={handlePinSubmit} className="space-y-4 max-w-sm">
              <Input
                label="New PIN"
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
              />
              <Input
                label="Confirm PIN"
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
              />
              <div className="flex gap-2">
                <Button type="submit">Update PIN</Button>
                <Button type="button" onClick={() => { setSection(null); setPin(""); setConfirmPin(""); }} variant="secondary">
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button onClick={() => setSection("pin")}>Change PIN</Button>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-navy mb-2">Password</h3>
          <p className="text-sm text-gray-500 mb-4">Change your login password.</p>
          {section === "password" ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
              <div className="flex gap-2">
                <Button type="submit">Update Password</Button>
                <Button type="button" onClick={() => { setSection(null); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }} variant="secondary">
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button onClick={() => setSection("password")}>Change Password</Button>
          )}
        </Card>
      </div>
    </div>
  );
}
