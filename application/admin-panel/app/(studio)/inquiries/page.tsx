"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/Feedback";
import { StatusBadge } from "@/components/Status";
import { ApiRequestError } from "@/lib/api";
import { fetchInquiries } from "@/services/studio";
import type { Inquiry } from "@/types/api";

export default function InquiriesPage() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries()
      .then(setRows)
      .catch((e: unknown) => setError(e instanceof ApiRequestError ? e.message : "Could not load inquiries."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-serif text-4xl">Inquiries</h1>
      {loading && <div className="mt-8"><LoadingState /></div>}
      {error && <div className="mt-8"><ErrorState>{error}</ErrorState></div>}
      {!loading && rows.length === 0 && <div className="mt-8"><EmptyState>No inquiries.</EmptyState></div>}
      <ul className="mt-8 space-y-3">
        {rows.map((i) => (
          <li key={i.id} className="border border-oio-gold/20 p-4">
            <Link href={`/inquiries/${i.id}`} className="font-serif text-2xl hover:text-oio-gold">
              {i.subject}
            </Link>
            <p className="mt-1 text-sm text-oio-mute">{i.guest_email || i.user_id || "Guest"}</p>
            <div className="mt-2">
              <StatusBadge value={i.status} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
