"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ErrorState, LoadingState, Notice } from "@/components/Feedback";
import { ApiRequestError } from "@/lib/api";
import { fetchCustomer, fetchProduct, fetchReservation, patchReservation } from "@/services/studio";
import type { Product, Reservation, User } from "@/types/api";

export default function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [row, setRow] = useState<Reservation | null>(null);
  const [customer, setCustomer] = useState<User | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchReservation(id)
      .then(async (r) => {
        setRow(r);
        setStatus(r.status);
        setNote(r.admin_note || "");
        const [c, p] = await Promise.all([
          fetchCustomer(r.user_id).catch(() => null),
          fetchProduct(r.product_id).catch(() => null),
        ]);
        setCustomer(c);
        setProduct(p);
      })
      .catch((e: unknown) => setError(e instanceof ApiRequestError ? e.message : "Could not load reservation."));
  }, [id]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    try {
      const next = await patchReservation(id, { status, admin_note: note });
      setRow(next);
      setNotice("Reservation updated.");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Update failed.");
    }
  }

  if (error) return <ErrorState>{error}</ErrorState>;
  if (!row) return <LoadingState />;

  return (
    <div>
      <h1 className="font-serif text-4xl">Reservation</h1>
      <p className="mt-2 text-sm text-oio-mute">{row.id}</p>
      <dl className="mt-8 space-y-3 text-sm">
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-oio-gold">Customer</dt>
          <dd>
            {customer ? (
              <Link href={`/customers/${customer.id}`} className="underline">
                {customer.email}
              </Link>
            ) : (
              row.user_id
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-oio-gold">Unit</dt>
          <dd>
            {product ? (
              <Link href={`/products/${product.id}`} className="underline">
                {product.name}
              </Link>
            ) : (
              row.product_id
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-oio-gold">Customer note</dt>
          <dd>{row.customer_note || "—"}</dd>
        </div>
      </dl>
      <form onSubmit={onSave} className="mt-8 max-w-lg space-y-4">
        <label className="block text-xs uppercase tracking-[0.16em]">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full border border-oio-gold/30 px-3 py-2 text-sm">
            {["PENDING", "CONTACTED", "CONFIRMED", "CANCELLED", "COMPLETED"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="block text-xs uppercase tracking-[0.16em]">
          Studio note
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="mt-2 w-full border border-oio-gold/30 p-3 text-sm normal-case" />
        </label>
        <button type="submit" className="bg-oio-ink px-5 py-2 text-xs uppercase tracking-[0.16em] text-oio-cream">
          Save
        </button>
      </form>
      {notice && <div className="mt-4"><Notice>{notice}</Notice></div>}
    </div>
  );
}
