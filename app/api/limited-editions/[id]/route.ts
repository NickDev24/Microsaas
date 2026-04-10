import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { dispatchWebhook } from '@/lib/webhook';
import { WEBHOOK_EVENTS } from '@/lib/constants';
import { authorizeRoles } from '@/lib/api-auth';
import { validateLimitedEditionPayload } from '@/lib/validators';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('limited_editions')
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

    const { isValid, errors } = validateLimitedEditionPayload(body, { partial: true });
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
    const updatePayload = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key as (typeof allowedFields)[number]))
    );

    const { data, error } = await supabaseAdmin
      .from('limited_editions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // DISPATCH WEBHOOK
    await dispatchWebhook(
      WEBHOOK_EVENTS.LIMITED_EDITION_UPDATED,
      'limited_edition',
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
  const { error } = await supabaseAdmin.from('limited_editions').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
