"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/Feedback";
import { ApiRequestError } from "@/lib/api";
import { fetchCustomers } from "@/services/studio";
import type { User } from "@/types/api";

export default function CustomersPage() {
  const [rows, setRows] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers()
      .then(setRows)
      .catch((e: unknown) => setError(e instanceof ApiRequestError ? e.message : "Could not load customers."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-serif text-4xl">Customers</h1>
      {loading && <div className="mt-8"><LoadingState /></div>}
      {error && <div className="mt-8"><ErrorState>{error}</ErrorState></div>}
      {!loading && rows.length === 0 && <div className="mt-8"><EmptyState>No customers yet.</EmptyState></div>}
      <table className="mt-8 w-full text-left text-sm">
        <thead className="text-[10px] uppercase tracking-[0.16em] text-oio-gold">
          <tr>
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Registered</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-t border-oio-gold/20">
              <td className="py-3">
                <Link href={`/customers/${c.id}`} className="hover:text-oio-gold">
                  {c.first_name || c.last_name ? `${c.first_name || ""} ${c.last_name || ""}`.trim() : "—"}
                </Link>
              </td>
              <td>{c.email}</td>
              <td>{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
              <td>{c.is_active ? "Active" : "Disabled"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
