import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { validateCategory } from '@/lib/validators';
import { authorizeRoles } from '@/lib/api-auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('categories')
    .select('*')
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
    const { isValid, errors } = validateCategory(body);

    if (!isValid) return NextResponse.json({ errors }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({
        name: body.name,
        slug: body.slug,
        description: body.description,
        image_url: body.image_url,
        sort_order: body.sort_order,
        is_active: body.is_active,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorizeRoles(['super_admin', 'admin_basico']);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    if (error.code === '23503') return NextResponse.json({ error: 'No se puede eliminar una categoría que tiene productos asociados' }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
