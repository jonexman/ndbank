"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, Input, Button, PageHeader, Select, Spinner } from "@/components/ui";
import { COUNTRIES as COUNTRY_LIST } from "@/lib/admin/options";
import { siteConfig } from "@/lib/siteConfig";

const GENDERS = [
  { value: "", label: "-- Please select one --" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const RELIGIONS = [
  { value: "", label: "-- Please select one --" },
  { value: "christianity", label: "Christianity" },
  { value: "islam", label: "Islam" },
  { value: "judaism", label: "Judaism" },
  { value: "hinduism", label: "Hinduism" },
  { value: "buddhism", label: "Buddhism" },
  { value: "other", label: "Other" },
];

const RELATIONSHIPS = [
  { value: "", label: "- Choose One -" },
  { value: "spouse", label: "Spouse" },
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "sibling", label: "Sibling" },
  { value: "other", label: "Other" },
];

const CURRENCIES = [
  { value: "USD", label: "US Dollar" },
  { value: "EUR", label: "Euro" },
  { value: "GBP", label: "British Pound" },
];

const ACCOUNT_TYPES = [
  { value: "savings", label: "Savings account" },
  { value: "checking", label: "Checking account" },
  { value: "current", label: "Current account" },
];

const COUNTRIES = [
  { value: "", label: "-- Select country --" },
  ...COUNTRY_LIST.map((c) => ({ value: c.iso_2, label: c.name })),
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold text-primary mt-8 first:mt-0 mb-4">
      {children}
    </h3>
  );
}

export default function SignupPage() {
  const t = useTranslations("dashboard");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [religion, setReligion] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("US");
  const [zipcode, setZipcode] = useState("");
  const [nokFirstname, setNokFirstname] = useState("");
  const [nokLastname, setNokLastname] = useState("");
  const [nokRelationship, setNokRelationship] = useState("");
  const [nokAddress, setNokAddress] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState("USD");
  const [accountType, setAccountType] = useState("savings");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }
    if (pin.length < 4 || pin.length > 6) {
      setError("PIN must be 4–6 digits");
      return;
    }
    if (!/^\d+$/.test(pin)) {
      setError("PIN must contain only digits");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service & Privacy Policy");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          pin,
          firstname,
          lastname,
          phone: phone || undefined,
          birthdate: birthdate || undefined,
          gender: gender || undefined,
          religion: religion || undefined,
          address: address || undefined,
          state: state || undefined,
          city: city || undefined,
          country: country || undefined,
          zipcode: zipcode || undefined,
          nok_firstname: nokFirstname || undefined,
          nok_lastname: nokLastname || undefined,
          nok_relationship: nokRelationship || undefined,
          nok_address: nokAddress || undefined,
          preferred_currency: preferredCurrency,
          account_type: accountType,
          agreed_to_terms: agreedToTerms,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign up failed");
        return;
      }
      setSuccess(true);
      setTimeout(() => (window.location.href = "/dashboard"), 1500);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-light text-success-dark mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <PageHeader title="Account Created" subtitle="Redirecting to dashboard..." />
        <div className="flex justify-center mt-6">
          <Spinner size="md" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 lg:py-20">
      <PageHeader title={t("createAccount")} subtitle={t("createAccountSubtitle", { title: siteConfig.title })} />
      <Card variant="elevated" className="mt-8 relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Spinner size="lg" />
              <span className="text-sm font-medium text-slate-600">{t("creatingAccount")}</span>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="form-alert-error">{error}</div>}

          <SectionHeading>Authentication</SectionHeading>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              label="Pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="4–6 digits"
              required
              disabled={loading}
            />
            <Input
              label="Confirm Pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              required
              disabled={loading}
            />
          </div>

          <SectionHeading>Personal Info</SectionHeading>
          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              label="First Name *"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              label="Last Name *"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
            <Input
              label="Birth Date *"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <Select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={GENDERS}
              disabled={loading}
            />
            <Select
              label="Religion"
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
              options={RELIGIONS}
              disabled={loading}
            />
          </div>

          <SectionHeading>Address</SectionHeading>
          <Input
            label="Home Address *"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            disabled={loading}
          />
          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              label="State *"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <Select
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              options={COUNTRIES}
              disabled={loading}
            />
            <Input
              label="Zipcode"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              disabled={loading}
            />
          </div>

          <SectionHeading>Next Of Kin</SectionHeading>
          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              label="First Name"
              value={nokFirstname}
              onChange={(e) => setNokFirstname(e.target.value)}
              disabled={loading}
            />
            <Input
              label="Last Name"
              value={nokLastname}
              onChange={(e) => setNokLastname(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <Select
              label="Relationship"
              value={nokRelationship}
              onChange={(e) => setNokRelationship(e.target.value)}
              options={RELATIONSHIPS}
              disabled={loading}
            />
            <Input
              label="Address"
              value={nokAddress}
              onChange={(e) => setNokAddress(e.target.value)}
              disabled={loading}
            />
          </div>

          <SectionHeading>Bank System Info</SectionHeading>
          <div className="grid sm:grid-cols-2 gap-6">
            <Select
              label="Preferred Currency"
              value={preferredCurrency}
              onChange={(e) => setPreferredCurrency(e.target.value)}
              options={CURRENCIES}
              disabled={loading}
            />
            <Select
              label="Account Type"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              options={ACCOUNT_TYPES}
              disabled={loading}
            />
          </div>

          <div className="pt-4 space-y-6">
            <label className={`flex items-start gap-3 cursor-pointer ${loading ? "opacity-60 pointer-events-none" : ""}`}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
                disabled={loading}
              />
              <span className="text-sm text-slate-700">
                I agree to the Terms Of Service & Privacy Policy.
              </span>
            </label>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Creating Account…" : "Create Account"}
            </Button>
          </div>
        </form>
      </Card>
      <p className="mt-8 text-center text-slate-600">
        Already have an account?{" "}
        <Link href="/dashboard/signin" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
