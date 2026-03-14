"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type AuthContextType = {
  userId: string | null;
  email: string | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const needsAuth = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");

  useEffect(() => {
    if (!needsAuth) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.id) {
          setUserId(data.user.id);
          setEmail(data.user.email ?? null);
        } else {
          setUserId(null);
          setEmail(null);
        }
      })
      .catch(() => {
        setUserId(null);
        setEmail(null);
      })
      .finally(() => setIsLoading(false));
  }, [needsAuth]);

  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setUserId(null);
    setEmail(null);
    router.push("/dashboard/signin");
  };

  return (
    <AuthContext.Provider value={{ userId, email, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
