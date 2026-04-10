import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRoles } from '@/lib/api-auth';
import { validateSalePayload } from '@/lib/validators';

type SaleItemInput = {
  product_id: string;
  quantity: number;
  unit_price: number;
  size?: string;
  color?: string;
};

export async function GET() {
  const auth = await authorizeRoles(['super_admin', 'admin_basico']);
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseAdmin
    .from('sales')
    .select('*, sale_items(*, product:products(name, sku, price))')
    .order('sale_date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin', 'admin_basico']);
    if (!auth.ok) return auth.response;
    
    const body = await request.json();
    const { isValid, errors } = validateSalePayload(body);
    if (!isValid) return NextResponse.json({ errors }, { status: 400 });

    const allowedSaleFields = [
      'order_id',
      'customer_name',
      'payment_method',
      'total',
      'notes',
      'sale_date',
    ] as const;

    const salePayload = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedSaleFields.includes(key as (typeof allowedSaleFields)[number]))
    );

    const items = Array.isArray(body.items) ? (body.items as SaleItemInput[]) : [];

    // 1. Create sale
    const { data: sale, error: saleError } = await supabaseAdmin
      .from('sales')
      .insert({
        created_by: auth.payload.sub,
        order_id: salePayload.order_id,
        customer_name: salePayload.customer_name,
        payment_method: salePayload.payment_method || 'efectivo',
        total: salePayload.total,
        notes: salePayload.notes,
        sale_date: salePayload.sale_date || new Date().toISOString(),
      })
      .select()
      .single();

    if (saleError) return NextResponse.json({ error: saleError.message }, { status: 500 });

    // 2. Create sale items
    const itemsToInsert = items.map((item) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      size: item.size,
      color: item.color,
      subtotal: item.quantity * item.unit_price,
    }));

    const { error: itemsError } = await supabaseAdmin.from('sale_items').insert(itemsToInsert);
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

    // 3. Update stock (Manual decrement on sale)
    for (const item of items) {
      await supabaseAdmin.rpc('decrement_stock', { 
        p_id: item.product_id, 
        p_qty: item.quantity 
      });
    }

    // 4. Update order status if order_id is provided
    if (salePayload.order_id) {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'entregado' })
        .eq('id', salePayload.order_id);
    }

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error('Sale Create Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
