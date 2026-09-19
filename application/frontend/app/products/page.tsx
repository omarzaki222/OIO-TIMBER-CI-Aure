"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeleton";
import { fetchCategories, fetchProducts } from "@/services/catalog";
import type { Category, Product } from "@/types/api";

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 12;

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchProducts({ page, page_size: pageSize, category: category || undefined })
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, category]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.short_description || "").toLowerCase().includes(term),
    );
  }, [items, q]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="font-serif text-5xl">Collection</h1>
      <p className="mt-3 max-w-xl text-oio-mute">Published units from the OIO studio. Request a piece — we do not check out online.</p>
      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-end">
        <label className="flex-1 text-xs uppercase tracking-[0.16em]">
          Search this page
          <input value={q} onChange={(e) => setQ(e.target.value)} className="mt-2 w-full border border-oio-gold/30 bg-transparent px-3 py-2 text-sm normal-case tracking-normal" />
        </label>
        <label className="text-xs uppercase tracking-[0.16em]">
          Category
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="mt-2 block border border-oio-gold/30 bg-oio-cream px-3 py-2"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading && <div className="mt-12"><ProductGridSkeleton /></div>}
      {error && <p className="mt-10 text-red-800">Could not load units. Is the API running?</p>}
      {!loading && !error && filtered.length === 0 && <p className="mt-10 text-oio-mute">No published units match.</p>}
      {!loading && filtered.length > 0 && (
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
      {pages > 1 && (
        <div className="mt-12 flex gap-3">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="border px-4 py-2 text-xs uppercase tracking-[0.16em] disabled:opacity-40">
            Previous
          </button>
          <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="border px-4 py-2 text-xs uppercase tracking-[0.16em] disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
