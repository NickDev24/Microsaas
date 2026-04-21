import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRoles } from '@/lib/api-auth';
import { validateSalePayload } from '@/lib/validators';
import { createSaleWithItems } from '@/lib/transactions';

type SaleItemInput = {
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

    // Calculate total server-side if not provided
    const calculatedTotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const finalTotal = salePayload.total || calculatedTotal;

    // Use atomic transaction
    const saleData = {
      created_by: auth.payload.sub,
      order_id: salePayload.order_id ? String(salePayload.order_id) : undefined,
      customer_name: String(salePayload.customer_name || ''),
      payment_method: String(salePayload.payment_method || 'efectivo'),
      total: Number(finalTotal),
      notes: String(salePayload.notes || ''),
      sale_date: String(salePayload.sale_date || new Date().toISOString()),
    };

    const result = await createSaleWithItems(saleData, items, salePayload.order_id as string | undefined);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error_message }, { status: 500 });
    }

    // Fetch the complete sale with items
    const { data: sale, error } = await supabaseAdmin
      .from('sales')
      .select('*, sale_items(*)')
      .eq('id', result.sale_id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error('Sale Create Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
