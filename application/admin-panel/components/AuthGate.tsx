"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/auth-context";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading) {
    return <p className="px-6 py-24 text-center text-sm tracking-[0.2em] text-oio-mute">Opening studio…</p>;
  }
  if (!user) return null;
  if (user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-lg px-6 py-24">
        <h1 className="font-serif text-4xl">Access denied</h1>
        <p className="mt-4 text-sm text-oio-mute">This atelier is for administrators. Customer accounts cannot enter.</p>
        <button
          type="button"
          onClick={() => void logout().then(() => router.replace("/login"))}
          className="mt-8 bg-oio-ink px-5 py-2 text-xs uppercase tracking-[0.18em] text-oio-cream"
        >
          Sign out
        </button>
      </div>
    );
  }
  return <>{children}</>;
}
