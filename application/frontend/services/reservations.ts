import { apiGet, apiSend } from "@/lib/api";
import type { Reservation } from "@/types/api";

export function fetchReservations() {
  return apiGet<Reservation[]>("/api/v1/reservations", true);
}

export function createReservation(product_id: string, customer_note?: string) {
  return apiSend<Reservation>(
    "/api/v1/reservations",
    "POST",
    { product_id, customer_note: customer_note || null },
    true,
  );
}
