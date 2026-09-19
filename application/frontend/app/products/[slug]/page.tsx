"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/hooks/auth-context";
import { ApiRequestError } from "@/lib/api";
import { productGallery } from "@/lib/media";
import { fetchProductBySlug } from "@/services/catalog";
import { createReservation } from "@/services/reservations";
import { saveUnit } from "@/services/saved";
import type { Product } from "@/types/api";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchProductBySlug(slug)
      .then((p) => {
        setProduct(p);
        setError(null);
      })
      .catch(() => setError("Unit not found or unpublished."));
  }, [slug]);

  if (error) return <p className="px-4 py-24 text-center text-oio-mute">{error}</p>;
  if (!product) return <p className="px-4 py-24 text-center text-oio-mute">Loading unit…</p>;

  const gallery = productGallery(product);

  async function onReserve(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push(`/login?next=/products/${slug}`);
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await createReservation(product!.id, note);
      setMsg("Request received. We will be in touch. See My Reservations.");
    } catch (err) {
      setMsg(err instanceof ApiRequestError ? err.message : "Could not submit request.");
    } finally {
      setBusy(false);
    }
  }

  async function onSave() {
    if (!user) {
      router.push(`/login?next=/products/${slug}`);
      return;
    }
    try {
      await saveUnit(product!.id);
      setMsg("Saved to your collection.");
    } catch (err) {
      setMsg(err instanceof ApiRequestError ? err.message : "Could not save.");
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2 md:px-6">
      <div>
        <div className="relative aspect-[4/5] bg-oio-sand">
          <Image src={gallery[active]} alt={product.name} fill className="object-cover" />
        </div>
        {gallery.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {gallery.map((src, i) => (
              <button key={src + i} type="button" onClick={() => setActive(i)} className="relative h-20 w-16 shrink-0">
                <Image src={src} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-oio-gold">Furniture unit</p>
        <h1 className="mt-2 font-serif text-5xl">{product.name}</h1>
        {product.short_description && <p className="mt-4 text-lg text-oio-mute">{product.short_description}</p>}
        {product.description && <p className="mt-6 leading-relaxed">{product.description}</p>}
        <dl className="mt-8 space-y-2 text-sm">
          {product.dimensions && (
            <div>
              <dt className="uppercase tracking-[0.16em] text-oio-gold">Dimensions</dt>
              <dd>{product.dimensions}</dd>
            </div>
          )}
          {product.materials && (
            <div>
              <dt className="uppercase tracking-[0.16em] text-oio-gold">Materials</dt>
              <dd>{product.materials}</dd>
            </div>
          )}
          {product.finish && (
            <div>
              <dt className="uppercase tracking-[0.16em] text-oio-gold">Finish</dt>
              <dd>{product.finish}</dd>
            </div>
          )}
          {product.price_on_request ? (
            <dd className="pt-2 text-oio-mute">Price on request</dd>
          ) : product.price != null ? (
            <dd className="pt-2">{String(product.price)}</dd>
          ) : null}
        </dl>
        <form onSubmit={onReserve} className="mt-10 space-y-4">
          <label className="block text-xs uppercase tracking-[0.16em]">
            Note for the studio
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-2 w-full border border-oio-gold/30 bg-transparent p-3 text-sm normal-case tracking-normal" rows={3} />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy} className="bg-oio-ink px-6 py-3 text-xs uppercase tracking-[0.2em] text-oio-cream disabled:opacity-50">
              Request This Unit
            </button>
            <button type="button" onClick={() => void onSave()} className="border border-oio-ink px-6 py-3 text-xs uppercase tracking-[0.2em]">
              Save unit
            </button>
            <Link href="/contact" className="px-6 py-3 text-xs uppercase tracking-[0.2em] underline">
              Inquiry
            </Link>
          </div>
        </form>
        {msg && (
          <p className="mt-4 text-sm" role="status">
            {msg} {msg.includes("Reservations") || msg.includes("received") ? <Link href="/account/reservations">My Reservations</Link> : null}
          </p>
        )}
      </div>
    </div>
  );
}
