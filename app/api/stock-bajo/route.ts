import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRoles } from '@/lib/api-auth';
import { validateStockReorderPayload } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin', 'admin_basico']);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query for low stock products
    let query = supabaseAdmin
      .from('products')
      .select(`
        *,
        categories!inner(
          id,
          name
        )
      `, { count: 'exact' })
      .lte('stock', 'low_stock_threshold')
      .eq('status', 'active');

    // Apply filters
    if (search) {
      query = query.or(`
        name.ilike.%${search}%,
        sku.ilike.%${search}%,
        categories.name.ilike.%${search}%
      `);
    }

    // Apply pagination and ordering
    const { data: products, error, count } = await query
      .order('stock', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    // Get additional data for each product
    const enhancedProducts = await Promise.all(
      (products || []).map(async (product) => {
        // Get last sale date
        const { data: lastSale } = await supabaseAdmin
          .from('sale_items')
          .select('created_at')
          .eq('product_id', product.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get total sales count
        const { count: totalSales } = await supabaseAdmin
          .from('sale_items')
          .select('*', { count: 'exact', head: true })
          .eq('product_id', product.id);

        // Calculate status based on stock level
        const stockPercentage = (product.stock / product.low_stock_threshold) * 100;
        let status: 'critical' | 'warning' | 'normal' = 'normal';
        
        if (stockPercentage <= 25) {
          status = 'critical';
        } else if (stockPercentage <= 50) {
          status = 'warning';
        }

        return {
          ...product,
          categoryName: product.categories.name,
          lastSale: lastSale?.created_at || null,
          totalSales: totalSales || 0,
          daysSinceLastSale: lastSale?.created_at ? 
            Math.floor((Date.now() - new Date(lastSale.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 
            null,
          status,
          reorderPoint: Math.ceil(product.low_stock_threshold * 1.5),
          reorderQuantity: Math.ceil(product.low_stock_threshold * 2)
        };
      })
    );

    // Get statistics
    const { data: allLowStock } = await supabaseAdmin
      .from('products')
      .select('stock, low_stock_threshold')
      .lte('stock', 'low_stock_threshold')
      .eq('status', 'active');

    const stats = allLowStock?.reduce((acc, product) => {
      const stockPercentage = (product.stock / product.low_stock_threshold) * 100;
      
      acc.total++;
      
      if (stockPercentage <= 25) {
        acc.critical++;
      } else if (stockPercentage <= 50) {
        acc.warning++;
      }
      
      return acc;
    }, { total: 0, critical: 0, warning: 0 });

    return NextResponse.json({
      products: enhancedProducts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats
    });
  } catch (error) {
    console.error('Low Stock API Error:', error);
    return NextResponse.json(
      { error: 'Error fetching low stock products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin', 'admin_basico']);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { isValid, errors } = validateStockReorderPayload(body);
    if (!isValid) return NextResponse.json({ errors }, { status: 400 });

    const productIds: string[] = body.productIds;
    const reorderQuantity: number = body.reorderQuantity || 25;

    for (const productId of productIds) {
      const { error } = await supabaseAdmin.rpc('increment_stock', {
        p_id: productId,
        p_qty: reorderQuantity,
      });
      if (error) throw error;
    }

    const { data: updatedProducts, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .in('id', productIds);

    if (error) throw error;

    return NextResponse.json(updatedProducts);
  } catch (error) {
    console.error('Reorder Stock Error:', error);
    return NextResponse.json(
      { error: 'Error reordering stock' },
      { status: 500 }
    );
  }
}
