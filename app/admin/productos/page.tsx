'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { FormModal } from '@/components/admin/FormModal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MultiImageUploader } from '@/components/admin/MultiImageUploader';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Product, Category } from '@/types';

type ProductFormImage = {
  url: string;
  public_id: string;
};

type ProductFormState = Omit<Partial<Product>, 'images'> & {
  images?: ProductFormImage[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentItem, setCurrentItem] = useState<ProductFormState | null>(null);
  const { addToast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      setProducts(pData);
      setCategories(cData);
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
    const url = isEditing ? `/api/products/${currentItem.id}` : '/api/products';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentItem),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }

      addToast(isEditing ? 'Producto actualizado' : 'Producto creado', 'success');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar');
      }
      addToast('Producto eliminado', 'success');
      fetchData();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'Producto',
      accessor: (row: Product) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-surface-2 rounded-lg overflow-hidden border border-border shrink-0">
            {row.product_images?.[0]?.url ? (
              <img src={row.product_images[0].url} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-2">SIN FOTO</div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{row.name}</p>
            <p className="text-xs text-muted-2">SKU: {row.sku}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Categoría',
      accessor: (row: any) => row.categories?.name || 'N/A'
    },
    {
      header: 'Precio',
      accessor: (row: Product) => (
        <div>
          <p className="font-bold">${row.price.toLocaleString()}</p>
          {row.compare_at_price && (
            <p className="text-xs text-muted-2 line-through">${row.compare_at_price.toLocaleString()}</p>
          )}
        </div>
      )
    },
    {
      header: 'Stock',
      accessor: (row: Product) => {
        const isLow = (row.stock ?? 0) <= (row.low_stock_threshold ?? 0);
        return (
          <div className="flex flex-col items-center">
            <span className={`font-bold ${isLow ? 'text-red-500' : 'text-foreground'}`}>{row.stock}</span>
            {isLow && <Badge variant="error">BAJO</Badge>}
          </div>
        );
      }
    },
    {
      header: 'Estado',
      accessor: (row: Product) => (
        <Badge variant={row.is_active ? 'success' : 'default'}>
          {row.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
    {
      header: 'Acciones',
      accessor: (row: Product) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentItem({
                ...row,
                images: row.product_images?.map(img => ({ url: img.url, public_id: img.public_id })) || []
              });
              setIsModalOpen(true);
            }}
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  const categoryOptions = [
    { value: '', label: 'Seleccionar Categoría' },
    ...categories.map(c => ({ value: c.id, label: c.name }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted text-sm">Gestioná tu inventario y catálogo de productos</p>
        </div>
        <Button onClick={() => { setCurrentItem({ name: '', price: 0, stock: 0, images: [], is_active: true }); setIsModalOpen(true); }}>
          + Nuevo Producto
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentItem?.id ? 'Editar Producto' : 'Nuevo Producto'}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre"
            className="col-span-2"
            value={currentItem?.name || ''}
            onChange={(e) => setCurrentItem({ ...(currentItem ?? {}), name: e.target.value })}
            required
          />
          <Select
            label="Categoría"
            options={categoryOptions}
            value={currentItem?.category_id || ''}
            onChange={(e) => setCurrentItem({ ...(currentItem ?? {}), category_id: e.target.value })}
            required
          />
          <Input
            label="SKU"
            value={currentItem?.sku || ''}
            onChange={(e) => setCurrentItem({ ...(currentItem ?? {}), sku: e.target.value })}
            required
          />
          <Input
            label="Precio de Venta"
            type="number"
            value={currentItem?.price || 0}
            onChange={(e) => setCurrentItem({ ...(currentItem ?? {}), price: Number(e.target.value) })}
            required
          />
          <Input
            label="Precio de Lista (Compara)"
            type="number"
            value={currentItem?.compare_at_price || 0}
            onChange={(e) => setCurrentItem({ ...(currentItem ?? {}), compare_at_price: Number(e.target.value) })}
          />
          <Input
            label="Stock Actual"
            type="number"
            value={currentItem?.stock || 0}
            onChange={(e) => setCurrentItem({ ...(currentItem ?? {}), stock: Number(e.target.value) })}
            required
          />
          <Input
            label="Alerta Stock Bajo (Min)"
            type="number"
            value={currentItem?.low_stock_threshold || 5}
            onChange={(e) => setCurrentItem({ ...(currentItem ?? {}), low_stock_threshold: Number(e.target.value) })}
          />
        </div>

        <Input
          label="Descripción"
          value={currentItem?.description || ''}
          onChange={(e) => setCurrentItem({ ...(currentItem ?? {}), description: e.target.value })}
        />

        <MultiImageUploader
          label="Galería de Imágenes"
          images={currentItem?.images || []}
          onChange={(images) => setCurrentItem({ ...(currentItem ?? {}), images })}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={currentItem?.is_active ?? true}
              onChange={(e) => setCurrentItem({ ...(currentItem ?? {}), is_active: e.target.checked })}
              className="rounded border-border"
            />
            <label htmlFor="is_active" className="text-sm font-medium">Activo</label>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_featured"
              checked={currentItem?.is_featured ?? false}
              onChange={(e) => setCurrentItem({ ...(currentItem ?? {}), is_featured: e.target.checked })}
              className="rounded border-border"
            />
            <label htmlFor="is_featured" className="text-sm font-medium">Destacado</label>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
