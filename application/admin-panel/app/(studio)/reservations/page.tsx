"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/Feedback";
import { StatusBadge } from "@/components/Status";
import { ApiRequestError } from "@/lib/api";
import { fetchReservations } from "@/services/studio";
import type { Reservation } from "@/types/api";

export default function ReservationsPage() {
  const [rows, setRows] = useState<Reservation[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations()
      .then(setRows)
      .catch((e: unknown) => setError(e instanceof ApiRequestError ? e.message : "Could not load reservations."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => (status ? rows.filter((r) => r.status === status) : rows), [rows, status]);

  return (
    <div>
      <h1 className="font-serif text-4xl">Reservations</h1>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-6 border border-oio-gold/30 px-3 py-2 text-sm">
        <option value="">All statuses</option>
        {["PENDING", "CONTACTED", "CONFIRMED", "CANCELLED", "COMPLETED"].map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      {loading && <div className="mt-8"><LoadingState /></div>}
      {error && <div className="mt-8"><ErrorState>{error}</ErrorState></div>}
      {!loading && filtered.length === 0 && <div className="mt-8"><EmptyState>No reservation requests.</EmptyState></div>}
      <ul className="mt-8 space-y-3">
        {filtered.map((r) => (
          <li key={r.id} className="border border-oio-gold/20 p-4">
            <Link href={`/reservations/${r.id}`} className="font-serif text-xl hover:text-oio-gold">
              Request {r.id.slice(0, 8)}
            </Link>
            <div className="mt-2">
              <StatusBadge value={r.status} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
