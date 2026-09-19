"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorState, Notice } from "@/components/Feedback";
import { ApiRequestError } from "@/lib/api";
import { createCategory, fetchCategory, updateCategory } from "@/services/studio";

export function CategoryForm({ id }: { id?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSort] = useState(0);
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchCategory(id)
      .then((c) => {
        setName(c.name);
        setSlug(c.slug);
        setDescription(c.description || "");
        setSort(c.sort_order);
        setActive(c.is_active);
      })
      .catch((e: unknown) => setError(e instanceof ApiRequestError ? e.message : "Could not load category."));
  }, [id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body = { name, slug, description: description || null, is_active: active, sort_order: sortOrder };
    try {
      if (id) {
        await updateCategory(id, body);
        setNotice("Category saved.");
      } else {
        const row = await createCategory(body);
        router.push(`/categories/${row.id}`);
      }
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Save failed.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <h1 className="font-serif text-4xl">{id ? "Edit category" : "New category"}</h1>
      <label className="block text-xs uppercase tracking-[0.16em]">
        Name
        <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full border border-oio-gold/30 px-3 py-2 text-sm normal-case" />
      </label>
      <label className="block text-xs uppercase tracking-[0.16em]">
        Slug
        <input required value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-2 w-full border border-oio-gold/30 px-3 py-2 text-sm normal-case" />
      </label>
      <label className="block text-xs uppercase tracking-[0.16em]">
        Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-2 w-full border border-oio-gold/30 p-3 text-sm normal-case" />
      </label>
      <label className="block text-xs uppercase tracking-[0.16em]">
        Sort order
        <input type="number" value={sortOrder} onChange={(e) => setSort(Number(e.target.value))} className="mt-2 w-full border border-oio-gold/30 px-3 py-2 text-sm" />
      </label>
      <label className="flex items-center gap-2 text-xs uppercase tracking-[0.16em]">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Active
      </label>
      <button type="submit" className="bg-oio-ink px-5 py-2 text-xs uppercase tracking-[0.16em] text-oio-cream">
        Save
      </button>
      {notice && <Notice>{notice}</Notice>}
      {error && <ErrorState>{error}</ErrorState>}
    </form>
  );
}
