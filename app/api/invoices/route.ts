import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRoles } from '@/lib/api-auth';
import { validateInvoicePayload } from '@/lib/validators';

export async function GET() {
  const auth = await authorizeRoles(['super_admin', 'admin_basico']);
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('*, sale:sales(*)');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin', 'admin_basico']);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { isValid, errors } = validateInvoicePayload(body);
    if (!isValid) return NextResponse.json({ errors }, { status: 400 });

    const allowedFields = ['sale_id', 'customer_tax_id', 'customer_address'] as const;
    const payload = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key as (typeof allowedFields)[number]))
    );

    // 1. Get sale details
    const { data: sale, error: saleError } = await supabaseAdmin
      .from('sales')
      .select('*')
      .eq('id', payload.sale_id)
      .single();

    if (saleError || !sale) return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });

    // 2. Generate invoice number (simple format: FAC-timestamp)
    const invoice_number = `FAC-${Date.now()}`;

    // 3. Calculate taxes (21% default)
    const tax_rate = 21.00;
    const subtotal = sale.total / (1 + tax_rate / 100);
    const tax_amount = sale.total - subtotal;

    // 4. Create invoice
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert({
        sale_id: sale.id,
        invoice_number,
        customer_name: sale.customer_name,
        customer_tax_id: payload.customer_tax_id,
        customer_address: payload.customer_address,
        subtotal,
        tax_rate,
        tax_amount,
        total: sale.total,
        status: 'emitida',
        issued_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (invoiceError) {
      if (invoiceError.code === '23505') return NextResponse.json({ error: 'Esta venta ya tiene una factura' }, { status: 400 });
      return NextResponse.json({ error: invoiceError.message }, { status: 500 });
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
