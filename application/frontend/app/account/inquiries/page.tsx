"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiRequestError } from "@/lib/api";
import {
  createInquiry,
  fetchInquiries,
  fetchInquiry,
  fetchInquiryMessages,
  sendInquiryMessage,
} from "@/services/inquiries";
import type { Inquiry, Message } from "@/types/api";

export default function InquiriesPage() {
  const router = useRouter();
  const [list, setList] = useState<Inquiry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState("Studio inquiry");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const onAuthExpired = useCallback(
    (err: unknown) => {
      if (err instanceof ApiRequestError && err.status === 401) {
        router.replace("/login");
        return true;
      }
      return false;
    },
    [router],
  );

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchInquiries();
      setList(rows);
    } catch (err) {
      if (onAuthExpired(err)) return;
      setError(err instanceof ApiRequestError ? err.message : "Could not load inquiries.");
    } finally {
      setLoading(false);
    }
  }, [onAuthExpired]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }
    setThreadLoading(true);
    Promise.all([fetchInquiry(selected), fetchInquiryMessages(selected)])
      .then(([, msgs]) => setMessages(msgs))
      .catch((err: unknown) => {
        if (onAuthExpired(err)) return;
        setNotice(err instanceof ApiRequestError ? err.message : "Could not load thread.");
      })
      .finally(() => setThreadLoading(false));
  }, [selected, onAuthExpired]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setNotice(null);
    try {
      const row = await createInquiry({ subject, message });
      setMessage("");
      setNotice("Inquiry sent.");
      await loadList();
      setSelected(row.id);
    } catch (err) {
      if (onAuthExpired(err)) return;
      setNotice(err instanceof ApiRequestError ? err.message : "Failed to send.");
    }
  }

  async function onReply(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    try {
      const msg = await sendInquiryMessage(selected, reply);
      setMessages((m) => [...m, msg]);
      setReply("");
    } catch (err) {
      if (onAuthExpired(err)) return;
      setNotice(err instanceof ApiRequestError ? err.message : "Could not send message.");
    }
  }

  return (
    <div>
      <h1 className="font-serif text-4xl">Inquiries</h1>
      {loading && <p className="mt-6 text-sm text-oio-mute">Loading inquiries…</p>}
      {error && <p className="mt-6 text-sm text-red-800">{error}</p>}
      {!loading && !error && list.length === 0 && (
        <p className="mt-6 text-oio-mute">No inquiries yet. Write to the studio below.</p>
      )}
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <ul className="space-y-3">
          {list.map((inq) => (
            <li key={inq.id}>
              <button
                type="button"
                onClick={() => setSelected(inq.id)}
                className={`w-full border px-4 py-3 text-left ${selected === inq.id ? "border-oio-gold" : "border-oio-gold/20"}`}
              >
                <p className="font-serif text-xl">{inq.subject}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-oio-gold">{inq.status}</p>
              </button>
            </li>
          ))}
        </ul>
        <div>
          {selected && (
            <div className="border border-oio-gold/20 p-4">
              {threadLoading && <p className="text-sm text-oio-mute">Loading thread…</p>}
              <ul className="space-y-3 text-sm">
                {messages.map((m) => (
                  <li key={m.id} className={m.is_from_admin ? "text-oio-gold" : ""}>
                    <p className="text-[10px] uppercase tracking-[0.16em]">
                      {m.is_from_admin ? "Studio" : "You"}
                    </p>
                    <p className="mt-1">{m.body}</p>
                  </li>
                ))}
              </ul>
              <form onSubmit={onReply} className="mt-4 space-y-2">
                <textarea
                  required
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={3}
                  className="w-full border p-2 text-sm"
                  placeholder="Write a reply"
                />
                <button type="submit" className="bg-oio-ink px-4 py-2 text-xs uppercase tracking-[0.16em] text-oio-cream">
                  Send message
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      <form onSubmit={onCreate} className="mt-12 max-w-lg space-y-4">
        <h2 className="font-serif text-2xl">New inquiry</h2>
        <label className="block text-xs uppercase tracking-[0.16em]">
          Subject
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-2 w-full border px-3 py-2 text-sm normal-case" />
        </label>
        <label className="block text-xs uppercase tracking-[0.16em]">
          Message
          <textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="mt-2 w-full border p-3 text-sm normal-case tracking-normal" />
        </label>
        <button type="submit" className="bg-oio-ink px-5 py-2 text-xs uppercase tracking-[0.2em] text-oio-cream">
          Send
        </button>
      </form>
      {notice && <p className="mt-4 text-sm">{notice}</p>}
    </div>
  );
}
