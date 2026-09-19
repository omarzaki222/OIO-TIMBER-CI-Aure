"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorState, LoadingState, Notice } from "@/components/Feedback";
import { ApiRequestError } from "@/lib/api";
import { fetchCustomer, fetchInquiries, fetchReservations, patchCustomer } from "@/services/studio";
import type { Inquiry, Reservation, User } from "@/types/api";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchCustomer(id), fetchReservations(), fetchInquiries()])
      .then(([u, r, i]) => {
        setUser(u);
        setReservations(r.filter((x) => x.user_id === id));
        setInquiries(i.filter((x) => x.user_id === id));
      })
      .catch((e: unknown) => setError(e instanceof ApiRequestError ? e.message : "Could not load customer."));
  }, [id]);

  if (error) return <ErrorState>{error}</ErrorState>;
  if (!user) return <LoadingState />;

  return (
    <div>
      <h1 className="font-serif text-4xl">{user.first_name} {user.last_name}</h1>
      <dl className="mt-8 space-y-2 text-sm">
        <div><dt className="text-[10px] uppercase tracking-[0.16em] text-oio-gold">Email</dt><dd>{user.email}</dd></div>
        <div><dt className="text-[10px] uppercase tracking-[0.16em] text-oio-gold">Phone</dt><dd>{user.phone || "—"}</dd></div>
        <div><dt className="text-[10px] uppercase tracking-[0.16em] text-oio-gold">Registered</dt><dd>{user.created_at ? new Date(user.created_at).toLocaleString() : "—"}</dd></div>
        <div><dt className="text-[10px] uppercase tracking-[0.16em] text-oio-gold">Status</dt><dd>{user.is_active ? "Active" : "Disabled"}</dd></div>
      </dl>
      <button
        type="button"
        className="mt-6 border border-oio-gold/40 px-4 py-2 text-xs uppercase tracking-[0.16em]"
        onClick={() =>
          patchCustomer(id, !user.is_active)
            .then((u) => {
              setUser(u);
              setNotice(u.is_active ? "Account enabled." : "Account disabled.");
            })
            .catch((e: unknown) => setError(e instanceof ApiRequestError ? e.message : "Update failed."))
        }
      >
        {user.is_active ? "Disable account" : "Enable account"}
      </button>
      {notice && <div className="mt-3"><Notice>{notice}</Notice></div>}
      <h2 className="mt-12 font-serif text-2xl">Reservations</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {reservations.map((r) => (
          <li key={r.id}>
            <Link href={`/reservations/${r.id}`} className="hover:text-oio-gold">
              {r.status}
            </Link>
          </li>
        ))}
        {reservations.length === 0 && <li className="text-oio-mute">None</li>}
      </ul>
      <h2 className="mt-10 font-serif text-2xl">Inquiries</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {inquiries.map((i) => (
          <li key={i.id}>
            <Link href={`/inquiries/${i.id}`} className="hover:text-oio-gold">
              {i.subject}
            </Link>
          </li>
        ))}
        {inquiries.length === 0 && <li className="text-oio-mute">None</li>}
      </ul>
    </div>
  );
}
