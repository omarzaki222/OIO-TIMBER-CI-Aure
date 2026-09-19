import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { fetchCategories, fetchProducts } from "@/services/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cats = await fetchCategories().catch(() => []);
  const cat = cats.find((c) => c.slug === slug);
  return { title: cat?.name || "Category", description: cat?.description || "OIO collection" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cats = await fetchCategories().catch(() => []);
  const cat = cats.find((c) => c.slug === slug);
  const page = await fetchProducts({ category: slug, page_size: 24 }).catch(() => ({ items: [], total: 0, page: 1, page_size: 24 }));
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="font-serif text-5xl">{cat?.name || slug}</h1>
      {page.items.length === 0 ? (
        <p className="mt-8 text-oio-mute">No published units in this collection.</p>
      ) : (
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {page.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
