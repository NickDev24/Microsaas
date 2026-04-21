'use client';

import { useCallback, useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { FormModal } from '@/components/admin/FormModal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import type { Order, OrderStatus, Product } from '@/types';

type OrderItemDraft = {
  product_id: string;
  quantity: number;
  unit_price: number;
};

type OrderDraft = Omit<Partial<Order>, 'items'> & {
  customer_name: string;
  status: OrderStatus;
  items: OrderItemDraft[];
  total: number;
};

const statusBadgeVariant: Record<OrderStatus, 'warning' | 'success' | 'info' | 'error' | 'default'> = {
  pendiente: 'warning',
  confirmado: 'info',
  enviado: 'info',
  entregado: 'success',
  cancelado: 'error',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentItem, setCurrentItem] = useState<OrderDraft | null>(null);
  const { addToast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [res, prodRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/products')
      ]);
      setOrders(await res.json());
      setProducts(await prodRes.json());
    } catch { addToast('Error', 'error'); }
    finally { setIsLoading(false); }
  }, [addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentItem),
      });
      if (!res.ok) throw new Error('Error al crear pedido');
      addToast('Pedido cargado con éxito', 'success');
      setIsModalOpen(false);
      fetchData();
    } catch { addToast('Error', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const columns = [
    { header: 'ID', accessor: (row: Order) => row.id.split('-')[0].toUpperCase() },
    { header: 'Cliente', accessor: 'customer_name' },
    { header: 'Total', accessor: (row: Order) => `$${row.total.toLocaleString()}` },
    { 
      header: 'Estado', 
      accessor: (row: Order) => {
        const variant = statusBadgeVariant[row.status] ?? 'default';
        return <Badge variant={variant}>{row.status.toUpperCase()}</Badge>;
      } 
    },
    { header: 'Fecha', accessor: (row: Order) => new Date(row.created_at).toLocaleDateString() },
    {
      header: 'Acciones',
      accessor: () => (
        <Button variant="ghost" size="sm" onClick={() => {}}>Ver Detalle</Button>
      ),
    },
  ];

  const addItem = () => {
    const base = currentItem ?? { customer_name: '', status: 'pendiente' as const, items: [], total: 0 };
    const items = base.items || [];
    setCurrentItem({ ...base, items: [...items, { product_id: '', quantity: 1, unit_price: 0 }] });
  };

  const updateItem = (index: number, field: keyof OrderItemDraft, value: string | number) => {
    const base = currentItem ?? { customer_name: '', status: 'pendiente' as const, items: [], total: 0 };
    const items = [...base.items];
    items[index] = { ...items[index], [field]: value };
    
    if (field === 'product_id') {
      const prod = products.find(p => p.id === value);
      if (prod) items[index].unit_price = prod.price;
    }

    const total = items.reduce((acc, curr) => acc + (curr.quantity * curr.unit_price), 0);
    setCurrentItem({ ...base, items, total });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted text-sm">Carga y gestión de pedidos manuales</p>
        </div>
        <Button onClick={() => { setCurrentItem({ customer_name: '', status: 'pendiente', items: [], total: 0 }); setIsModalOpen(true); }}>
          + Cargar Pedido
        </Button>
      </div>

      <DataTable columns={columns} data={orders} isLoading={isLoading} />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo Pedido Manual"
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre Cliente" value={currentItem?.customer_name || ''} onChange={(e) => setCurrentItem({ ...(currentItem ?? { customer_name: '', status: 'pendiente', items: [], total: 0 }), customer_name: e.target.value })} required />
          <Select
            label="Estado"
            options={[
              { value: 'pendiente', label: 'Pendiente' },
              { value: 'confirmado', label: 'Confirmado' },
              { value: 'enviado', label: 'Enviado' },
              { value: 'entregado', label: 'Entregado' },
            ]}
            value={currentItem?.status || 'pendiente'}
            onChange={(e) => setCurrentItem({ ...(currentItem ?? { customer_name: '', status: 'pendiente', items: [], total: 0 }), status: e.target.value as OrderStatus })}
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm">Productos del Pedido</h4>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>+ Agregar</Button>
          </div>
          
          {currentItem?.items?.map((item, idx) => (
            <div key={idx} className="grid grid-cols-7 gap-2 items-end">
              <div className="col-span-3">
                <Select
                  options={[{ value: '', label: 'Producto' }, ...products.map(p => ({ value: p.id, label: p.name }))]}
                  value={item.product_id}
                  onChange={(e) => updateItem(idx, 'product_id', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Input type="number" placeholder="Cant." value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} />
              </div>
              <div className="col-span-2 text-right">
                <p className="text-sm font-bold">${(item.quantity * item.unit_price).toLocaleString()}</p>
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t border-border flex justify-end">
            <p className="text-lg font-bold">Total: ${currentItem?.total?.toLocaleString() || 0}</p>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
