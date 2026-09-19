import { apiGet } from "@/lib/api";
import type { Category, Product, ProductPage } from "@/types/api";

export function fetchCategories() {
  return apiGet<Category[]>("/api/v1/categories");
}

export function fetchProducts(params: { page?: number; page_size?: number; category?: string; featured?: boolean } = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.page_size) q.set("page_size", String(params.page_size));
  if (params.category) q.set("category", params.category);
  if (params.featured) q.set("featured", "true");
  const qs = q.toString();
  return apiGet<ProductPage>(`/api/v1/products${qs ? `?${qs}` : ""}`);
}

export function fetchProductBySlug(slug: string) {
  return apiGet<Product>(`/api/v1/products/slug/${encodeURIComponent(slug)}`);
}

export function fetchProductById(id: string) {
  return apiGet<Product>(`/api/v1/products/${id}`);
}
