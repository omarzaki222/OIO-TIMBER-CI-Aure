import type { Metadata } from "next";
import Link from "next/link";
import { fetchCategories } from "@/services/catalog";

export const metadata: Metadata = { title: "Categories", description: "OIO furniture collections." };

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof fetchCategories>> = [];
  try {
    categories = await fetchCategories();
  } catch {
    categories = [];
  }
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="font-serif text-5xl">Categories</h1>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {categories.map((c) => (
          <Link key={c.id} href={`/categories/${c.slug}`} className="border border-oio-gold/20 p-10 hover:border-oio-gold">
            <h2 className="font-serif text-3xl">{c.name}</h2>
            {c.description && <p className="mt-3 text-oio-mute">{c.description}</p>}
          </Link>
        ))}
        {categories.length === 0 && <p className="text-oio-mute">No categories yet.</p>}
      </div>
    </div>
  );
}
