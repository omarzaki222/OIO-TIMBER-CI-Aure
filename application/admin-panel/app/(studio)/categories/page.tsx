"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ConfirmBar } from "@/components/Confirm";
import { EmptyState, ErrorState, LoadingState } from "@/components/Feedback";
import { ApiRequestError } from "@/lib/api";
import { deleteCategory, fetchCategories } from "@/services/studio";
import type { Category } from "@/types/api";

export default function CategoriesPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetchCategories()
      .then(setRows)
      .catch((e: unknown) => setError(e instanceof ApiRequestError ? e.message : "Could not load categories."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex items-end justify-between">
        <h1 className="font-serif text-4xl">Categories</h1>
        <Link href="/categories/new" className="bg-oio-ink px-4 py-2 text-xs uppercase tracking-[0.16em] text-oio-cream">
          New
        </Link>
      </div>
      {loading && <div className="mt-8"><LoadingState /></div>}
      {error && <div className="mt-8"><ErrorState>{error}</ErrorState></div>}
      {!loading && rows.length === 0 && <div className="mt-8"><EmptyState>No categories.</EmptyState></div>}
      <ul className="mt-8 divide-y border-y border-oio-gold/20">
        {rows.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-4">
            <div>
              <Link href={`/categories/${c.id}`} className="font-serif text-2xl hover:text-oio-gold">
                {c.name}
              </Link>
              <p className="text-xs uppercase tracking-[0.14em] text-oio-mute">{c.slug}</p>
            </div>
            <button type="button" onClick={() => setPending(c.id)} className="text-xs uppercase tracking-[0.14em]">
              Delete
            </button>
          </li>
        ))}
      </ul>
      <ConfirmBar
        open={!!pending}
        title="Delete this category?"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return;
          deleteCategory(pending)
            .then(load)
            .catch((e: unknown) => setError(e instanceof ApiRequestError ? e.message : "Delete failed."))
            .finally(() => setPending(null));
        }}
      />
    </div>
  );
}
