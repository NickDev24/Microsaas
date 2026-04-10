'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const menuSections = [
  {
    title: 'Navegación',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
      { label: 'Overview', href: '/admin/overview', icon: '📈' },
    ]
  },
  {
    title: 'Ventas',
    items: [
      { label: 'Ventas', href: '/admin/ventas', icon: '💰' },
      { label: 'Pedidos', href: '/admin/pedidos', icon: '📦' },
      { label: 'Facturación', href: '/admin/facturacion', icon: '🧾' },
    ]
  },
  {
    title: 'Catálogo',
    items: [
      { label: 'Productos', href: '/admin/productos', icon: '👕' },
      { label: 'Categorías', href: '/admin/categorias', icon: '📁' },
      { label: 'Promociones', href: '/admin/promociones', icon: '🏷️' },
      { label: 'Ediciones Limitadas', href: '/admin/edicion-limitada', icon: '✨' },
      { label: 'Descuentos', href: '/admin/descuentos', icon: '❄️' },
    ]
  },
  {
    title: 'Operaciones',
    items: [
      { label: 'Stock Bajo', href: '/admin/stock-bajo', icon: '⚠️' },
      { label: 'Webhooks', href: '/admin/webhooks', icon: '🔗' },
    ]
  },
  {
    title: 'Usuarios',
    items: [
      { label: 'Usuarios', href: '/admin/usuarios', icon: '👥' },
      { label: 'Roles', href: '/admin/roles', icon: '🔐' },
    ]
  },
  {
    title: 'Configuración',
    items: [
      { label: 'Configuración', href: '/admin/configuracion', icon: '⚙️' },
      { label: 'Datos del Local', href: '/admin/local', icon: '🏪' },
      { label: 'Documentos Legales', href: '/admin/legales', icon: '⚖️' },
    ]
  }
];

interface SidebarProps {
  isDark?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isDark = false, isMobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const toggleSection = (sectionTitle: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionTitle)) {
      newCollapsed.delete(sectionTitle);
    } else {
      newCollapsed.add(sectionTitle);
    }
    setCollapsedSections(newCollapsed);
  };

  return (
    <aside className={`
      w-64 h-screen flex flex-col fixed inset-y-0 left-0 z-50 transition-colors duration-300
      bg-surface border-border
      ${isMobile ? 'shadow-2xl rounded-r-3xl w-[86vw] max-w-[18rem]' : ''}
      border-r
    `}>
      {/* Logo + Marca */}
      <div className="p-6 border-b border-border transition-colors duration-300">
        <Link 
          href="/admin/dashboard" 
          className="text-xl font-bold tracking-tight transition-colors text-foreground hover-glow-orange"
          onClick={handleLinkClick}
        >
          TuMarca<span className="text-accent"> Admin</span>
          <div className="text-xs text-muted-2 font-normal mt-1">
            Panel de control
          </div>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-4">
        {menuSections.map((section) => {
          const isCollapsed = collapsedSections.has(section.title);
          
          return (
            <div key={section.title} className="space-y-2">
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-3 py-1 text-xs font-semibold text-muted-2 uppercase tracking-wider hover:text-muted transition-colors"
              >
                <span>{section.title}</span>
                <svg 
                  className={`w-3 h-3 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {!isCollapsed && (
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleLinkClick}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${isActive 
                            ? 'bg-accent text-white shadow-lg shadow-orange-glow' 
                            : 'text-muted hover:bg-surface-2 hover:text-foreground hover-glow-orange'
                          }
                        `}
                      >
                        <span className="text-lg">{item.icon}</span>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Sidebar */}
      <div className="p-4 border-t border-border transition-colors duration-300 space-y-2">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-muted hover:bg-surface-2 hover:text-foreground hover-glow-purple w-full">
          <span>{isDark ? '🌙' : '☀️'}</span>
          <span>Toggle Theme</span>
        </button>
        
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-400 to-pink-400"></div>
          <div>
            <div className="text-xs font-medium text-foreground">Usuario autenticado</div>
            <div className="text-xs">sesión activa</div>
          </div>
        </div>
        
        <Link 
          href="/" 
          onClick={handleLinkClick}
          className={`
            flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            text-muted hover:bg-surface-2 hover:text-foreground hover-glow-pink
          `}
        >
          <span>🌐</span> 
          <span>Ver Tienda</span>
        </Link>
      </div>
    </aside>
  );
}
