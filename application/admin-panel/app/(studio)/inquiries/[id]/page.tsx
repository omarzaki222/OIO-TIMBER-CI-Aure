"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ErrorState, LoadingState, Notice } from "@/components/Feedback";
import { ApiRequestError } from "@/lib/api";
import { fetchInquiry, fetchInquiryMessages, patchInquiry, replyInquiry } from "@/services/studio";
import type { Inquiry, Message } from "@/types/api";

export default function InquiryThreadPage() {
  const { id } = useParams<{ id: string }>();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function load() {
    Promise.all([fetchInquiry(id), fetchInquiryMessages(id)])
      .then(([i, m]) => {
        setInquiry(i);
        setStatus(i.status);
        setMessages(m);
      })
      .catch((e: unknown) => setError(e instanceof ApiRequestError ? e.message : "Could not load inquiry."));
  }

  useEffect(() => {
    load();
  }, [id]);

  async function onReply(e: FormEvent) {
    e.preventDefault();
    try {
      const msg = await replyInquiry(id, reply);
      setMessages((m) => [...m, msg]);
      setReply("");
      setNotice("Reply sent.");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not send reply.");
    }
  }

  if (error && !inquiry) return <ErrorState>{error}</ErrorState>;
  if (!inquiry) return <LoadingState />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-4xl">{inquiry.subject}</h1>
      <p className="mt-2 text-sm text-oio-mute">{inquiry.guest_email || inquiry.user_id || "Guest"}</p>
      <p className="mt-6 text-sm">{inquiry.message}</p>
      <label className="mt-6 block text-xs uppercase tracking-[0.16em]">
        Status
        <select
          value={status}
          onChange={(e) => {
            const v = e.target.value;
            setStatus(v);
            void patchInquiry(id, v).then(setInquiry);
          }}
          className="mt-2 w-full border border-oio-gold/30 px-3 py-2 text-sm"
        >
          {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <ul className="mt-10 space-y-4 text-sm">
        {messages.map((m) => (
          <li key={m.id} className={m.is_from_admin ? "text-oio-gold" : ""}>
            <p className="text-[10px] uppercase tracking-[0.16em]">{m.is_from_admin ? "Studio" : "Customer"}</p>
            <p className="mt-1">{m.body}</p>
          </li>
        ))}
      </ul>
      <form onSubmit={onReply} className="mt-8 space-y-3">
        <textarea required value={reply} onChange={(e) => setReply(e.target.value)} rows={4} className="w-full border border-oio-gold/30 p-3 text-sm" placeholder="Reply to the customer" />
        <button type="submit" className="bg-oio-ink px-5 py-2 text-xs uppercase tracking-[0.16em] text-oio-cream">
          Send reply
        </button>
      </form>
      {notice && <div className="mt-3"><Notice>{notice}</Notice></div>}
      {error && <div className="mt-3"><ErrorState>{error}</ErrorState></div>}
    </div>
  );
}
