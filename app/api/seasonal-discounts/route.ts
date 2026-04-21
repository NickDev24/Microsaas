import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { dispatchWebhook } from '@/lib/webhook';
import { WEBHOOK_EVENTS } from '@/lib/constants';
import { authorizeRoles } from '@/lib/api-auth';
import { validateSeasonalDiscountPayload } from '@/lib/validators';

export async function GET() {
  const { data, error } = await supabase
    .from('seasonal_discounts')
    .select('*, product:products(name, sku, price)')
    .eq('is_active', true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin', 'admin_basico']);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { isValid, errors } = validateSeasonalDiscountPayload(body);
    if (!isValid) return NextResponse.json({ errors }, { status: 400 });

    const allowedFields = [
      'product_id',
      'title',
      'season',
      'description',
      'discount_percent',
      'start_date',
      'end_date',
      'is_active',
    ] as const;
    const payload = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key as (typeof allowedFields)[number]))
    );

    const { data, error } = await supabaseAdmin
      .from('seasonal_discounts')
      .insert({
        product_id: payload.product_id,
        title: payload.title,
        season: payload.season,
        description: payload.description,
        discount_percent: payload.discount_percent,
        start_date: payload.start_date,
        end_date: payload.end_date,
        is_active: payload.is_active ?? true,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // DISPATCH WEBHOOK
    await dispatchWebhook(
      WEBHOOK_EVENTS.SEASONAL_DISCOUNT_CREATED,
      'seasonal_discount',
      data.id,
      data
    );

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
