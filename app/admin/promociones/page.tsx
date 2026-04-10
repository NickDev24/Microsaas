'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { FormModal } from '@/components/admin/FormModal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Product } from '@/types';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const { addToast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [promosRes, prodRes] = await Promise.all([
        fetch('/api/promotions'),
        fetch('/api/products')
      ]);
      const promosData = await promosRes.json();
      const prodData = await prodRes.json();
      setPromotions(promosData);
      setProducts(prodData);
    } catch (err) {
      addToast('Error al cargar datos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isEditing = !!currentItem?.id;
    const url = isEditing ? `/api/promotions/${currentItem.id}` : '/api/promotions';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentItem),
      });

      if (!res.ok) throw new Error('Error al guardar');

      addToast(isEditing ? 'Promoción actualizada' : 'Promoción creada', 'success');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro?')) return;
    try {
      await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
      addToast('Promoción eliminada', 'success');
      fetchData();
    } catch (err) {
      addToast('Error al eliminar', 'error');
    }
  };

  const columns = [
    { header: 'Título', accessor: 'title' },
    { header: 'Producto', accessor: (row: any) => row.product?.name || 'Varios' },
    { 
      header: 'Descuento', 
      accessor: (row: any) => row.discount_percent ? `${row.discount_percent}%` : `$${row.discount_amount}` 
    },
    { 
      header: 'Vigencia', 
      accessor: (row: any) => (
        <span className="text-xs">
          {new Date(row.start_date).toLocaleDateString()} - {new Date(row.end_date).toLocaleDateString()}
        </span>
      ) 
    },
    { 
      header: 'Estado', 
      accessor: (row: any) => (
        <Badge variant={row.is_active ? 'success' : 'default'}>
          {row.is_active ? 'Activa' : 'Inactiva'}
        </Badge>
      ) 
    },
    {
      header: 'Acciones',
      accessor: (row: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setCurrentItem(row); setIsModalOpen(true); }}>Editar</Button>
          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(row.id)}>Borrar</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Promociones</h1>
          <p className="text-muted text-sm">Gestioná ofertas y descuentos especiales</p>
        </div>
        <Button onClick={() => { setCurrentItem({ title: '', discount_percent: 0, is_active: true }); setIsModalOpen(true); }}>
          + Nueva Promoción
        </Button>
      </div>

      <DataTable columns={columns} data={promotions} isLoading={isLoading} />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentItem?.id ? 'Editar Promoción' : 'Nueva Promoción'}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      >
        <Input label="Título de la Promoción" value={currentItem?.title || ''} onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })} required />
        <Select
          label="Producto"
          options={[{ value: '', label: 'Seleccionar Producto' }, ...products.map(p => ({ value: p.id, label: p.name }))]}
          value={currentItem?.product_id || ''}
          onChange={(e) => setCurrentItem({ ...currentItem, product_id: e.target.value })}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Desc. Porcentaje (%)" type="number" value={currentItem?.discount_percent || 0} onChange={(e) => setCurrentItem({ ...currentItem, discount_percent: Number(e.target.value) })} />
          <Input label="Desc. Monto ($)" type="number" value={currentItem?.discount_amount || 0} onChange={(e) => setCurrentItem({ ...currentItem, discount_amount: Number(e.target.value) })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Fecha Inicio" type="date" value={currentItem?.start_date?.split('T')[0] || ''} onChange={(e) => setCurrentItem({ ...currentItem, start_date: e.target.value })} required />
          <Input label="Fecha Fin" type="date" value={currentItem?.end_date?.split('T')[0] || ''} onChange={(e) => setCurrentItem({ ...currentItem, end_date: e.target.value })} required />
        </div>
        <Input label="Descripción" value={currentItem?.description || ''} onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })} />
        <div className="flex items-center gap-2 mt-2">
          <input type="checkbox" id="p_active" checked={currentItem?.is_active ?? true} onChange={(e) => setCurrentItem({ ...currentItem, is_active: e.target.checked })} />
          <label htmlFor="p_active" className="text-sm">Promoción activa</label>
        </div>
      </FormModal>
    </div>
  );
}
