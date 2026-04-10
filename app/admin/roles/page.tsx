'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
  isSystem: boolean;
  isActive: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roleName: string;
  avatar?: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
}

export default function RolesPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'permissions'>('roles');
  const [roles, setRoles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, totalUsers: 0 });
  const [showCreateRoleForm, setShowCreateRoleForm] = useState(false);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      setRoles(data.roles || []);
      setUsers(data.users || []);
      setStats(data.stats || { total: 0, active: 0, inactive: 0, totalUsers: 0 });
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availablePermissions = [
    { group: 'Usuarios', permissions: ['users.create', 'users.read', 'users.update', 'users.delete'] },
    { group: 'Productos', permissions: ['products.create', 'products.read', 'products.update', 'products.delete'] },
    { group: 'Pedidos', permissions: ['orders.create', 'orders.read', 'orders.update', 'orders.delete'] },
    { group: 'Categorías', permissions: ['categories.create', 'categories.read', 'categories.update', 'categories.delete'] },
    { group: 'Clientes', permissions: ['customers.read', 'customers.update'] },
    { group: 'Configuración', permissions: ['settings.read', 'settings.update'] },
    { group: 'Webhooks', permissions: ['webhooks.create', 'webhooks.read', 'webhooks.update', 'webhooks.delete'] },
    { group: 'Análisis', permissions: ['analytics.read', 'reports.read'] },
    { group: 'Sistema', permissions: ['system.configure', 'system.backup', 'system.restore'] }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Activo</Badge>;
      case 'inactive':
        return <Badge variant="default">Inactivo</Badge>;
      case 'suspended':
        return <Badge variant="error">Suspendido</Badge>;
      default:
        return <Badge variant="default">Desconocido</Badge>;
    }
  };

  const getPermissionLabel = (permission: string) => {
    const labels: Record<string, string> = {
      'users.create': 'Crear usuarios',
      'users.read': 'Ver usuarios',
      'users.update': 'Editar usuarios',
      'users.delete': 'Eliminar usuarios',
      'products.create': 'Crear productos',
      'products.read': 'Ver productos',
      'products.update': 'Editar productos',
      'products.delete': 'Eliminar productos',
      'orders.create': 'Crear pedidos',
      'orders.read': 'Ver pedidos',
      'orders.update': 'Editar pedidos',
      'orders.delete': 'Eliminar pedidos',
      'categories.create': 'Crear categorías',
      'categories.read': 'Ver categorías',
      'categories.update': 'Editar categorías',
      'categories.delete': 'Eliminar categorías',
      'customers.read': 'Ver clientes',
      'customers.update': 'Editar clientes',
      'settings.read': 'Ver configuración',
      'settings.update': 'Editar configuración',
      'webhooks.create': 'Crear webhooks',
      'webhooks.read': 'Ver webhooks',
      'webhooks.update': 'Editar webhooks',
      'webhooks.delete': 'Eliminar webhooks',
      'analytics.read': 'Ver análisis',
      'reports.read': 'Ver reportes',
      'system.configure': 'Configurar sistema',
      'system.backup': 'Hacer backup',
      'system.restore': 'Restaurar backup'
    };
    return labels[permission] || permission;
  };

  const handleToggleRole = async (roleId: string) => {
    try {
      // Simular toggle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRoles(prev => prev.map(role => 
        role.id === roleId 
          ? { ...role, isActive: !role.isActive }
          : role
      ));
    } catch (error) {
      console.error('Error toggling role:', error);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este rol?')) return;
    
    try {
      // Simular eliminación
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRoles(prev => prev.filter(role => role.id !== roleId));
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRoleId: string) => {
    try {
      // Simular actualización
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              role: newRoleId,
              roleName: roles.find(r => r.id === newRoleId)?.name || 'Unknown'
            }
          : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      // Simular toggle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          const newStatus = user.status === 'active' ? 'inactive' : 'active';
          return { ...user, status: newStatus as 'active' | 'inactive' | 'suspended' };
        }
        return user;
      }));
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const activeUsers = users.filter(u => u.is_active);
  const inactiveUsers = users.filter(u => !u.is_active);
  const suspendedUsers = users.filter(u => u.status === 'suspended');

  const tabs: Array<{ id: 'roles' | 'users' | 'permissions'; label: string; count: number }> = [
    { id: 'roles', label: 'Roles', count: roles.length },
    { id: 'users', label: 'Usuarios', count: users.length },
    { id: 'permissions', label: 'Permisos', count: availablePermissions.reduce((acc, group) => acc + group.permissions.length, 0) }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Roles y Permisos</h1>
          <p className="text-muted text-sm">Gestiona los roles de usuario y sus permisos en el sistema.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowCreateRoleForm(!showCreateRoleForm)}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            + Nuevo Rol
          </Button>
          <Button
            onClick={() => setShowCreateUserForm(!showCreateUserForm)}
            variant="outline"
          >
            + Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-2">Total Roles</span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-2xl font-bold text-blue-500">{stats.total}</div>
          <div className="text-xs text-muted-2">Roles configurados</div>
        </div>
        
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-2">Usuarios Activos</span>
            <span className="text-2xl">🟢</span>
          </div>
          <div className="text-2xl font-bold text-green-500">{activeUsers.length}</div>
          <div className="text-xs text-muted-2">Usuarios con acceso</div>
        </div>
        
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-2">Inactivos</span>
            <span className="text-2xl">🔴</span>
          </div>
          <div className="text-2xl font-bold text-red-500">{inactiveUsers.length}</div>
          <div className="text-xs text-muted-2">Usuarios sin acceso</div>
        </div>
        
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-2">Total Usuarios</span>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-2xl font-bold text-purple-500">{stats.totalUsers}</div>
          <div className="text-xs text-muted-2">Usuarios en el sistema</div>
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

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'roles' && (
          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{role.name}</h3>
                      <Badge variant={role.isActive ? 'success' : 'default'}>
                        {role.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                      {role.isSystem && (
                        <Badge variant="info" className="text-xs">
                          Sistema
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-2 mb-3">{role.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-2">
                      <span>{role.userCount} usuarios asignados</span>
                      <span>Creado: {new Date(role.createdAt).toLocaleDateString('es-AR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRole(role)}
                    >
                      Ver Permisos
                    </Button>
                    {!role.isSystem && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleRole(role.id)}
                        >
                          {role.isActive ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Eliminar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Permissions Preview */}
                {selectedRole?.id === role.id && (
                  <div className="mt-4 p-4 bg-surface-2 rounded-lg">
                    <h4 className="text-md font-medium text-foreground mb-3">Permisos del Rol</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {role.permissions.map((permission: string) => (
                        <div key={permission} className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-foreground">{getPermissionLabel(permission)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-2">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                      Último Acceso
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-2 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-foreground">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-2">{user.email}</td>
                      <td className="px-4 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                          className="px-2 py-1 text-sm border border-border rounded bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                          {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(user.status)}</td>
                      <td className="px-4 py-4 text-sm text-muted-2">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString('es-AR') : 'Nunca'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id)}
                          >
                            {user.status === 'active' ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            Editar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Sistema de Permisos</h3>
              <div className="space-y-6">
                {availablePermissions.map((group) => (
                  <div key={group.group}>
                    <h4 className="text-md font-medium text-foreground mb-3">{group.group}</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {group.permissions.map((permission) => (
                        <div key={permission} className="flex items-center gap-2 text-sm p-3 bg-surface-2 rounded-lg">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span className="text-foreground">{getPermissionLabel(permission)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
