import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { validateProduct } from '@/lib/validators';
import { dispatchWebhook } from '@/lib/webhook';
import { WEBHOOK_EVENTS } from '@/lib/constants';
import { authorizeRoles } from '@/lib/api-auth';

type ProductImageInput = {
  url: string;
  public_id: string;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category_id');
  const isFeatured = searchParams.get('is_featured');
  const query = searchParams.get('q');

  let dbQuery = supabase
    .from('products')
    .select('*, categories(name, slug), product_images(*)');

  if (categoryId) dbQuery = dbQuery.eq('category_id', categoryId);
  if (isFeatured === 'true') dbQuery = dbQuery.eq('is_featured', true);
  if (query) dbQuery = dbQuery.ilike('name', `%${query}%`);

  const { data, error } = await dbQuery.order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin', 'admin_basico']);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { isValid, errors } = validateProduct(body);

    if (!isValid) return NextResponse.json({ errors }, { status: 400 });

    const slug = body.slug || body.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .insert({
        category_id: body.category_id,
        name: body.name,
        slug,
        description: body.description,
        price: body.price,
        compare_at_price: body.compare_at_price,
        sku: body.sku,
        stock: body.stock,
        low_stock_threshold: body.low_stock_threshold || 5,
        brand: body.brand,
        sizes: body.sizes || [],
        colors: body.colors || [],
        material: body.material,
        is_active: body.is_active ?? true,
        is_featured: body.is_featured ?? false,
      })
      .select()
      .single();

    if (productError) {
      if (productError.code === '23505') return NextResponse.json({ error: 'El SKU o slug ya existe' }, { status: 400 });
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    // Handle images if provided
    if (body.images && Array.isArray(body.images)) {
      const images = body.images as ProductImageInput[];
      const imagesToInsert = images.map((img, index: number) => ({
        product_id: product.id,
        url: img.url,
        public_id: img.public_id,
        sort_order: index,
        is_primary: index === 0,
      }));

      await supabaseAdmin.from('product_images').insert(imagesToInsert);
    }

    // DISPATCH WEBHOOK to N8N
    // Note: In a real scenario, you might want to fetch binary data from Cloudinary URLs 
    // if you want to send actual files to N8N, or handle it during form submission.
    // For this implementation, we'll send the JSON data.
    await dispatchWebhook(
      WEBHOOK_EVENTS.PRODUCT_CREATED,
      'product',
      product.id,
      { ...product, images: body.images }
    );

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product Create Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
