export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
};

export type ProductImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  specifications: Record<string, unknown>;
  dimensions: string | null;
  materials: string | null;
  finish: string | null;
  price: string | number | null;
  price_on_request: boolean;
  status: string;
  is_featured: boolean;
  images: ProductImage[];
};

export type ProductPage = {
  items: Product[];
  page: number;
  page_size: number;
  total: number;
};

export type User = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: string;
  is_active: boolean;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type Reservation = {
  id: string;
  user_id: string;
  product_id: string;
  status: string;
  customer_note: string | null;
  admin_note: string | null;
};

export type Inquiry = {
  id: string;
  user_id: string | null;
  subject: string;
  message: string;
  status: string;
  guest_email: string | null;
  guest_name: string | null;
  created_at?: string | null;
};

export type Message = {
  id: string;
  inquiry_id: string;
  sender_user_id: string | null;
  body: string;
  is_from_admin: boolean;
  is_read: boolean;
  created_at?: string | null;
};

export type SavedUnit = {
  id: string;
  product_id: string;
};

export type ApiError = {
  error?: { code?: string; message?: string };
};
