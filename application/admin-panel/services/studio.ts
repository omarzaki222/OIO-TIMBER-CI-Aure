import { apiGet, apiSend } from "@/lib/api";
import type {
  Category,
  Dashboard,
  Inquiry,
  Message,
  Product,
  ProductWrite,
  Reservation,
  User,
} from "@/types/api";

export const fetchDashboard = () => apiGet<Dashboard>("/api/v1/admin/dashboard");

export const fetchCategories = () => apiGet<Category[]>("/api/v1/admin/categories");
export const fetchCategory = (id: string) => apiGet<Category>(`/api/v1/admin/categories/${id}`);
export const createCategory = (body: Omit<Category, "id">) =>
  apiSend<Category>("/api/v1/admin/categories", "POST", body);
export const updateCategory = (id: string, body: Omit<Category, "id">) =>
  apiSend<Category>(`/api/v1/admin/categories/${id}`, "PATCH", body);
export const deleteCategory = (id: string) => apiSend<void>(`/api/v1/admin/categories/${id}`, "DELETE");

export const fetchProducts = () => apiGet<Product[]>("/api/v1/admin/products");
export const fetchProduct = (id: string) => apiGet<Product>(`/api/v1/admin/products/${id}`);
export const createProduct = (body: ProductWrite) => apiSend<Product>("/api/v1/admin/products", "POST", body);
export const updateProduct = (id: string, body: Partial<ProductWrite>) =>
  apiSend<Product>(`/api/v1/admin/products/${id}`, "PATCH", body);
export const deleteProduct = (id: string) => apiSend<void>(`/api/v1/admin/products/${id}`, "DELETE");
export const addProductImage = (id: string, image_url: string, alt_text?: string) =>
  apiSend<Product>(`/api/v1/admin/products/${id}/images`, "POST", { image_url, alt_text, is_primary: false });
export const deleteProductImage = (productId: string, imageId: string) =>
  apiSend<Product>(`/api/v1/admin/products/${productId}/images/${imageId}`, "DELETE");

export const fetchCustomers = () => apiGet<User[]>("/api/v1/admin/customers");
export const fetchCustomer = (id: string) => apiGet<User>(`/api/v1/admin/customers/${id}`);
export const patchCustomer = (id: string, is_active: boolean) =>
  apiSend<User>(`/api/v1/admin/customers/${id}`, "PATCH", { is_active });

export const fetchReservations = () => apiGet<Reservation[]>("/api/v1/admin/reservations");
export const fetchReservation = (id: string) => apiGet<Reservation>(`/api/v1/admin/reservations/${id}`);
export const patchReservation = (id: string, body: { status?: string; admin_note?: string }) =>
  apiSend<Reservation>(`/api/v1/admin/reservations/${id}`, "PATCH", body);

export const fetchInquiries = () => apiGet<Inquiry[]>("/api/v1/admin/inquiries");
export const fetchInquiry = (id: string) => apiGet<Inquiry>(`/api/v1/admin/inquiries/${id}`);
export const patchInquiry = (id: string, status: string) =>
  apiSend<Inquiry>(`/api/v1/admin/inquiries/${id}`, "PATCH", { status });
export const fetchInquiryMessages = (inquiryId: string) =>
  apiGet<Message[]>(`/api/v1/admin/messages?inquiry_id=${encodeURIComponent(inquiryId)}`);
export const replyInquiry = (id: string, body: string) =>
  apiSend<Message>(`/api/v1/admin/inquiries/${id}/messages`, "POST", { body });
