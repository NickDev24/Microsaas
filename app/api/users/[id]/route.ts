import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRoles } from '@/lib/api-auth';
import { validateUserUpdatePayload } from '@/lib/validators';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorizeRoles(['super_admin']);
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const body = await request.json();

    const { isValid, errors } = validateUserUpdatePayload(body);
    if (!isValid) return NextResponse.json({ errors }, { status: 400 });

    const allowedFields = ['full_name', 'role', 'is_active'] as const;
    const updatePayload = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key as (typeof allowedFields)[number]))
    );

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorizeRoles(['super_admin']);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { error } = await supabaseAdmin.from('users').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
