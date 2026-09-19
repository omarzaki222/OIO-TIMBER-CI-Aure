"use client";

import { FormEvent, useState } from "react";
import { ApiRequestError } from "@/lib/api";
import { createInquiry } from "@/services/inquiries";
import { useAuth } from "@/hooks/auth-context";

export default function ContactPage() {
  const { user } = useAuth();
  const [full_name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus(null);
    try {
      await createInquiry({
        subject: "Website contact",
        message,
        email: user ? undefined : email,
        full_name: user ? undefined : full_name,
      });
      setStatus("Received. Thank you.");
      setMessage("");
    } catch (err) {
      setStatus(err instanceof ApiRequestError ? err.message : "Could not send.");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-20 md:px-6">
      <h1 className="font-serif text-5xl">Contact</h1>
      <p className="mt-4 text-oio-mute">A written note is enough. We reply from the studio.</p>
      <form onSubmit={onSubmit} className="mt-10 space-y-5">
        {!user && (
          <>
            <label className="block text-xs uppercase tracking-[0.16em]">
              Name
              <input required value={full_name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full border border-oio-gold/30 bg-transparent px-3 py-2 text-sm normal-case" />
            </label>
            <label className="block text-xs uppercase tracking-[0.16em]">
              Email
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full border border-oio-gold/30 bg-transparent px-3 py-2 text-sm normal-case" />
            </label>
          </>
        )}
        <label className="block text-xs uppercase tracking-[0.16em]">
          Message
          <textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="mt-2 w-full border border-oio-gold/30 bg-transparent p-3 text-sm normal-case tracking-normal" />
        </label>
        <button type="submit" className="bg-oio-ink px-6 py-3 text-xs uppercase tracking-[0.22em] text-oio-cream">
          Send inquiry
        </button>
      </form>
      {status && <p className="mt-4 text-sm" role="status">{status}</p>}
    </div>
  );
}
