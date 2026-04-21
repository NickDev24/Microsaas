import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRoles } from '@/lib/api-auth';
import { validateOrderPayload } from '@/lib/validators';
import { createOrderWithItems } from '@/lib/transactions';

type OrderItemInput = {
  product_id: string;
  quantity: number;
  unit_price: number;
  size?: string;
  color?: string;
};

export async function GET() {
  const auth = await authorizeRoles(['admin', 'super_admin', 'admin_basico']);
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*, product:products(name, sku, price))')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin', 'admin_basico']);
    if (!auth.ok) return auth.response;
    
    const body = await request.json();
    const { isValid, errors } = validateOrderPayload(body);
    if (!isValid) return NextResponse.json({ errors }, { status: 400 });

    const allowedOrderFields = [
      'customer_name',
      'customer_email',
      'customer_phone',
      'customer_address',
      'status',
      'total',
      'notes',
    ] as const;

    const orderPayload = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedOrderFields.includes(key as (typeof allowedOrderFields)[number]))
    );

    const items = Array.isArray(body.items) ? (body.items as OrderItemInput[]) : [];

    // Calculate total server-side if not provided
    const calculatedTotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const finalTotal = orderPayload.total || calculatedTotal;

    // Use atomic transaction
    const orderData = {
      created_by: auth.payload.sub,
      customer_name: String(orderPayload.customer_name || ''),
      customer_email: String(orderPayload.customer_email || ''),
      customer_phone: String(orderPayload.customer_phone || ''),
      customer_address: String(orderPayload.customer_address || ''),
      status: String(orderPayload.status || 'pendiente'),
      total: Number(finalTotal),
      notes: String(orderPayload.notes || ''),
    };

    const result = await createOrderWithItems(orderData, items);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error_message }, { status: 500 });
    }

    // Fetch the complete order with items
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', result.order_id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order Create Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
