'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { FormModal } from '@/components/admin/FormModal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';

export default function SeasonalDiscountsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const { addToast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [res, prodRes] = await Promise.all([
        fetch('/api/seasonal-discounts'),
        fetch('/api/products')
      ]);
      setItems(await res.json());
      setProducts(await prodRes.json());
    } catch (err) { addToast('Error', 'error'); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const method = currentItem?.id ? 'PUT' : 'POST';
    const url = currentItem?.id ? `/api/seasonal-discounts/${currentItem.id}` : '/api/seasonal-discounts';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentItem),
      });
      if (!res.ok) throw new Error('Error al guardar');
      addToast('Descuento de temporada guardado', 'success');
      setIsModalOpen(false);
      fetchData();
    } catch (err) { addToast('Error', 'error'); } 
    finally { setIsSubmitting(false); }
  };

  const columns = [
    { header: 'Título', accessor: 'title' },
    { header: 'Temporada', accessor: 'season' },
    { header: 'Producto', accessor: (row: any) => row.product?.name || 'N/A' },
    { header: 'Descuento', accessor: (row: any) => `${row.discount_percent}%` },
    { 
      header: 'Estado', 
      accessor: (row: any) => (
        <Badge variant={row.is_active ? 'info' : 'default'}>
          {row.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      ) 
    },
    {
      header: 'Acciones',
      accessor: (row: any) => (
        <Button variant="ghost" size="sm" onClick={() => { setCurrentItem(row); setIsModalOpen(true); }}>Editar</Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Descuentos de Temporada</h1>
          <p className="text-muted text-sm">Gestioná rebajas de Verano, Invierno, etc.</p>
        </div>
        <Button onClick={() => { setCurrentItem({ title: '', season: 'Verano', discount_percent: 10, is_active: true }); setIsModalOpen(true); }}>
          + Nuevo Descuento
        </Button>
      </div>

      <DataTable columns={columns} data={items} isLoading={isLoading} />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Configurar Descuento de Temporada"
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      >
        <Input label="Título descriptivo" value={currentItem?.title || ''} onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })} required />
        <Select
          label="Temporada"
          options={[
            { value: 'Verano', label: 'Verano' },
            { value: 'Otoño', label: 'Otoño' },
            { value: 'Invierno', label: 'Invierno' },
            { value: 'Primavera', label: 'Primavera' },
          ]}
          value={currentItem?.season || 'Verano'}
          onChange={(e) => setCurrentItem({ ...currentItem, season: e.target.value })}
        />
        <Select
          label="Producto"
          options={[{ value: '', label: 'Seleccionar' }, ...products.map(p => ({ value: p.id, label: p.name }))]}
          value={currentItem?.product_id || ''}
          onChange={(e) => setCurrentItem({ ...currentItem, product_id: e.target.value })}
          required
        />
        <Input label="Porcentaje de Descuento (%)" type="number" value={currentItem?.discount_percent || 0} onChange={(e) => setCurrentItem({ ...currentItem, discount_percent: Number(e.target.value) })} required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Fecha Inicio" type="date" value={currentItem?.start_date?.split('T')[0] || ''} onChange={(e) => setCurrentItem({ ...currentItem, start_date: e.target.value })} required />
          <Input label="Fecha Fin" type="date" value={currentItem?.end_date?.split('T')[0] || ''} onChange={(e) => setCurrentItem({ ...currentItem, end_date: e.target.value })} required />
        </div>
      </FormModal>
    </div>
  );
}
