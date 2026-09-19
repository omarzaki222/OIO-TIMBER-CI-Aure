"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchProductById } from "@/services/catalog";
import { fetchReservations } from "@/services/reservations";
import type { Product, Reservation } from "@/types/api";

export default function ReservationsPage() {
  const [rows, setRows] = useState<(Reservation & { product?: Product })[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReservations()
      .then(async (list) => {
        const withP = await Promise.all(
          list.map(async (r) => {
            try {
              return { ...r, product: await fetchProductById(r.product_id) };
            } catch {
              return r;
            }
          }),
        );
        setRows(withP);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div>
      <h1 className="font-serif text-4xl">Reservations</h1>
      {error && <p className="mt-4 text-red-800">{error}</p>}
      {rows.length === 0 && !error && <p className="mt-6 text-oio-mute">No requests yet.</p>}
      <ul className="mt-8 space-y-6">
        {rows.map((r) => (
          <li key={r.id} className="border border-oio-gold/20 p-6">
            <p className="font-serif text-2xl">{r.product?.name || r.product_id}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-oio-gold">{r.status}</p>
            {r.customer_note && <p className="mt-3 text-sm text-oio-mute">{r.customer_note}</p>}
            {r.product && (
              <Link href={`/products/${r.product.slug}`} className="mt-3 inline-block text-xs uppercase tracking-[0.16em] underline">
                View unit
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
