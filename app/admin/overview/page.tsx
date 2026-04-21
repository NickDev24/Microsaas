'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KPICard } from '@/components/admin/KPICard';

interface OverviewData {
  metrics: {
    revenue: {
      today: number;
      yesterday: number;
      lastWeek: number;
      lastMonth: number;
      dailyGrowth: number;
      weeklyGrowth: number;
    };
    orders: {
      today: number;
      pending: number;
      completed: number;
    };
    customers: {
      total: number;
      new: number;
      active: number;
    };
    products: {
      total: number;
      active: number;
      lowStock: number;
    };
    conversion: {
      rate: number;
      totalVisits: number;
      totalSales: number;
    };
  };
}

export default function OverviewPage() {
  const router = useRouter();
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/overview')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching overview:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-sm text-muted-2">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Vista General</h1>
          <p className="text-muted text-sm">Resumen completo del rendimiento del negocio.</p>
        </div>
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          Ver Dashboard Completo
        </button>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        <KPICard
          title="Ventas Totales"
          value={`$${(data?.metrics?.revenue?.today || 0).toLocaleString('es-AR')}`}
          subtitle="Hoy"
          trend={{ value: data?.metrics?.revenue?.dailyGrowth || 0, isUp: (data?.metrics?.revenue?.dailyGrowth || 0) >= 0 }}
          icon="💰"
          color="green"
        />
        <KPICard
          title="Pedidos Hoy"
          value={data?.metrics?.orders?.today || 0}
          subtitle="Nuevos pedidos"
          trend={{ value: 12, isUp: true }}
          icon="📦"
          color="blue"
        />
        <KPICard
          title="Clientes Activos"
          value={data?.metrics?.customers?.active || 0}
          subtitle="Últimos 30 días"
          trend={{ value: 8, isUp: true }}
          icon="👥"
          color="purple"
        />
        <KPICard
          title="Tasa Conversión"
          value={`${(data?.metrics?.conversion?.rate || 0).toFixed(1)}%`}
          subtitle="Visitas → Ventas"
          trend={{ value: 2, isUp: true }}
          icon="🎯"
          color="orange"
          gauge={{ current: data?.metrics?.conversion?.rate || 0, max: 20 }}
        />
        <KPICard
          title="Productos Activos"
          value={data?.metrics?.products?.active || 0}
          subtitle="Catálogo total"
          trend={{ value: 5, isUp: true }}
          icon="👕"
          color="pink"
        />
        <KPICard
          title="Stock Bajo"
          value={data?.metrics?.products?.lowStock || 0}
          subtitle="Necesitan reposición"
          trend={{ value: -12, isUp: false }}
          icon="⚠️"
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover-glow-blue">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Nueva Venta</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-sm text-muted-2 mb-4">Registrar una nueva venta manualmente</p>
          <button
            onClick={() => router.push('/admin/ventas/nueva')}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Crear Venta
          </button>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover-glow-green">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Productos</h3>
            <span className="text-2xl">👕</span>
          </div>
          <p className="text-sm text-muted-2 mb-4">Gestionar catálogo de productos</p>
          <button
            onClick={() => router.push('/admin/productos')}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Ver Productos
          </button>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover-glow-purple">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Pedidos</h3>
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-sm text-muted-2 mb-4">Ver y gestionar pedidos recientes</p>
          <button
            onClick={() => router.push('/admin/pedidos')}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Gestionar Pedidos
          </button>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover-glow-orange">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Configuración</h3>
            <span className="text-2xl">⚙️</span>
          </div>
          <p className="text-sm text-muted-2 mb-4">Ajustes generales de la tienda</p>
          <button
            onClick={() => router.push('/admin/configuracion')}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Configurar
          </button>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Resumen de Actividad</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">
              {data?.metrics?.orders?.today || 0}
            </div>
            <div className="text-sm text-muted-2">Ventas Hoy</div>
            <div className="text-xs text-muted-2 mt-1">
              ${(data?.metrics?.revenue?.today || 0).toLocaleString('es-AR')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">
              ${(data?.metrics?.revenue?.today || 0).toLocaleString('es-AR')}
            </div>
            <div className="text-sm text-muted-2">Facturación Hoy</div>
            <div className="text-xs text-muted-2 mt-1">
              {data?.metrics?.orders?.today || 0} pedidos
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">
              {data?.metrics?.conversion?.rate ? `${data.metrics.conversion.rate.toFixed(1)}%` : '0%'}
            </div>
            <div className="text-sm text-muted-2">Tasa de Conversión</div>
            <div className="text-xs text-muted-2 mt-1">
              {data?.metrics?.conversion?.totalVisits || 0} visitas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
