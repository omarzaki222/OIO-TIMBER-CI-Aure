"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { useAuth } from "@/hooks/auth-context";
import { ApiRequestError } from "@/lib/api";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Sign in failed");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-serif text-5xl">Sign in</h1>
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
          Enter
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
      <p className="mt-6 text-sm">
        New to OIO? <Link href="/signup" className="underline">Create an account</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
