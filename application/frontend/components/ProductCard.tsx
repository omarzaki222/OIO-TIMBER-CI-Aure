import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/api";
import { productImage } from "@/lib/media";

export function ProductCard({ product }: { product: Product }) {
  const src = productImage(product);
  return (
    <article className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-oio-sand">
          <Image src={src} alt={product.name} fill className="object-cover transition duration-700 group-hover:scale-[1.03]" sizes="(max-width:768px) 100vw, 33vw" />
        </div>
        <h3 className="mt-4 font-serif text-xl text-oio-ink">{product.name}</h3>
        {product.short_description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-oio-mute">{product.short_description}</p>
        )}
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-oio-gold">View unit</p>
      </Link>
    </article>
  );
}
