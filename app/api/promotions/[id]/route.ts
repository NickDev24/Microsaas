import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { dispatchWebhook } from '@/lib/webhook';
import { WEBHOOK_EVENTS } from '@/lib/constants';
import { authorizeRoles } from '@/lib/api-auth';
import { validatePromotionPayload } from '@/lib/validators';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('promotions')
    .select('*, product:products(*)')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorizeRoles(['super_admin', 'admin_basico']);
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const body = await request.json();

    const { isValid, errors } = validatePromotionPayload(body, { partial: true });
    if (!isValid) return NextResponse.json({ errors }, { status: 400 });

    const allowedFields = [
      'product_id',
      'title',
      'description',
      'discount_percent',
      'discount_amount',
      'start_date',
      'end_date',
      'is_active',
    ] as const;
    const updatePayload = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key as (typeof allowedFields)[number]))
    );

    const { data, error } = await supabaseAdmin
      .from('promotions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // DISPATCH WEBHOOK
    await dispatchWebhook(
      WEBHOOK_EVENTS.PROMOTION_UPDATED,
      'promotion',
      id,
      data
    );

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorizeRoles(['super_admin', 'admin_basico']);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { error } = await supabaseAdmin.from('promotions').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
