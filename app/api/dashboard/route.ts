import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRoles } from '@/lib/api-auth';

export async function GET() {
  try {
    const auth = await authorizeRoles(['super_admin', 'admin_basico']);
    if (!auth.ok) return auth.response;

    const extractSingle = <T>(value: T | T[] | null | undefined): T | null => {
      if (Array.isArray(value)) return value[0] ?? null;
      return value ?? null;
    };

    const extractFromUnknown = <T>(value: unknown): T | null => {
      return extractSingle<T>(value as T | T[] | null | undefined);
    };

    // 1. Get total sales count and sum
    const { data: salesStats } = await supabaseAdmin
      .from('sales')
      .select('total, sale_date')
      .eq('status', 'completed');
    
    const totalRevenue = salesStats?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0;
    const totalSalesCount = salesStats?.length || 0;

    // 2. Get pending orders count
    const { count: pendingOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendiente');

    // 3. Get total products
    const { count: totalProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // 4. Get low stock products
    const { data: refinedLowStock } = await supabaseAdmin
      .from('products')
      .select('id, name, stock, low_stock_threshold')
      .eq('is_active', true);
    
    const lowStockItems = refinedLowStock?.filter(p => p.stock <= p.low_stock_threshold) || [];

    // 5. Recent sales with items
    const { data: recentSales } = await supabaseAdmin
      .from('sales')
      .select(`
        id,
        sale_date,
        total,
        payment_method,
        customers!inner(
          first_name,
          last_name,
          email
        ),
        sale_items!inner(
          quantity,
          products!inner(
            name
          )
        )
      `)
      .eq('status', 'completed')
      .order('sale_date', { ascending: false })
      .limit(10);

    // 6. Recent orders
    const { data: recentOrders } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        customer_name,
        status,
        total,
        created_at,
        customers!inner(
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // 7. Sales by month (last 6 months from real data)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const { data: salesByMonthData } = await supabaseAdmin
      .from('sales')
      .select('total, sale_date')
      .eq('status', 'completed')
      .gte('sale_date', sixMonthsAgo.toISOString())
      .order('sale_date', { ascending: true });

    // Group sales by month
    const salesByMonth = salesByMonthData?.reduce((acc, sale) => {
      const month = new Date(sale.sale_date).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + Number(sale.total);
      return acc;
    }, {} as Record<string, number>) || {};

    // 8. Top products from real sales data
    const { data: topProductsData } = await supabaseAdmin
      .from('sale_items')
      .select(`
        quantity,
        products!inner(
          name,
          price
        )
      `)
      .order('quantity', { ascending: false })
      .limit(10);

    // 9. Calculate real metrics
    const averageTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;
    
    // Calculate conversion rate (visits vs sales)
    const { count: totalVisits } = await supabaseAdmin
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sixMonthsAgo.toISOString());

    const totalVisitsCount = totalVisits ?? 0;
    const conversionRate = totalVisitsCount > 0 ? (totalSalesCount / totalVisitsCount) * 100 : 0;
    
    // Calculate monthly progress
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    
    const monthlyProgress = salesByMonthData
      ?.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate >= monthStart && saleDate <= monthEnd;
      })
      ?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0;
    
    const monthlyTarget = 300000; // $300.000 objetivo mensual

    // 10. Real device stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: visitData } = await supabaseAdmin
      .from('visits')
      .select('device_type')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    const deviceStats = (visitData || []).reduce((acc, visit) => {
      const device = visit.device_type as keyof typeof acc;
      if (device && ['mobile', 'desktop', 'tablet'].includes(device)) {
        acc[device] = (acc[device] || 0) + 1;
      }
      return acc;
    }, { mobile: 0, desktop: 0, tablet: 0 });

    // 11. Top keywords from real search data
    const { data: keywordData } = await supabaseAdmin
      .from('product_events')
      .select('properties')
      .eq('event_type', 'search')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .limit(100);
    
    const keywordCounts = (keywordData || []).reduce((acc, event) => {
      const keyword = event.properties?.keyword || '';
      if (keyword) {
        acc[keyword] = (acc[keyword] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const topKeywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([keyword]) => keyword);

    // 12. Top categories from real sales data
    const { data: categoryData } = await supabaseAdmin
      .from('sale_items')
      .select(`
        quantity,
        products!inner(
          categories!inner(
            name
          )
        )
      `)
      .order('quantity', { ascending: false })
      .limit(50);
    
    const categoryCounts = (categoryData || []).reduce((acc, item) => {
      const product = extractFromUnknown<{ categories?: { name?: string } | Array<{ name?: string }> }>(item.products);
      const category = extractFromUnknown<{ name?: string }>(product?.categories);
      const categoryName = category?.name;
      if (!categoryName) return acc;
      acc[categoryName] = (acc[categoryName] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategories = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([name, sales]) => ({ name, sales }));

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalSalesCount,
        pendingOrders: pendingOrders || 0,
        totalProducts: totalProducts || 0,
        lowStockCount: lowStockItems.length,
        conversionRate,
        averageTicket,
        monthlyTarget,
        monthlyProgress,
      },
      lowStockItems: lowStockItems.slice(0, 10),
      recentSales: (recentSales || []).map((s) => {
        const customer = extractFromUnknown<{ first_name?: string; last_name?: string; email?: string }>(s.customers);
        const customerName = [customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || undefined;
        return {
          ...s,
          sale_items: Array.isArray(s.sale_items) ? s.sale_items : [],
          customer_name: customerName,
          customer_email: customer?.email,
        };
      }),
      recentOrders: (recentOrders || []).map((o) => {
        const customer = extractFromUnknown<{ first_name?: string; last_name?: string; email?: string }>(o.customers);
        const customerName = [customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || undefined;
        return {
          ...o,
          customer_name: customerName,
          customer_email: customer?.email,
        };
      }),
      salesByMonth: Object.entries(salesByMonth).map(([month, value]) => ({
        label: month,
        value
      })),
      topProducts: (topProductsData || []).map(item => {
        const product = extractFromUnknown<{ name?: string; price?: number }>(item.products);
        return {
          name: product?.name || 'Producto sin nombre',
          sales: item.quantity,
          price: product?.price || 0,
        };
      }),
      deviceStats,
      topKeywords,
      topCategories,
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    return NextResponse.json({ error: 'Error al obtener métricas' }, { status: 500 });
  }
}
