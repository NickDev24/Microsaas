import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRoles } from '@/lib/api-auth';
import { validateStockReorderPayload } from '@/lib/validators';
import { reorderStockBatch } from '@/lib/transactions';

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin', 'admin_basico']);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    // Build query for low stock products (use view to avoid invalid column-to-column comparisons)
    let query = supabaseAdmin
      .from('low_stock_products')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`
        name.ilike.%${search}%,
        sku.ilike.%${search}%,
        category_name.ilike.%${search}%
      `);
    }

    // Apply pagination and ordering
    const { data: products, error, count } = await query
      .order('stock', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    const productIds = (products || []).map((p) => p.id).filter(Boolean) as string[];

    const { data: saleItemsData } = productIds.length
      ? await supabaseAdmin
          .from('sale_items')
          .select('product_id, created_at')
          .in('product_id', productIds)
      : { data: [] as Array<{ product_id: string; created_at: string }> };

    const salesByProduct = (saleItemsData || []).reduce((acc, item) => {
      const productId = item.product_id;
      const createdAtMs = new Date(item.created_at).getTime();
      const current = acc[productId] ?? { totalSales: 0, lastSaleMs: null as number | null };
      current.totalSales += 1;
      current.lastSaleMs = current.lastSaleMs === null ? createdAtMs : Math.max(current.lastSaleMs, createdAtMs);
      acc[productId] = current;
      return acc;
    }, {} as Record<string, { totalSales: number; lastSaleMs: number | null }>);

    const enhancedProducts = (products || []).map((product) => {
      const agg = salesByProduct[product.id] ?? { totalSales: 0, lastSaleMs: null };
      const lastSale = agg.lastSaleMs ? new Date(agg.lastSaleMs).toISOString() : null;

      const stockPercentage = (product.stock / product.low_stock_threshold) * 100;
      let status: 'critical' | 'warning' | 'normal' = 'normal';

      if (stockPercentage <= 25) {
        status = 'critical';
      } else if (stockPercentage <= 50) {
        status = 'warning';
      }

      return {
        ...product,
        categoryName: (product as { category_name?: string }).category_name,
        lastSale,
        totalSales: agg.totalSales,
        daysSinceLastSale: lastSale
          ? Math.floor((Date.now() - new Date(lastSale).getTime()) / (1000 * 60 * 60 * 24))
          : null,
        status,
        reorderPoint: Math.ceil(product.low_stock_threshold * 1.5),
        reorderQuantity: Math.ceil(product.low_stock_threshold * 2),
      };
    });

    // Get statistics
    const { data: allLowStock } = await supabaseAdmin
      .from('low_stock_products')
      .select('stock, low_stock_threshold');

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

    // Prepare batch updates
    const productUpdates = productIds.map(productId => ({
      product_id: productId,
      quantity: reorderQuantity
    }));

    // Use atomic batch transaction
    const result = await reorderStockBatch(productUpdates);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error_message }, { status: 500 });
    }

    // Fetch updated products
    const { data: updatedProducts, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .in('id', productIds);

    if (error) throw error;

    return NextResponse.json({
      products: updatedProducts,
      updatedCount: result.updated_count
    });
  } catch (error) {
    console.error('Reorder Stock Error:', error);
    return NextResponse.json(
      { error: 'Error reordering stock' },
      { status: 500 }
    );
  }
}
