import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { validateCategory } from '@/lib/validators';
import { authorizeRoles } from '@/lib/api-auth';

export async function GET() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin', 'admin_basico']);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { isValid, errors } = validateCategory(body);

    if (!isValid) return NextResponse.json({ errors }, { status: 400 });

    // Auto-generate slug if not provided
    const slug = body.slug || body.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name: body.name,
        slug,
        description: body.description,
        image_url: body.image_url,
        sort_order: body.sort_order || 0,
        is_active: body.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'La categoría o slug ya existe' }, { status: 400 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
