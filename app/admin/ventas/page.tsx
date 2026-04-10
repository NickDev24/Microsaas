'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { FormModal } from '@/components/admin/FormModal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const { addToast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sRes, oRes, pRes] = await Promise.all([
        fetch('/api/sales'),
        fetch('/api/orders'),
        fetch('/api/products')
      ]);
      setSales(await sRes.json());
      setOrders(await oRes.json());
      setProducts(await pRes.json());
    } catch (err) { addToast('Error', 'error'); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentItem),
      });
      if (!res.ok) throw new Error('Error al registrar venta');
      addToast('Venta registrada con éxito', 'success');
      setIsModalOpen(false);
      fetchData();
    } catch (err) { addToast('Error', 'error'); } 
    finally { setIsSubmitting(false); }
  };

  const handleCreateInvoice = async (saleId: string) => {
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sale_id: saleId }),
      });
      if (!res.ok) throw new Error('Error al facturar');
      addToast('Factura generada', 'success');
    } catch (err) { addToast('Error', 'error'); }
  };

  const columns = [
    { header: 'ID Venta', accessor: (row: any) => row.id.split('-')[0].toUpperCase() },
    { header: 'Cliente', accessor: 'customer_name' },
    { header: 'Pago', accessor: (row: any) => <Badge variant="info">{row.payment_method.toUpperCase()}</Badge> },
    { header: 'Total', accessor: (row: any) => `$${row.total.toLocaleString()}` },
    { header: 'Fecha', accessor: (row: any) => new Date(row.sale_date).toLocaleDateString() },
    {
      header: 'Factura',
      accessor: (row: any) => (
        <Button variant="ghost" size="sm" onClick={() => handleCreateInvoice(row.id)}>Facturar</Button>
      ),
    },
  ];

  const selectOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setCurrentItem({
        ...currentItem,
        order_id: orderId,
        customer_name: order.customer_name,
        total: order.total,
        items: order.order_items.map((it: any) => ({
          product_id: it.product_id,
          quantity: it.quantity,
          unit_price: it.unit_price,
          size: it.size,
          color: it.color
        }))
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ventas</h1>
          <p className="text-muted text-sm">Registro de ventas y facturación</p>
        </div>
        <Button onClick={() => { setCurrentItem({ customer_name: '', payment_method: 'efectivo', items: [], total: 0 }); setIsModalOpen(true); }}>
          + Registrar Venta
        </Button>
      </div>

      <DataTable columns={columns} data={sales} isLoading={isLoading} />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nueva Venta"
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      >
        <Select
          label="Vincular con Pedido (Opcional)"
          options={[{ value: '', label: 'Sin vincular' }, ...orders.filter(o => o.status !== 'entregado').map(o => ({ value: o.id, label: `${o.customer_name} - $${o.total}` }))]}
          value={currentItem?.order_id || ''}
          onChange={(e) => selectOrder(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre Cliente" value={currentItem?.customer_name || ''} onChange={(e) => setCurrentItem({ ...currentItem, customer_name: e.target.value })} required />
          <Select
            label="Método de Pago"
            options={[
              { value: 'efectivo', label: 'Efectivo' },
              { value: 'transferencia', label: 'Transferencia' },
              { value: 'tarjeta', label: 'Tarjeta' },
            ]}
            value={currentItem?.payment_method || 'efectivo'}
            onChange={(e) => setCurrentItem({ ...currentItem, payment_method: e.target.value })}
          />
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <h4 className="font-semibold text-sm">Resumen de Venta</h4>
          {currentItem?.items?.map((it: any, idx: number) => {
            const prod = products.find(p => p.id === it.product_id);
            return (
              <div key={idx} className="flex justify-between text-sm py-1">
                <span>{prod?.name} x {it.quantity}</span>
                <span className="font-bold">${(it.quantity * it.unit_price).toLocaleString()}</span>
              </div>
            );
          })}
          <div className="pt-2 border-t border-border flex justify-end">
            <p className="text-xl font-bold">Total a Cobrar: ${currentItem?.total?.toLocaleString() || 0}</p>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
