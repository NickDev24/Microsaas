'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { FormModal } from '@/components/admin/FormModal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';

export default function LimitedEditionsPage() {
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
        fetch('/api/limited-editions'),
        fetch('/api/products')
      ]);
      setItems(await res.json());
      setProducts(await prodRes.json());
    } catch (err) {
      addToast('Error al cargar datos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const method = currentItem?.id ? 'PUT' : 'POST';
    const url = currentItem?.id ? `/api/limited-editions/${currentItem.id}` : '/api/limited-editions';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentItem),
      });
      addToast('Guardado correctamente', 'success');
      setIsModalOpen(false);
      fetchData();
    } catch (err) { addToast('Error', 'error'); } 
    finally { setIsSubmitting(false); }
  };

  const columns = [
    { header: 'Colección', accessor: 'title' },
    { header: 'Producto', accessor: (row: any) => row.product?.name || 'N/A' },
    { 
      header: 'Unidades', 
      accessor: (row: any) => (
        <div className="flex items-baseline gap-1">
          <span className="font-bold">{row.remaining_units}</span>
          <span className="text-xs text-muted-2">/ {row.total_units}</span>
        </div>
      ) 
    },
    { 
      header: 'Progreso', 
      accessor: (row: any) => {
        const percent = (row.remaining_units / row.total_units) * 100;
        return (
          <div className="w-24 h-1.5 bg-surface-2 rounded-full overflow-hidden">
            <div className={`h-full ${percent < 20 ? 'bg-red-500' : 'bg-foreground'}`} style={{ width: `${percent}%` }} />
          </div>
        );
      } 
    },
    {
      header: 'Acciones',
      accessor: (row: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setCurrentItem(row); setIsModalOpen(true); }}>Editar</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ediciones Limitadas</h1>
          <p className="text-muted text-sm">Gestioná colecciones exclusivas con stock limitado</p>
        </div>
        <Button onClick={() => { setCurrentItem({ title: '', total_units: 100, remaining_units: 100, is_active: true }); setIsModalOpen(true); }}>
          + Nueva Edición
        </Button>
      </div>

      <DataTable columns={columns} data={items} isLoading={isLoading} />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Configurar Edición Limitada"
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      >
        <Input label="Título de Colección" value={currentItem?.title || ''} onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })} required />
        <Select
          label="Producto Base"
          options={[{ value: '', label: 'Seleccionar' }, ...products.map(p => ({ value: p.id, label: p.name }))]}
          value={currentItem?.product_id || ''}
          onChange={(e) => setCurrentItem({ ...currentItem, product_id: e.target.value })}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Total Unidades" type="number" value={currentItem?.total_units || 0} onChange={(e) => setCurrentItem({ ...currentItem, total_units: Number(e.target.value), remaining_units: Number(e.target.value) })} required />
          <Input label="Unidades Restantes" type="number" value={currentItem?.remaining_units || 0} onChange={(e) => setCurrentItem({ ...currentItem, remaining_units: Number(e.target.value) })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Fecha Lanzamiento" type="date" value={currentItem?.release_date?.split('T')[0] || ''} onChange={(e) => setCurrentItem({ ...currentItem, release_date: e.target.value })} required />
          <Input label="Fecha Fin (Opcional)" type="date" value={currentItem?.end_date?.split('T')[0] || ''} onChange={(e) => setCurrentItem({ ...currentItem, end_date: e.target.value })} />
        </div>
      </FormModal>
    </div>
  );
}
