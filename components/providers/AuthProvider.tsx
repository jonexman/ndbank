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
      .then(async (r) => {
        const text = await r.text();
        let data: { user?: { id: string; email?: string } | null; loginDisabled?: boolean } = { user: null };
        try {
          data = text ? JSON.parse(text) : { user: null };
        } catch {
          data = { user: null };
        }
        if (r.status === 403 && data.loginDisabled) {
          setUserId(null);
          setEmail(null);
          fetch("/api/auth/signout", { method: "POST" }).catch(() => {});
          router.replace("/dashboard/signin?reason=disabled");
          return;
        }
        return data;
      })
      .then((data) => {
        if (!data) return;
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
