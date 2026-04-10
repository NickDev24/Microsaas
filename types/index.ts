export type UserRole = 'admin_basico' | 'super_admin' | 'customer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  sku: string;
  stock: number;
  low_stock_threshold: number;
  brand?: string;
  sizes: string[];
  colors: string[];
  material?: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  categories?: Category;
  images?: ProductImage[];
  product_images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  public_id: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Promotion {
  id: string;
  product_id: string;
  title: string;
  description?: string;
  discount_percent?: number;
  discount_amount?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface LimitedEdition {
  id: string;
  product_id: string;
  title: string;
  description?: string;
  total_units: number;
  remaining_units: number;
  release_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface SeasonalDiscount {
  id: string;
  product_id: string;
  title: string;
  season: string;
  description?: string;
  discount_percent: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export type OrderStatus = 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';

export interface Order {
  id: string;
  created_by: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  status: OrderStatus;
  total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  size?: string;
  color?: string;
  subtotal: number;
  product?: Product;
}

export interface Sale {
  id: string;
  created_by: string;
  order_id?: string;
  customer_name: string;
  payment_method: string;
  total: number;
  notes?: string;
  sale_date: string;
  created_at: string;
  items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  size?: string;
  color?: string;
  subtotal: number;
  product?: Product;
}

export type InvoiceStatus = 'borrador' | 'emitida' | 'pagada' | 'anulada';

export interface Invoice {
  id: string;
  sale_id: string;
  invoice_number: string;
  customer_name: string;
  customer_tax_id?: string;
  customer_address?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: InvoiceStatus;
  issued_at?: string;
  created_at: string;
}

export interface WebhookLog {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  status_code?: number;
  response_body?: string;
  success: boolean;
  sent_at: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
