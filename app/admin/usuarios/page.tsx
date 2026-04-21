'use client';

import { useCallback, useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { FormModal } from '@/components/admin/FormModal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import type { User, UserRole } from '@/types';

type UserDraft = {
  id?: string;
  full_name: string;
  email: string;
  password?: string;
  role?: UserRole;
  is_active?: boolean;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentItem, setCurrentItem] = useState<UserDraft | null>(null);
  const { addToast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users');
      setUsers(await res.json());
    } catch { addToast('Error', 'error'); }
    finally { setIsLoading(false); }
  }, [addToast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Logic for update or create (via different endpoints)
    const isEditing = !!currentItem?.id;
    const url = isEditing ? `/api/users/${currentItem.id}` : '/api/auth/register';
    
    try {
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentItem),
      });
      if (!res.ok) throw new Error('Error al guardar usuario');
      addToast(isEditing ? 'Usuario actualizado' : 'Usuario creado', 'success');
      setIsModalOpen(false);
      fetchUsers();
    } catch { addToast('Error', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const columns = [
    { header: 'Nombre', accessor: 'full_name' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Rol', 
      accessor: (row: User) => (
        <Badge variant={row.role === 'super_admin' ? 'info' : 'default'}>{row.role.toUpperCase()}</Badge>
      ) 
    },
    { 
      header: 'Estado', 
      accessor: (row: User) => (
        <Badge variant={row.is_active ? 'success' : 'error'}>{row.is_active ? 'Activo' : 'Inactivo'}</Badge>
      ) 
    },
    {
      header: 'Acciones',
      accessor: (row: User) => (
        <Button variant="ghost" size="sm" onClick={() => { setCurrentItem(row); setIsModalOpen(true); }}>Editar</Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios & Permisos</h1>
          <p className="text-muted text-sm">Gestioná el equipo que opera la plataforma</p>
        </div>
        <Button onClick={() => { setCurrentItem({ full_name: '', email: '', password: '', role: 'customer', is_active: true }); setIsModalOpen(true); }}>
          + Nuevo Usuario
        </Button>
      </div>

      <DataTable columns={columns} data={users} isLoading={isLoading} />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentItem?.id ? 'Editar Usuario' : 'Nuevo Usuario'}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      >
        <Input label="Nombre Completo" value={currentItem?.full_name || ''} onChange={(e) => setCurrentItem({ ...(currentItem ?? { full_name: '', email: '', role: 'customer', is_active: true }), full_name: e.target.value })} required />
        <Input label="Email" type="email" value={currentItem?.email || ''} onChange={(e) => setCurrentItem({ ...(currentItem ?? { full_name: '', email: '', role: 'customer', is_active: true }), email: e.target.value })} required disabled={!!currentItem?.id} />
        {!currentItem?.id && (
          <Input label="Contraseña" type="password" value={currentItem?.password || ''} onChange={(e) => setCurrentItem({ ...(currentItem ?? { full_name: '', email: '', role: 'customer', is_active: true }), password: e.target.value })} required />
        )}
        <Select
          label="Rol"
          options={[
            { value: 'admin_basico', label: 'Admin Básico' },
            { value: 'super_admin', label: 'Super Admin' },
            { value: 'customer', label: 'Customer' },
          ]}
          value={currentItem?.role || 'customer'}
          onChange={(e) => setCurrentItem({ ...(currentItem ?? { full_name: '', email: '', role: 'customer', is_active: true }), role: e.target.value as UserRole })}
        />
        <div className="flex items-center gap-2 mt-2">
          <input type="checkbox" id="u_active" checked={currentItem?.is_active ?? true} onChange={(e) => setCurrentItem({ ...(currentItem ?? { full_name: '', email: '', role: 'customer', is_active: true }), is_active: e.target.checked })} />
          <label htmlFor="u_active" className="text-sm">Usuario activo</label>
        </div>
      </FormModal>
    </div>
  );
}
