"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/auth-context";

export function AccountGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading) {
    return <p className="px-4 py-24 text-center text-sm tracking-[0.2em] text-oio-mute">Loading account…</p>;
  }
  if (!user) return null;
  return <>{children}</>;
}
