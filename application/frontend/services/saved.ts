import { apiGet, apiSend } from "@/lib/api";
import type { SavedUnit } from "@/types/api";

export function fetchSaved() {
  return apiGet<SavedUnit[]>("/api/v1/saved-units", true);
}

export function saveUnit(product_id: string) {
  return apiSend<SavedUnit>("/api/v1/saved-units", "POST", { product_id }, true);
}

export function unsaveUnit(product_id: string) {
  return apiSend<void>(`/api/v1/saved-units/${product_id}`, "DELETE", undefined, true);
}
