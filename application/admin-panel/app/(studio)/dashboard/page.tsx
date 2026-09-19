"use client";

import { useEffect, useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/Feedback";
import { ApiRequestError } from "@/lib/api";
import { fetchDashboard } from "@/services/studio";
import type { Dashboard } from "@/types/api";

const cards: { key: keyof Dashboard; label: string }[] = [
  { key: "products", label: "Total units" },
  { key: "published_products", label: "Published units" },
  { key: "customers", label: "Customers" },
  { key: "pending_reservations", label: "Pending reservations" },
  { key: "reservations", label: "Total reservations" },
  { key: "open_inquiries", label: "Open inquiries" },
];

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof ApiRequestError ? e.message : "Could not load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-serif text-4xl">Dashboard</h1>
      <p className="mt-2 text-sm text-oio-mute">Atelier overview from the live catalog.</p>
      {loading && <div className="mt-8"><LoadingState /></div>}
      {error && <div className="mt-8"><ErrorState>{error}</ErrorState></div>}
      {!loading && !error && !data && <div className="mt-8"><EmptyState>No metrics yet.</EmptyState></div>}
      {data && (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <li key={c.key} className="border border-oio-gold/20 p-6">
              <p className="text-[10px] uppercase tracking-[0.18em] text-oio-gold">{c.label}</p>
              <p className="mt-3 font-serif text-4xl">{data[c.key]}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
