"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorState, Notice } from "@/components/Feedback";
import { ApiRequestError } from "@/lib/api";
import { addProductImage, createProduct, deleteProductImage, fetchCategories, fetchProduct, updateProduct } from "@/services/studio";
import type { Category, Product } from "@/types/api";

export function ProductForm({ id }: { id?: string }) {
  const router = useRouter();
  const [cats, setCats] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shortDescription, setShort] = useState("");
  const [description, setDesc] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [materials, setMaterials] = useState("");
  const [finish, setFinish] = useState("");
  const [price, setPrice] = useState("");
  const [priceOnRequest, setPor] = useState(true);
  const [status, setStatus] = useState("DRAFT");
  const [featured, setFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories().then((c) => {
      setCats(c);
      if (!id && c[0]) setCategoryId(c[0].id);
    });
    if (id) {
      fetchProduct(id)
        .then((p) => {
          setProduct(p);
          setName(p.name);
          setSlug(p.slug);
          setCategoryId(p.category_id);
          setShort(p.short_description || "");
          setDesc(p.description || "");
          setDimensions(p.dimensions || "");
          setMaterials(p.materials || "");
          setFinish(p.finish || "");
          setPrice(p.price != null ? String(p.price) : "");
          setPor(p.price_on_request);
          setStatus(p.status);
          setFeatured(p.is_featured);
        })
        .catch((e: unknown) => setError(e instanceof ApiRequestError ? e.message : "Could not load unit."));
    }
  }, [id]);

  function payload() {
    return {
      category_id: categoryId,
      name,
      slug,
      short_description: shortDescription || null,
      description: description || null,
      dimensions: dimensions || null,
      materials: materials || null,
      finish: finish || null,
      price: price ? Number(price) : null,
      price_on_request: priceOnRequest,
      status,
      is_featured: featured,
    };
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (id) {
        const p = await updateProduct(id, payload());
        setProduct(p);
        setNotice("Unit saved.");
      } else {
        const p = await createProduct(payload());
        router.push(`/products/${p.id}`);
      }
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Save failed.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <h1 className="font-serif text-4xl">{id ? "Edit unit" : "New unit"}</h1>
      <label className="block text-xs uppercase tracking-[0.16em]">
        Name
        <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full border border-oio-gold/30 px-3 py-2 text-sm normal-case" />
      </label>
      <label className="block text-xs uppercase tracking-[0.16em]">
        Slug
        <input required value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-2 w-full border border-oio-gold/30 px-3 py-2 text-sm normal-case" />
      </label>
      <label className="block text-xs uppercase tracking-[0.16em]">
        Category
        <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-2 w-full border border-oio-gold/30 px-3 py-2 text-sm normal-case">
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs uppercase tracking-[0.16em]">
        Short description
        <textarea value={shortDescription} onChange={(e) => setShort(e.target.value)} rows={2} className="mt-2 w-full border border-oio-gold/30 p-3 text-sm normal-case" />
      </label>
      <label className="block text-xs uppercase tracking-[0.16em]">
        Description
        <textarea value={description} onChange={(e) => setDesc(e.target.value)} rows={4} className="mt-2 w-full border border-oio-gold/30 p-3 text-sm normal-case" />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-xs uppercase tracking-[0.16em]">
          Dimensions
          <input value={dimensions} onChange={(e) => setDimensions(e.target.value)} className="mt-2 w-full border border-oio-gold/30 px-3 py-2 text-sm normal-case" />
        </label>
        <label className="block text-xs uppercase tracking-[0.16em]">
          Materials
          <input value={materials} onChange={(e) => setMaterials(e.target.value)} className="mt-2 w-full border border-oio-gold/30 px-3 py-2 text-sm normal-case" />
        </label>
        <label className="block text-xs uppercase tracking-[0.16em]">
          Finish
          <input value={finish} onChange={(e) => setFinish(e.target.value)} className="mt-2 w-full border border-oio-gold/30 px-3 py-2 text-sm normal-case" />
        </label>
      </div>
      <label className="block text-xs uppercase tracking-[0.16em]">
        Price
        <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-2 w-full border border-oio-gold/30 px-3 py-2 text-sm normal-case" />
      </label>
      <label className="flex items-center gap-2 text-xs uppercase tracking-[0.16em]">
        <input type="checkbox" checked={priceOnRequest} onChange={(e) => setPor(e.target.checked)} />
        Price on request
      </label>
      <label className="flex items-center gap-2 text-xs uppercase tracking-[0.16em]">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        Featured
      </label>
      <label className="block text-xs uppercase tracking-[0.16em]">
        Status
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full border border-oio-gold/30 px-3 py-2 text-sm">
          {["DRAFT", "PUBLISHED", "ARCHIVED"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="bg-oio-ink px-5 py-2 text-xs uppercase tracking-[0.16em] text-oio-cream">
        Save
      </button>
      {notice && <Notice>{notice}</Notice>}
      {error && <ErrorState>{error}</ErrorState>}
      {id && product && (
        <div className="border-t border-oio-gold/20 pt-6">
          <h2 className="font-serif text-2xl">Images</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {product.images.map((img) => (
              <li key={img.id} className="flex justify-between gap-4">
                <span className="truncate">{img.image_url}</span>
                <button
                  type="button"
                  onClick={() =>
                    void deleteProductImage(id, img.id).then(setProduct).catch((e: unknown) => setError(e instanceof ApiRequestError ? e.message : "Could not remove image."))
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" className="flex-1 border border-oio-gold/30 px-3 py-2 text-sm" />
            <button
              type="button"
              onClick={() => {
                if (!imageUrl) return;
                addProductImage(id, imageUrl)
                  .then((p) => {
                    setProduct(p);
                    setImageUrl("");
                  })
                  .catch((e: unknown) => setError(e instanceof ApiRequestError ? e.message : "Could not add image."));
              }}
              className="border border-oio-gold/40 px-3 py-2 text-xs uppercase tracking-[0.14em]"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
