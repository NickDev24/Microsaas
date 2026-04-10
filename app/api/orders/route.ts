import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRoles } from '@/lib/api-auth';
import { validateOrderPayload } from '@/lib/validators';

type OrderItemInput = {
  product_id: string;
  quantity: number;
  unit_price: number;
  size?: string;
  color?: string;
};

export async function GET(request: NextRequest) {
  const auth = await authorizeRoles(['super_admin', 'admin_basico']);
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

    // 1. Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        created_by: auth.payload.sub,
        customer_name: orderPayload.customer_name,
        customer_email: orderPayload.customer_email,
        customer_phone: orderPayload.customer_phone,
        customer_address: orderPayload.customer_address,
        status: orderPayload.status || 'pendiente',
        total: orderPayload.total || 0,
        notes: orderPayload.notes,
      })
      .select()
      .single();

    if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

    // 2. Create order items
    const itemsToInsert = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      size: item.size,
      color: item.color,
      subtotal: item.quantity * item.unit_price,
    }));

    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(itemsToInsert);
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order Create Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
