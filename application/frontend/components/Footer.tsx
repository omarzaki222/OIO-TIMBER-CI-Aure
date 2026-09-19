import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-oio-gold/25 bg-oio-ink text-oio-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-serif text-xl tracking-[0.2em]">OIO WOOD &amp; TIMBER</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-oio-cream/70">
            Furniture composed for quiet interiors. Craft, proportion, and material first.
          </p>
        </div>
        <div className="text-sm uppercase tracking-[0.16em]">
          <p className="mb-3 text-oio-gold">Navigate</p>
          <ul className="space-y-2 text-oio-cream/80">
            <li>
              <Link href="/products">Collection</Link>
            </li>
            <li>
              <Link href="/categories">Categories</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 uppercase tracking-[0.16em] text-oio-gold">Contact</p>
          <p className="text-oio-cream/80">studio@oiowood.example</p>
          <p className="mt-4 uppercase tracking-[0.16em] text-oio-cream/50">Instagram · Pinterest · Atelier</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs tracking-[0.18em] text-oio-cream/40">
        © {new Date().getFullYear()} OIO Wood &amp; Timber
      </div>
    </footer>
  );
}
