"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Mark } from "@/components/Mark";
import { useAuth } from "@/hooks/auth-context";
import { ApiRequestError } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setDenied(false);
    try {
      const user = await login(email, password);
      if (user.role !== "ADMIN") {
        setDenied(true);
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Sign in failed");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="flex items-center gap-3">
        <Mark />
        <p className="text-xs uppercase tracking-[0.3em] text-oio-gold">OIO Wood &amp; Timber</p>
      </div>
      <h1 className="mt-8 font-serif text-5xl">Studio</h1>
      <p className="mt-2 text-sm text-oio-mute">Atelier administration. Administrators only.</p>
      <form onSubmit={onSubmit} className="mt-10 space-y-4">
        <label className="block text-xs uppercase tracking-[0.16em]">
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full border border-oio-gold/30 px-3 py-2 text-sm normal-case" />
        </label>
        <label className="block text-xs uppercase tracking-[0.16em]">
          Password
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full border border-oio-gold/30 px-3 py-2 text-sm normal-case" />
        </label>
        <button type="submit" className="w-full bg-oio-ink py-3 text-xs uppercase tracking-[0.22em] text-oio-cream">
          Enter studio
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-red-800">{error}</p>}
      {denied && <p className="mt-4 text-sm text-red-800">Access denied. This account is not an administrator.</p>}
    </div>
  );
}
