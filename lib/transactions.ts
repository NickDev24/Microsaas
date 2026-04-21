import { supabaseAdmin } from './supabase';

interface OrderData {
  created_by: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  status?: string;
  total: number;
  notes?: string;
}

interface OrderItemData {
  product_id: string;
  quantity: number;
  unit_price: number;
  size?: string;
  color?: string;
}

interface SaleData {
  created_by: string;
  order_id?: string;
  customer_name: string;
  payment_method?: string;
  total: number;
  notes?: string;
  sale_date?: string;
}

interface SaleItemData {
  product_id: string;
  quantity: number;
  unit_price: number;
  size?: string;
  color?: string;
}

interface StockUpdateData {
  product_id: string;
  quantity: number;
}

interface TransactionResult {
  success: boolean;
  order_id?: string;
  sale_id?: string;
  updated_count?: number;
  error_message?: string;
}

// Order transaction: create order + items atomically
export async function createOrderWithItems(orderData: OrderData, items: OrderItemData[]): Promise<TransactionResult> {
  const { data, error } = await supabaseAdmin.rpc('create_order_with_items', {
    p_order_data: orderData,
    p_items: items
  });
  
  if (error) {
    console.error('Order transaction error:', error);
    throw new Error(error.message);
  }
  
  return data;
}

// Sale transaction: create sale + items + update stock + order status atomically
export async function createSaleWithItems(saleData: SaleData, items: SaleItemData[], orderId?: string): Promise<TransactionResult> {
  const { data, error } = await supabaseAdmin.rpc('create_sale_with_items', {
    p_sale_data: saleData,
    p_items: items,
    p_order_id: orderId
  });
  
  if (error) {
    console.error('Sale transaction error:', error);
    throw new Error(error.message);
  }
  
  return data;
}

// Stock reorder transaction: update multiple product stocks atomically
export async function reorderStockBatch(productUpdates: StockUpdateData[]): Promise<TransactionResult> {
  const { data, error } = await supabaseAdmin.rpc('reorder_stock_batch', {
    p_product_updates: productUpdates
  });
  
  if (error) {
    console.error('Stock reorder transaction error:', error);
    throw new Error(error.message);
  }
  
  return data;
}
