import { apiGet, apiSend } from "@/lib/api";
import type { Inquiry, Message } from "@/types/api";

export function createInquiry(body: {
  subject: string;
  message: string;
  email?: string;
  full_name?: string;
}) {
  return apiSend<Inquiry>("/api/v1/inquiries", "POST", body, true);
}

export function fetchInquiries() {
  return apiGet<Inquiry[]>("/api/v1/inquiries", true);
}

export function fetchInquiry(id: string) {
  return apiGet<Inquiry>(`/api/v1/inquiries/${id}`, true);
}

export function fetchInquiryMessages(id: string) {
  return apiGet<Message[]>(`/api/v1/inquiries/${id}/messages`, true);
}

export function sendInquiryMessage(id: string, body: string) {
  return apiSend<Message>(`/api/v1/inquiries/${id}/messages`, "POST", { body }, true);
}
