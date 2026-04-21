import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { dispatchWebhook } from '@/lib/webhook';
import { WEBHOOK_EVENTS } from '@/lib/constants';
import { authorizeRoles } from '@/lib/api-auth';
import { validateLimitedEditionPayload } from '@/lib/validators';

export async function GET() {
  const { data, error } = await supabase
    .from('limited_editions')
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
    const { isValid, errors } = validateLimitedEditionPayload(body);
    if (!isValid) return NextResponse.json({ errors }, { status: 400 });

    const allowedFields = [
      'product_id',
      'title',
      'description',
      'total_units',
      'remaining_units',
      'release_date',
      'end_date',
      'is_active',
    ] as const;
    const payload = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key as (typeof allowedFields)[number]))
    );

    const { data, error } = await supabaseAdmin
      .from('limited_editions')
      .insert({
        product_id: payload.product_id,
        title: payload.title,
        description: payload.description,
        total_units: payload.total_units,
        remaining_units: payload.remaining_units !== undefined ? payload.remaining_units : payload.total_units,
        release_date: payload.release_date,
        end_date: payload.end_date,
        is_active: payload.is_active ?? true,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // DISPATCH WEBHOOK
    await dispatchWebhook(
      WEBHOOK_EVENTS.LIMITED_EDITION_CREATED,
      'limited_edition',
      data.id,
      data
    );

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
