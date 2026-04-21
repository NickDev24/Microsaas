'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';

interface TopbarProps {
  isDark?: boolean;
  isMobile?: boolean;
  onToggleTheme?: () => void;
  onToggleSidebar?: () => void;
}

export function Topbar({ isDark = false, isMobile = false, onToggleTheme, onToggleSidebar }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Evitar hydration error
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      router.push('/admin/login');
      router.refresh();
    }
  };

  const getBreadcrumb = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = ['Admin'];
    
    if (pathSegments.length > 1) {
      pathSegments.forEach((segment, index) => {
        if (index > 0) {
          const formatted = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
          breadcrumbs.push(formatted);
        }
      });
    }
    
    return breadcrumbs.join(' / ');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className={`
      h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 transition-colors duration-300
      bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/70 border-border
      border-b
    `}>
      {/* Left Section - Breadcrumb */}
      <div className="flex items-center gap-4 flex-1">
        {/* Sidebar Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className={`p-2 hover-glow-orange ${
            isDark ? 'text-muted hover:text-foreground' : 'text-muted hover:text-foreground'
          }`}
          aria-label="Toggle Sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
        
        {/* Breadcrumb */}
        <div className="hidden sm:block">
          <h2 className={`text-sm lg:text-base font-medium transition-colors ${
            isDark ? 'text-muted' : 'text-muted'
          }`}>
            {getBreadcrumb()}
          </h2>
        </div>
      </div>
      
      {/* Center Section - Search */}
      <div className="flex-1 max-w-xl mx-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar productos, pedidos, clientes..."
            className={`
              w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-border bg-surface-2 text-foreground
              placeholder-muted-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
              transition-all duration-200 hover-glow-orange
            `}
          />
          <svg 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Quick Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/productos/nuevo')}
            className="hover-glow-green text-xs px-3 py-1"
          >
            ➕ Crear producto
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/ventas/nueva')}
            className="hover-glow-green text-xs px-3 py-1"
          >
            ➕ Registrar venta
          </Button>
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 relative hover-glow-purple ${
              isDark ? 'text-muted hover:text-foreground' : 'text-muted hover:text-foreground'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </Button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-lg shadow-lg shadow-orange-glow z-50">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Notificaciones</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="p-3 hover:bg-surface-2 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Venta en tiempo real</p>
                      <p className="text-xs text-muted-2">Nueva venta de $2,500</p>
                    </div>
                    <span className="text-xs text-muted-2">hace 2 min</span>
                  </div>
                </div>
                <div className="p-3 hover:bg-surface-2 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Stock bajo</p>
                      <p className="text-xs text-muted-2">5 productos necesitan reposición</p>
                    </div>
                    <span className="text-xs text-muted-2">hace 15 min</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleTheme}
          className={`p-2 hover-glow-orange ${
            isDark ? 'text-accent hover:text-accent' : 'text-muted hover:text-foreground'
          }`}
        >
          {mounted ? (
            isDark ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            )
          ) : (
            <div className="w-5 h-5" /> // Placeholder para evitar hydration error
          )}
        </Button>

        {/* User Info */}
        <div className="hidden lg:flex flex-col items-end mr-2">
          <span className={`text-sm font-semibold transition-colors ${
            isDark ? 'text-foreground' : 'text-foreground'
          }`}>
            {user?.full_name || 'Usuario autenticado'}
          </span>
          <span className={`text-xs transition-colors ${
            isDark ? 'text-muted-2' : 'text-muted-2'
          }`}>
            {user?.role?.replace('_', ' ') || 'sesión activa'}
          </span>
        </div>

        {/* Logout Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout} 
          className={`
            transition-colors hover-glow-pink
            text-muted hover:text-foreground
          `}
        >
          {isMobile ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          ) : (
            'Cerrar Sesión'
          )}
        </Button>
      </div>
    </header>
  );
}
