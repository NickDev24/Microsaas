'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { FormModal } from '@/components/admin/FormModal';
import { Input } from '@/components/ui/Input';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Category } from '@/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Category> | null>(null);
  const { addToast } = useToast();

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch {
      addToast('Error al cargar categorías', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isEditing = !!currentItem?.id;
    const url = isEditing ? `/api/categories/${currentItem.id}` : '/api/categories';
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

      addToast(isEditing ? 'Categoría actualizada' : 'Categoría creada', 'success');
      setIsModalOpen(false);
      fetchCategories();
    } catch {
      addToast('Error al guardar', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar');
      }
      addToast('Categoría eliminada', 'success');
      fetchCategories();
    } catch {
      addToast('Error al eliminar', 'error');
    }
  };

  const columns = [
    {
      header: 'Imagen',
      accessor: (row: Category) => (
        row.image_url ? (
          <Image src={row.image_url} alt={row.name} width={40} height={40} className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center text-xs text-muted-2">N/A</div>
        )
      ),
    },
    { header: 'Nombre', accessor: 'name' },
    { header: 'Slug', accessor: 'slug' },
    { 
      header: 'Estado', 
      accessor: (row: Category) => (
        <Badge variant={row.is_active ? 'success' : 'default'}>
          {row.is_active ? 'Activa' : 'Inactiva'}
        </Badge>
      ) 
    },
    {
      header: 'Acciones',
      accessor: (row: Category) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentItem(row);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted text-sm">Gestioná las categorías de tu catálogo</p>
        </div>
        <Button onClick={() => { setCurrentItem({ name: '', slug: '', is_active: true }); setIsModalOpen(true); }}>
          + Nueva Categoría
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentItem?.id ? 'Editar Categoría' : 'Nueva Categoría'}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      >
        <Input
          label="Nombre"
          value={currentItem?.name || ''}
          onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
          required
        />
        <Input
          label="Slug (URL)"
          value={currentItem?.slug || ''}
          placeholder="nombre-categoria"
          onChange={(e) => setCurrentItem({ ...currentItem, slug: e.target.value })}
        />
        <Input
          label="Descripción"
          value={currentItem?.description || ''}
          onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
        />
        <ImageUploader
          label="Imagen de Categoría"
          value={currentItem?.image_url || ''}
          onChange={(url) => setCurrentItem({ ...currentItem, image_url: url })}
          folder="categories"
        />
        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="is_active"
            checked={currentItem?.is_active ?? true}
            onChange={(e) => setCurrentItem({ ...currentItem, is_active: e.target.checked })}
            className="rounded border-border"
          />
          <label htmlFor="is_active" className="text-sm font-medium">Categoría activa</label>
        </div>
      </FormModal>
    </div>
  );
}
