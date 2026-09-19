"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { fetchProductById } from "@/services/catalog";
import { fetchSaved, unsaveUnit } from "@/services/saved";
import type { Product } from "@/types/api";

export default function SavedPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetchSaved()
      .then(async (list) => {
        const ps: Product[] = [];
        for (const s of list) {
          try {
            ps.push(await fetchProductById(s.product_id));
          } catch {
            /* unpublished */
          }
        }
        setProducts(ps);
      })
      .catch((e: Error) => setError(e.message));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="font-serif text-4xl">Saved units</h1>
      {error && <p className="mt-4">{error}</p>}
      {products.length === 0 && !error && <p className="mt-6 text-oio-mute">Nothing saved yet.</p>}
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        {products.map((p) => (
          <div key={p.id}>
            <ProductCard product={p} />
            <button
              type="button"
              className="mt-2 text-xs uppercase tracking-[0.16em] underline"
              onClick={() => void unsaveUnit(p.id).then(load)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
