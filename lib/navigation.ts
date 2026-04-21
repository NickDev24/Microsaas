export interface MenuItem {
  label: string;
  href: string;
  icon: string;
  requiredRole?: 'super_admin' | 'admin_basico';
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const menuSectionsByRole: Record<string, MenuSection[]> = {
  super_admin: [
    {
      title: 'Navegación',
      items: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: 'ð' },
        { label: 'Overview', href: '/admin/overview', icon: 'ð' },
        { label: 'Superadmin', href: '/admin/superadmin', icon: 'ð' },
      ]
    },
    {
      title: 'Ventas',
      items: [
        { label: 'Ventas', href: '/admin/ventas', icon: 'ð°' },
        { label: 'Pedidos', href: '/admin/pedidos', icon: 'ð' },
        { label: 'Facturación', href: '/admin/facturacion', icon: 'ð§¾' },
      ]
    },
    {
      title: 'Catálogo',
      items: [
        { label: 'Productos', href: '/admin/productos', icon: 'ð' },
        { label: 'Categorías', href: '/admin/categorias', icon: 'ð' },
        { label: 'Promociones', href: '/admin/promociones', icon: 'ð' },
        { label: 'Ediciones Limitadas', href: '/admin/edicion-limitada', icon: 'â¨' },
        { label: 'Descuentos', href: '/admin/descuentos', icon: 'âï¸' },
      ]
    },
    {
      title: 'Operaciones',
      items: [
        { label: 'Stock Bajo', href: '/admin/stock-bajo', icon: 'â ï¸' },
        { label: 'Webhooks', href: '/admin/webhooks', icon: 'ð' },
      ]
    },
    {
      title: 'Usuarios',
      items: [
        { label: 'Usuarios', href: '/admin/usuarios', icon: 'ð¥' },
        { label: 'Roles', href: '/admin/roles', icon: 'ð' },
      ]
    },
    {
      title: 'Configuración',
      items: [
        { label: 'Configuración', href: '/admin/configuracion', icon: 'â ï¸' },
        { label: 'Datos del Local', href: '/admin/local', icon: 'ð©ª' },
        { label: 'Documentos Legales', href: '/admin/legales', icon: 'â§ï¸' },
      ]
    }
  ],
  admin_basico: [
    {
      title: 'Navegación',
      items: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: 'ð' },
        { label: 'Overview', href: '/admin/overview', icon: 'ð' },
      ]
    },
    {
      title: 'Ventas',
      items: [
        { label: 'Ventas', href: '/admin/ventas', icon: 'ð°' },
        { label: 'Pedidos', href: '/admin/pedidos', icon: 'ð' },
        { label: 'Facturación', href: '/admin/facturacion', icon: 'ð§¾' },
      ]
    },
    {
      title: 'Catálogo',
      items: [
        { label: 'Productos', href: '/admin/productos', icon: 'ð' },
        { label: 'Categorías', href: '/admin/categorias', icon: 'ð' },
        { label: 'Promociones', href: '/admin/promociones', icon: 'ð' },
        { label: 'Ediciones Limitadas', href: '/admin/edicion-limitada', icon: 'â¨' },
        { label: 'Descuentos', href: '/admin/descuentos', icon: 'âï¸' },
      ]
    },
    {
      title: 'Operaciones',
      items: [
        { label: 'Stock Bajo', href: '/admin/stock-bajo', icon: 'â ï¸' },
      ]
    },
    {
      title: 'Configuración',
      items: [
        { label: 'Datos del Local', href: '/admin/local', icon: 'ð©ª' },
        { label: 'Documentos Legales', href: '/admin/legales', icon: 'â§ï¸' },
      ]
    }
  ]
};

export function getMenuForRole(role: string): MenuSection[] {
  return menuSectionsByRole[role] || menuSectionsByRole.admin_basico;
}
