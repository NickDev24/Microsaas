'use client';

import { useEffect, useState } from 'react';
import { KPICard } from '@/components/admin/KPICard';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Chart } from '@/components/admin/Chart';
import { ChartGrid } from '@/components/admin/ChartGrid';
import { 
  ThermometerWidget, 
  DeviceStatsWidget, 
  KeywordsWidget, 
  CategoriesWidget, 
  ActivityWidget 
} from '@/components/admin/Widgets';

interface DashboardData {
  metrics: {
    totalRevenue: number;
    totalSalesCount: number;
    pendingOrders: number;
    totalProducts: number;
    lowStockCount: number;
    conversionRate: number;
    averageTicket: number;
    monthlyTarget: number;
    monthlyProgress: number;
  };
  lowStockItems: any[];
  recentSales: any[];
  recentOrders: any[];
  salesByMonth: number[];
  topProducts: any[];
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  topKeywords: string[];
  topCategories: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard:', err);
        setIsLoading(false);
      });
  }, []);

  const recentSalesColumns = [
    { header: 'Fecha', accessor: (row: any) => new Date(row.sale_date).toLocaleDateString() },
    { header: 'Cliente', accessor: 'customer_name' },
    { header: 'Método', accessor: 'payment_method' },
    { header: 'Total', accessor: (row: any) => `$${row.total.toLocaleString()}` },
    {
      header: 'Items',
      accessor: (row: any) => row.sale_items.length,
    },
  ];

  const recentOrdersColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Cliente', accessor: 'customer_name' },
    { 
      header: 'Estado', 
      accessor: (row: any) => (
        <Badge 
          variant={
            row.status === 'entregado' ? 'success' :
            row.status === 'enviado' ? 'info' :
            row.status === 'confirmado' ? 'info' :
            row.status === 'pendiente' ? 'warning' :
            'error'
          }
        >
          {row.status}
        </Badge>
      )
    },
    { header: 'Total', accessor: (row: any) => `$${row.total.toLocaleString()}` },
    { header: 'Fecha', accessor: (row: any) => new Date(row.created_at).toLocaleDateString() },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Panel de Análisis</h1>
          <p className="text-muted text-sm">Resumen operativo y métricas clave del negocio.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-2">Última actualización:</span>
         <span suppressHydrationWarning>
  {new Date().toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })}
</span>
        </div>
      </div>

      {/* KPI Metrics Grid - 6 Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        <KPICard
          title="Ventas Totales"
          value={`$${(data?.metrics?.totalRevenue || 0).toLocaleString('es-AR')}`}
          subtitle="Facturación total"
          trend={{ value: 21, isUp: true }}
          icon="💰"
          color="green"
          sparkline={data?.salesByMonth || []}
        />
        <KPICard
          title="Ingresos"
          value={`$${(data?.metrics?.totalRevenue || 0).toLocaleString('es-AR')}`}
          subtitle="Promedio diario"
          trend={{ value: 15, isUp: true }}
          icon="📈"
          color="blue"
        />
        <KPICard
          title="Pedidos"
          value={data?.metrics?.totalSalesCount || 0}
          subtitle="Total registrados"
          trend={{ value: 8, isUp: true }}
          icon="📦"
          color="purple"
        />
        <KPICard
          title="Conversión"
          value={`${(data?.metrics?.conversionRate || 0).toFixed(1)}%`}
          subtitle="Tasa de conversión"
          trend={{ value: 2, isUp: true }}
          icon="🎯"
          color="orange"
          gauge={{ current: data?.metrics?.conversionRate || 0, max: 20 }}
        />
        <KPICard
          title="Ticket Promedio"
          value={`$${(data?.metrics?.averageTicket || 0).toLocaleString('es-AR')}`}
          subtitle="Por venta"
          trend={{ value: 5, isUp: false }}
          icon="💳"
          color="pink"
        />
        <KPICard
          title="Stock Crítico"
          value={data?.metrics?.lowStockCount || 0}
          subtitle="Productos bajos"
          trend={{ value: 12, isUp: false }}
          icon="⚠️"
          color="red"
        />
      </div>

      {/* Main Content Grid - Left: Tables | Right: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Tables Side by Side */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-slow" />
              Actividad Reciente
            </h2>
            <div className="flex gap-2">
              <button className="text-sm text-muted hover:text-foreground transition-colors hover-glow-blue px-3 py-1 rounded-lg">
                Pedidos
              </button>
              <button className="text-sm text-muted hover:text-foreground transition-colors hover-glow-green px-3 py-1 rounded-lg">
                Ventas
              </button>
            </div>
          </div>
          
          {/* Tables Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Recent Orders Table */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Pedidos Recientes
                </h3>
              </div>
              <DataTable
                columns={recentOrdersColumns}
                data={data?.recentOrders || []}
                isLoading={isLoading}
                emptyMessage="No hay pedidos registrados"
              />
            </div>

            {/* Recent Sales Table */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Ventas Recientes
                </h3>
              </div>
              <DataTable
                columns={recentSalesColumns}
                data={data?.recentSales || []}
                isLoading={isLoading}
                emptyMessage="No hay ventas registrados"
              />
            </div>
          </div>

          {/* Low Stock Section - Moved Here */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse-slow" />
                Stock Crítico
              </h2>
              <span className="text-xs text-muted-2 bg-surface-2 px-2 py-1 rounded-full border border-border">
                {data?.lowStockItems?.length || 0} items
              </span>
            </div>
            <div className="bg-surface border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="p-4 space-y-3">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-10 h-10 bg-surface-2 rounded-lg" />
                      <div className="space-y-2 flex-1 pt-1">
                        <div className="h-4 bg-surface-2 rounded w-3/4" />
                        <div className="h-3 bg-surface-2 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : data?.lowStockItems?.length === 0 ? (
                  <div className="text-center py-6">
                    <span className="text-2xl">✅</span>
                    <p className="text-sm text-muted-2 mt-2">Stock en niveles óptimos</p>
                  </div>
                ) : (
                  data?.lowStockItems?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted">Stock: {item.stock} / Mín: {item.low_stock_threshold}</p>
                      </div>
                      <Badge variant="error">BAJO</Badge>
                    </div>
                  ))
                )}
              </div>
              {data && data.lowStockItems && data.lowStockItems.length > 0 && (
                <div className="p-3 bg-surface-2 border-t border-border">
                  <button className="w-full py-2 text-xs font-semibold text-muted hover:text-foreground transition-colors">
                    Gestionar Inventario
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - 4 Charts Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse-slow" />
              Análisis de Rendimiento
            </h2>
            <span className="text-xs text-muted-2 bg-surface-2 px-2 py-1 rounded-full border border-border">
              Tiempo real
            </span>
          </div>
          
          {/* 2x2 Grid for Charts */}
          <div className="grid grid-cols-2 gap-4">
            {/* Ventas por Mes */}
            <Chart
              type="line"
              title="Ventas por Mes"
              data={data?.salesByMonth?.map((value, index) => ({
                label: `Mes ${index + 1}`,
                value
              })) || []}
              height={180}
              color="#fb923c"
              animated={true}
              showTooltip={true}
            />

            {/* Ventas por Canal */}
            <Chart
              type="bar"
              title="Ventas por Canal"
              data={[
                { label: 'WhatsApp', value: 45 },
                { label: 'Web', value: 30 },
                { label: 'Manual', value: 25 }
              ]}
              height={180}
              color="#a855f7"
              animated={true}
              showTooltip={true}
            />

            {/* Productos Más Vendidos */}
            <Chart
              type="bar"
              title="Top Productos"
              data={data?.topProducts?.map(p => ({
                label: p.name?.substring(0, 6) + '...',
                value: p.sales || 0
              })) || []}
              height={180}
              color="#ec4899"
              animated={true}
              showTooltip={true}
            />

            {/* Embudo de Conversión */}
            <Chart
              type="funnel"
              title="Conversión"
              data={[
                { label: 'Visitas', value: 10000 },
                { label: 'Vistos', value: 3500 },
                { label: 'Carrito', value: 1200 },
                { label: 'Compras', value: 278 }
              ]}
              height={180}
              color="#3b82f6"
              animated={true}
              showTooltip={true}
            />
          </div>
        </div>
      </div>

      {/* Widgets Section - Professional Grid Layout */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse-slow" />
            Panel de Control
          </h2>
          <span className="text-xs text-muted-2 bg-surface-2 px-2 py-1 rounded-full border border-border">
            Métricas en tiempo real
          </span>
        </div>
        
        {/* 5-Column Widget Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Termómetro del Mes */}
          <div className="lg:col-span-1 bg-surface border border-border rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover-glow-orange">
            <ThermometerWidget
              current={data?.metrics?.monthlyProgress || 172}
              target={data?.metrics?.monthlyTarget || 300}
              label="Termómetro del Mes"
            />
          </div>
          
          {/* Dispositivos */}
          <div className="lg:col-span-1 bg-surface border border-border rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover-glow-blue">
            <DeviceStatsWidget
              mobile={data?.deviceStats?.mobile || 45}
              desktop={data?.deviceStats?.desktop || 35}
              tablet={data?.deviceStats?.tablet || 20}
            />
          </div>
          
          {/* Top Keywords */}
          <div className="lg:col-span-1 bg-surface border border-border rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover-glow-purple">
            <KeywordsWidget
              keywords={data?.topKeywords || [
                'remera oversize',
                'campera invierno', 
                'jeans hombre',
                'vestido elegante',
                'buzos deportivos'
              ]}
            />
          </div>
          
          {/* Categorías Más Vendidas */}
          <div className="lg:col-span-1 bg-surface border border-border rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover-glow-pink">
            <CategoriesWidget
              categories={data?.topCategories || [
                { name: 'Remeras', sales: 145 },
                { name: 'Camperas', sales: 98 },
                { name: 'Jeans', sales: 87 },
                { name: 'Vestidos', sales: 65 }
              ]}
            />
          </div>
          
          {/* Actividad en Tiempo Real */}
          <div className="lg:col-span-1 bg-surface border border-border rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover-glow-green">
            <ActivityWidget
              activities={[
                { type: 'sale', message: 'Nueva venta de $2,500', time: 'hace 2 min' },
                { type: 'product', message: 'Producto creado: Remera Premium', time: 'hace 5 min' },
                { type: 'stock', message: 'Stock bajo: Campera de Cuero', time: 'hace 8 min' },
                { type: 'sale', message: 'Nueva venta de $1,800', time: 'hace 12 min' }
              ]}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
