import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { fetchCategories, fetchProducts } from "@/services/catalog";

export const metadata = {
  title: "Atelier",
  description: "OIO Wood & Timber — furniture composed for quiet interiors.",
};

const HERO =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80";
const EDITORIAL =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=80";

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof fetchCategories>> = [];
  let featured: Awaited<ReturnType<typeof fetchProducts>>["items"] = [];
  try {
    categories = await fetchCategories();
  } catch {
    categories = [];
  }
  try {
    const page = await fetchProducts({ featured: true, page_size: 6 });
    featured = page.items.length ? page.items : (await fetchProducts({ page_size: 6 })).items;
  } catch {
    featured = [];
  }

  return (
    <>
      <section className="relative min-h-[80vh]">
        <Image src={HERO} alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-oio-ink/40" />
        <div className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-end px-4 pb-20 md:px-6">
          <p className="text-xs uppercase tracking-[0.4em] text-oio-gold">OIO Wood &amp; Timber</p>
          <h1 className="mt-4 max-w-2xl font-serif text-5xl text-oio-cream md:text-7xl">Pieces for measured rooms.</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-oio-cream/80">
            Furniture presented as architecture: proportion, grain, and stillness. Request a unit for your space.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/products" className="bg-oio-gold px-6 py-3 text-xs uppercase tracking-[0.22em] text-oio-ink">
              Explore Collection
            </Link>
            <Link href="/contact" className="border border-oio-cream/60 px-6 py-3 text-xs uppercase tracking-[0.22em] text-oio-cream">
              Request a Unit
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-oio-gold">Collections</p>
        <h2 className="mt-2 font-serif text-4xl">Featured categories</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(categories.length ? categories : [{ slug: "bedrooms", name: "Bedrooms", id: "x", description: null, sort_order: 0 }]).map(
            (c) => (
              <Link key={c.slug} href={`/categories/${c.slug}`} className="border border-oio-gold/20 p-8 hover:border-oio-gold">
                <span className="font-serif text-2xl">{c.name}</span>
              </Link>
            ),
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-oio-gold">Selected units</p>
        <h2 className="mt-2 font-serif text-4xl">Featured pieces</h2>
        {featured.length === 0 ? (
          <p className="mt-8 text-oio-mute">No published units yet. Start the API and seed data to preview the collection.</p>
        ) : (
          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 md:grid-cols-2 md:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-oio-gold">Philosophy</p>
          <h2 className="mt-2 font-serif text-4xl">Wood, held in proportion.</h2>
          <p className="mt-6 leading-relaxed text-oio-mute">
            OIO presents furniture as a quiet companion to architecture. Each unit is documented, not merchandised. When a piece belongs in your space, you request it — we respond as a studio, not a cart.
          </p>
        </div>
        <div className="relative aspect-[4/5]">
          <Image src={EDITORIAL} alt="Interior seating" fill className="object-cover" />
        </div>
      </section>

      <section className="bg-oio-ink px-4 py-24 text-center text-oio-cream">
        <h2 className="font-serif text-4xl md:text-5xl">Find the piece for your space</h2>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/products" className="bg-oio-gold px-6 py-3 text-xs uppercase tracking-[0.22em] text-oio-ink">
            Explore Collection
          </Link>
          <Link href="/contact" className="border border-oio-gold px-6 py-3 text-xs uppercase tracking-[0.22em] text-oio-gold">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
