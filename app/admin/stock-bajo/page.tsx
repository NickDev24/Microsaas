'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  lowStockThreshold: number;
  minStock: number;
  maxStock: number;
  lastSale: string;
  daysSinceLastSale: number;
  reorderPoint: number;
  reorderQuantity: number;
  supplier: string;
  cost: number;
  price: number;
  status: 'critical' | 'warning' | 'normal';
}

export default function StockBajoPage() {
  const [activeTab, setActiveTab] = useState<'critical' | 'warning' | 'all'>('critical');
  const [stockItems, setStockItems] = useState<LowStockItem[]>([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, warning: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/stock-bajo');
      const data = await res.json();
      setStockItems(data.products || []);
      setStats(data.stats || { total: 0, critical: 0, warning: 0 });
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = stockItems.filter(item => {
    if (activeTab === 'critical') return item.status === 'critical';
    if (activeTab === 'warning') return item.status === 'warning';
    return true; // all
  });

  const tabs: Array<{ id: 'critical' | 'warning' | 'all'; label: string; count: number; color: string }> = [
    { id: 'critical', label: 'Crítico', count: stats.critical, color: 'text-red-500' },
    { id: 'warning', label: 'Advertencia', count: stats.warning, color: 'text-yellow-500' },
    { id: 'all', label: 'Todos', count: stats.total, color: 'text-blue-500' }
  ];

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleReorder = async () => {
    if (selectedItems.length === 0) return;
    
    setIsProcessing(true);
    try {
      // Simular proceso de reorden
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Actualizar estado de los items seleccionados
      setStockItems(prev => prev.map(item => 
        selectedItems.includes(item.id)
          ? { ...item, status: 'normal' as const, currentStock: item.currentStock + item.reorderQuantity }
          : item
      ));
      
      setSelectedItems([]);
    } catch (error) {
      console.error('Error reordering items:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="error">Crítico</Badge>;
      case 'warning':
        return <Badge variant="warning">Advertencia</Badge>;
      default:
        return <Badge variant="success">Normal</Badge>;
    }
  };

  const getStockPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-sm text-muted-2">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Stock Bajo</h1>
          <p className="text-muted text-sm">Gestiona productos con bajo inventario y reordena automáticamente.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleReorder}
            disabled={isProcessing || selectedItems.length === 0}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isProcessing ? 'Procesando...' : `Reordenar (${selectedItems.length})`}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-2">Stock Crítico</span>
            <span className="text-2xl">🚨</span>
          </div>
          <div className="text-2xl font-bold text-red-500">{stats.critical}</div>
          <div className="text-xs text-muted-2">Productos necesitan reorden urgente</div>
        </div>
        
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-2">Advertencia</span>
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="text-2xl font-bold text-yellow-500">{stats.warning}</div>
          <div className="text-xs text-muted-2">Productos con stock bajo</div>
        </div>
        
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-2">Total Items</span>
            <span className="text-2xl">📦</span>
          </div>
          <div className="text-2xl font-bold text-blue-500">{stats.total}</div>
          <div className="text-xs text-muted-2">Productos en seguimiento</div>
        </div>
        
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-2">Valor Total</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-2xl font-bold text-green-500">
            ${stockItems.reduce((total, item) => total + (item.price * item.currentStock), 0).toLocaleString('es-AR')}
          </div>
          <div className="text-xs text-muted-2">Valor del inventario actual</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <span>{tab.label}</span>
              <Badge variant="default" className="text-xs">
                {tab.count}
              </Badge>
            </button>
          ))}
        </nav>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg border border-border">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-accent border-border rounded focus:ring-accent"
            />
            <span className="text-sm text-foreground">
              Seleccionar todos ({filteredItems.length})
            </span>
          </label>
          {selectedItems.length > 0 && (
            <span className="text-sm text-muted-2">
              {selectedItems.length} productos seleccionados
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedItems([])}
          >
            Limpiar selección
          </Button>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-2">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-accent border-border rounded focus:ring-accent"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                  Stock Actual
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                  Mínimo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                  Máximo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                  Última Venta
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                  Reordenar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-surface-2 transition-colors">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="w-4 h-4 text-accent border-border rounded focus:ring-accent"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.name}</div>
                      <div className="text-xs text-muted-2">{item.supplier}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-2">{item.sku}</td>
                  <td className="px-4 py-4 text-sm text-muted-2">{item.category}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{item.currentStock}</span>
                      <div className="w-16 bg-surface-2 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.status === 'critical' ? 'bg-red-500' :
                            item.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${getStockPercentage(item.currentStock, item.maxStock)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-2">{item.minStock}</td>
                  <td className="px-4 py-4 text-sm text-muted-2">{item.maxStock}</td>
                  <td className="px-4 py-4">{getStatusBadge(item.status)}</td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm text-foreground">{item.lastSale}</div>
                      <div className="text-xs text-muted-2">Hace {item.daysSinceLastSale} días</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <div className="text-muted-2">Punto: {item.reorderPoint}</div>
                      <div className="text-muted-2">Cantidad: {item.reorderQuantity}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No hay productos con stock bajo
          </h3>
          <p className="text-sm text-muted-2">
            Todos los productos tienen niveles de inventario adecuados.
          </p>
        </div>
      )}
    </div>
  );
}
