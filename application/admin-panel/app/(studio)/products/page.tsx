"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ConfirmBar } from "@/components/Confirm";
import { EmptyState, ErrorState, LoadingState, Notice } from "@/components/Feedback";
import { StatusBadge } from "@/components/Status";
import { ApiRequestError } from "@/lib/api";
import { deleteProduct, fetchCategories, fetchProducts, updateProduct } from "@/services/studio";
import type { Category, Product } from "@/types/api";

export default function ProductsPage() {
  const [rows, setRows] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([fetchProducts(), fetchCategories()])
      .then(([p, c]) => {
        setRows(p);
        setCats(c);
      })
      .catch((e: unknown) => setError(e instanceof ApiRequestError ? e.message : "Could not load units."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return rows.filter((r) => {
      if (status && r.status !== status) return false;
      if (term && !`${r.name} ${r.slug}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [rows, q, status]);

  const catName = (id: string) => cats.find((c) => c.id === id)?.name || id;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Units</h1>
          <p className="mt-2 text-sm text-oio-mute">Catalog pieces, drafts included.</p>
        </div>
        <Link href="/products/new" className="bg-oio-ink px-4 py-2 text-xs uppercase tracking-[0.16em] text-oio-cream">
          New unit
        </Link>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or slug" className="border border-oio-gold/30 px-3 py-2 text-sm" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-oio-gold/30 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {["DRAFT", "PUBLISHED", "ARCHIVED"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      {loading && <div className="mt-8"><LoadingState /></div>}
      {error && <div className="mt-8"><ErrorState>{error}</ErrorState></div>}
      {notice && <div className="mt-4"><Notice>{notice}</Notice></div>}
      {!loading && !error && filtered.length === 0 && <div className="mt-8"><EmptyState>No units match.</EmptyState></div>}
      {filtered.length > 0 && (
        <table className="mt-8 w-full text-left text-sm">
          <thead className="text-[10px] uppercase tracking-[0.16em] text-oio-gold">
            <tr>
              <th className="py-2">Name</th>
              <th>Category</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-oio-gold/20">
                <td className="py-3 font-serif text-lg">
                  <Link href={`/products/${r.id}`} className="hover:text-oio-gold">
                    {r.name}
                  </Link>
                </td>
                <td>{catName(r.category_id)}</td>
                <td>
                  <StatusBadge value={r.status} />
                </td>
                <td className="space-x-3 text-xs uppercase tracking-[0.14em]">
                  <button
                    type="button"
                    onClick={() =>
                      void updateProduct(r.id, { status: r.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" }).then(load)
                    }
                  >
                    {r.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                  </button>
                  <button type="button" onClick={() => setPending(r.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <ConfirmBar
        open={!!pending}
        title="Delete this unit?"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return;
          deleteProduct(pending)
            .then(() => {
              setNotice("Unit removed.");
              load();
            })
            .catch((e: unknown) => setError(e instanceof ApiRequestError ? e.message : "Delete failed."))
            .finally(() => setPending(null));
        }}
      />
    </div>
  );
}
