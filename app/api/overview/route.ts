import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRoles } from '@/lib/api-auth';

export async function GET() {
  try {
    const auth = await authorizeRoles(['admin', 'super_admin', 'admin_basico']);
    if (!auth.ok) return auth.response;

    const extractSingle = <T>(value: T | T[] | null | undefined): T | null => {
      if (Array.isArray(value)) return value[0] ?? null;
      return value ?? null;
    };

    const extractFromUnknown = <T>(value: unknown): T | null => {
      return extractSingle<T>(value as T | T[] | null | undefined);
    };

    // Get current date ranges
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    // 1. Get sales metrics for different periods
    const [
      todaySalesResult,
      yesterdaySalesResult,
      lastWeekSalesResult,
      lastMonthSalesResult
    ] = await Promise.all([
      // Today's sales
      supabaseAdmin
        .from('sales')
        .select('total, sale_date')
        .eq('status', 'completed')
        .gte('sale_date', today.toISOString()),
      
      // Yesterday's sales
      supabaseAdmin
        .from('sales')
        .select('total, sale_date')
        .eq('status', 'completed')
        .gte('sale_date', yesterday.toISOString())
        .lt('sale_date', today.toISOString()),
      
      // Last week's sales
      supabaseAdmin
        .from('sales')
        .select('total, sale_date')
        .eq('status', 'completed')
        .gte('sale_date', lastWeek.toISOString()),
      
      // Last month's sales
      supabaseAdmin
        .from('sales')
        .select('total, sale_date')
        .eq('status', 'completed')
        .gte('sale_date', lastMonth.toISOString())
        .lt('sale_date', new Date(today.getFullYear(), today.getMonth(), 1).toISOString())
    ]);

    // Calculate revenue for each period
    const todayRevenue = todaySalesResult.data?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0;
    const yesterdayRevenue = yesterdaySalesResult.data?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0;
    const lastWeekRevenue = lastWeekSalesResult.data?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0;
    const lastMonthRevenue = lastMonthSalesResult.data?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0;

    // 2. Get orders metrics
    const [
      todayOrdersResult,
      pendingOrdersResult,
      completedOrdersResult
    ] = await Promise.all([
        // Today's orders
        supabaseAdmin
          .from('orders')
          .select('id, total, status, created_at')
          .gte('created_at', today.toISOString()),
        
        // Pending orders
        supabaseAdmin
          .from('orders')
          .select('id, total, status, created_at')
          .eq('status', 'pendiente'),
        
        // Completed orders
        supabaseAdmin
          .from('orders')
          .select('id, total, status, created_at')
          .eq('status', 'entregado')
          .gte('created_at', lastMonth.toISOString())
      ]);

    const todayOrders = todayOrdersResult.data?.length || 0;
    const pendingOrders = pendingOrdersResult.data?.length || 0;
    const completedOrders = completedOrdersResult.data?.length || 0;

    // 3. Get customer metrics
    const [
      totalCustomersResult,
      newCustomersResult,
      activeCustomersResult
    ] = await Promise.all([
        // Total customers
        supabaseAdmin
          .from('customers')
          .select('id', { count: 'exact', head: true }),
        
        // New customers (last 30 days)
        supabaseAdmin
          .from('customers')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', lastMonth.toISOString()),
        
        // Active customers (with orders in last 30 days)
        supabaseAdmin
          .from('orders')
          .select('customer_id', { count: 'exact', head: true })
          .gte('created_at', lastMonth.toISOString())
      ]);

    const totalCustomers = totalCustomersResult.count ?? 0;
    const newCustomers = newCustomersResult.count ?? 0;
    const activeCustomers = activeCustomersResult.count ?? 0;

    // 4. Get product metrics
    const [
      totalProductsResult,
      activeProductsResult,
      lowStockProductsResult
    ] = await Promise.all([
        // Total products
        supabaseAdmin
          .from('products')
          .select('id', { count: 'exact', head: true }),
        
        // Active products
        supabaseAdmin
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),
        
        // Low stock products
        supabaseAdmin
          .from('products')
          .select('id, name, stock, low_stock_threshold')
          .eq('is_active', true)
      ]);

    const totalProducts = totalProductsResult.count ?? 0;
    const activeProducts = activeProductsResult.count ?? 0;
    const lowStockProducts = lowStockProductsResult.data?.filter(p => p.stock <= p.low_stock_threshold) || [];

    // 5. Get conversion metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalVisitsResult,
      totalSalesResult
    ] = await Promise.all([
        // Total visits
        supabaseAdmin
          .from('visits')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString()),
        
        // Total sales in same period
        supabaseAdmin
          .from('sales')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gte('sale_date', thirtyDaysAgo.toISOString())
      ]);

    const totalVisits = totalVisitsResult.count ?? 0;
    const totalSales = totalSalesResult.count ?? 0;
    const conversionRate = totalVisits > 0 ? (totalSales / totalVisits) * 100 : 0;

    // 6. Get top performing categories
    const topCategoriesResult = await supabaseAdmin
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
      .limit(5);

    const topCategories = topCategoriesResult.data?.map(item => {
      const product = extractFromUnknown<{ categories?: { name?: string } | Array<{ name?: string }> }>(item.products);
      const category = extractFromUnknown<{ name?: string }>(product?.categories);
      return {
        name: category?.name || 'Sin categoría',
        sales: item.quantity,
      };
    }) || [];

    // 7. Get recent activity
    const recentActivity = await supabaseAdmin
      .from('sales')
      .select(`
        id,
        total,
        sale_date,
        payment_method,
        customers!inner(
          first_name,
          last_name
        )
      `)
      .eq('status', 'completed')
      .order('sale_date', { ascending: false })
      .limit(5);

    // Calculate growth percentages
    const dailyGrowth = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
    const weeklyGrowth = lastWeekRevenue > 0 ? ((todayRevenue - (lastWeekRevenue / 7)) / (lastWeekRevenue / 7)) * 100 : 0;

    return NextResponse.json({
      metrics: {
        revenue: {
          today: todayRevenue,
          yesterday: yesterdayRevenue,
          lastWeek: lastWeekRevenue,
          lastMonth: lastMonthRevenue,
          dailyGrowth: dailyGrowth,
          weeklyGrowth: weeklyGrowth
        },
        orders: {
          today: todayOrders,
          pending: pendingOrders,
          completed: completedOrders
        },
        customers: {
          total: totalCustomers,
          new: newCustomers,
          active: activeCustomers
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          lowStock: lowStockProducts.length
        },
        conversion: {
          rate: conversionRate,
          totalVisits: totalVisits,
          totalSales: totalSales
        }
      },
      topCategories,
      recentActivity: recentActivity.data || []
    });
  } catch (error) {
    console.error('Overview API Error:', error);
    return NextResponse.json(
      { error: 'Error fetching overview data' },
      { status: 500 }
    );
  }
}
