'use client';

import { useEffect, useState } from 'react';
import { KPICard } from '@/components/admin/KPICard';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Chart } from '@/components/admin/Chart';
import type { OrderStatus } from '@/types';

type RecentSale = {
  id: string;
  sale_date: string;
  total: number;
  payment_method: string;
  customer_name?: string;
  sale_items: unknown[];
};

type RecentOrder = {
  id: string;
  customer_name: string;
  status: OrderStatus | string;
  total: number;
  created_at: string;
};

type DashboardData = {
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
  recentOrders: RecentOrder[];
  recentSales: RecentSale[];
  lowStockItems: Array<{ id: string; name: string; stock: number; min_stock: number }>;
  salesByMonth: Array<{ label: string; value: number }>;
  topProducts: Array<{ name: string; sales: number }>;
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const mockData: DashboardData = {
      metrics: {
        totalRevenue: 150000,
        totalSalesCount: 1234,
        pendingOrders: 45,
        totalProducts: 89,
        lowStockCount: 12,
        conversionRate: 3.2,
        averageTicket: 121.5,
        monthlyTarget: 200000,
        monthlyProgress: 75
      },
      recentOrders: [
        {
          id: '1',
          customer_name: 'Juan Pérez',
          status: 'pendiente',
          total: 2500,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          customer_name: 'María García',
          status: 'enviado',
          total: 1800,
          created_at: new Date().toISOString()
        }
      ],
      recentSales: [
        {
          id: '1',
          sale_date: new Date().toISOString(),
          total: 2500,
          payment_method: 'tarjeta',
          customer_name: 'Juan Pérez',
          sale_items: []
        }
      ],
      lowStockItems: [
        { id: '1', name: 'Camiseta XL', stock: 2, min_stock: 10 },
        { id: '2', name: 'Pantalón M', stock: 1, min_stock: 5 }
      ],
      salesByMonth: [
        { label: 'Ene', value: 12000 },
        { label: 'Feb', value: 15000 },
        { label: 'Mar', value: 18000 }
      ],
      topProducts: [
        { name: 'Camiseta Básica', sales: 234 },
        { name: 'Jeans Clásicos', sales: 189 }
      ]
    };

    setTimeout(() => {
      setData(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        <KPICard
          title="Ventas Totales"
          value={`$${(data?.metrics?.totalRevenue || 0).toLocaleString('es-AR')}`}
          subtitle="Facturación total"
          trend={{ value: 21, isUp: true }}
          icon="Revenue"
          color="green"
        />
        <KPICard
          title="Pedidos"
          value={data?.metrics?.totalSalesCount || 0}
          subtitle="Total registrados"
          trend={{ value: 8, isUp: true }}
          icon="Package"
          color="purple"
        />
        <KPICard
          title="Conversión"
          value={`${(data?.metrics?.conversionRate || 0).toFixed(1)}%`}
          subtitle="Tasa de conversión"
          trend={{ value: 2, isUp: true }}
          icon="Target"
          color="orange"
        />
        <KPICard
          title="Stock Crítico"
          value={data?.lowStockItems?.length || 0}
          subtitle="Productos bajos"
          trend={{ value: 12, isUp: false }}
          icon="AlertTriangle"
          color="red"
        />
      </div>

      {/* Dashboard Content */}
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Dashboard Funcional
        </h2>
        <p className="text-muted">
          El sistema está funcionando correctamente. Los datos se cargarán dinámicamente.
        </p>
      </div>
    </div>
  );
}
