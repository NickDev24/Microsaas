import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateProduct } from '@/lib/validators';
import { dispatchWebhook } from '@/lib/webhook';
import { WEBHOOK_EVENTS } from '@/lib/constants';
import { authorizeRoles } from '@/lib/api-auth';

type ProductImageInput = {
  url: string;
  public_id: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, categories(name, slug), product_images(*)')
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
    const { isValid, errors } = validateProduct(body);

    if (!isValid) return NextResponse.json({ errors }, { status: 400 });

    // Update product
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .update({
        category_id: body.category_id,
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        compare_at_price: body.compare_at_price,
        sku: body.sku,
        stock: body.stock,
        low_stock_threshold: body.low_stock_threshold,
        brand: body.brand,
        sizes: body.sizes,
        colors: body.colors,
        material: body.material,
        is_active: body.is_active,
        is_featured: body.is_featured,
      })
      .eq('id', id)
      .select()
      .single();

    if (productError) return NextResponse.json({ error: productError.message }, { status: 500 });

    // Handle images if provided (replace all for simplicity in this version)
    if (body.images && Array.isArray(body.images)) {
      // Delete existing images
      await supabaseAdmin.from('product_images').delete().eq('product_id', id);
      
      // Insert new ones
      const images = body.images as ProductImageInput[];
      const imagesToInsert = images.map((img, index: number) => ({
        product_id: id,
        url: img.url,
        public_id: img.public_id,
        sort_order: index,
        is_primary: index === 0,
      }));

      await supabaseAdmin.from('product_images').insert(imagesToInsert);
    }

    // DISPATCH WEBHOOK
    await dispatchWebhook(
      WEBHOOK_EVENTS.PRODUCT_UPDATED,
      'product',
      id,
      { ...product, images: body.images }
    );

    return NextResponse.json(product);
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

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
