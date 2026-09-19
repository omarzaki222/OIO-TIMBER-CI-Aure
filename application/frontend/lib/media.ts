import type { Product } from "@/types/api";

const FALLBACK =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80";

export function productImage(product: Product): string {
  const primary = product.images?.find((i) => i.is_primary) || product.images?.[0];
  return primary?.image_url || FALLBACK;
}

export function productGallery(product: Product): string[] {
  const urls = (product.images || [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => i.image_url)
    .filter(Boolean);
  return urls.length ? urls : [FALLBACK];
}
