'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/components/providers/useTheme';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Evitar hydration errors y re-renders infinitos
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoizar el handler para evitar re-renders
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mounted) return;
    
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        const message = data?.error || 'Credenciales incorrectas';
        throw new Error(message);
      }

      // Login successful
      addToast('Bienvenido, login exitoso!', 'success');

      const role = data?.user?.role;
      const userEmail = data?.user?.email;
      
      // Determinar destino basado en el email del usuario
      let destination = '/admin/dashboard';
      
      if (userEmail === 'facudev4@gmail.com') {
        destination = '/admin/superadmin';
      } else if (userEmail === 'facucercuetti420@gmail.com') {
        destination = '/admin/dashboard';
      }
      
      // Guardar información del usuario
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('userEmail', userEmail || '');
        sessionStorage.setItem('userRole', role || 'customer');
        sessionStorage.setItem('loginTime', Date.now().toString());
      }
      
      // Redirección
      router.push(destination);
      router.refresh();
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error inesperado al iniciar sesión';
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, mounted, router, addToast]);

  // Memoizar estilos para evitar re-renders
  const containerClass = useMemo(() => 
    "min-h-screen flex items-center justify-center p-4 transition-colors duration-300 bg-background text-foreground",
    []
  );

  const themeButtonClass = useMemo(() => 
    "absolute top-4 right-4 p-3 rounded-full transition-all duration-300 bg-surface border border-border text-foreground hover:bg-surface-2",
    []
  );

  // Renderizar placeholder hasta que el componente esté montado
  if (!mounted) {
    return (
      <div className={containerClass}>
        <div className="w-full max-w-md">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            <div className="space-y-2 mt-8">
              <div className="h-10 bg-gray-300 rounded"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <button
        onClick={toggleTheme}
        className={themeButtonClass}
        aria-label="Cambiar tema"
      >
        {isDark ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Desktop Design */}
      <div className="hidden lg:flex w-full max-w-6xl">
        {/* Left Panel - Brand */}
        <div className="flex-1 flex flex-col justify-center p-12 rounded-l-3xl bg-accent-gradient">
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tighter">
                MODA<span className="text-orange-200">SHOP</span>
              </h1>
              <p className="text-xl text-orange-100 font-light">
                Panel de Administración
              </p>
            </div>
            
            <div className="space-y-6 text-orange-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Panel Central</h3>
                  <p className="text-sm opacity-90">Control total del negocio</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Análisis en Tiempo Real</h3>
                  <p className="text-sm opacity-90">Métricas y estadísticas</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Seguridad Avanzada</h3>
                  <p className="text-sm opacity-90">Protección de datos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex flex-col justify-center p-12 bg-surface rounded-r-3xl border-l border-border">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2 text-foreground">
                Bienvenido de vuelta
              </h2>
              <p className="text-muted">
                Ingresá tus credenciales para acceder al panel
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="facudev4@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={isDark ? 'dark' : ''}
              />
              <Input
                label="Contraseña"
                type="password"
                placeholder="admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={isDark ? 'dark' : ''}
              />
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                isLoading={isLoading}
                disabled={!mounted}
              >
                {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-2">
              <p>¿Problemas con el acceso?</p>
              <p className="mt-1">Contactá soporte</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Design */}
      <div className="lg:hidden w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            MODA<span className="text-orange-200">SHOP</span>
          </h1>
          <p className="text-muted">Panel de Administración</p>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Bienvenido de vuelta
            </h2>
            <p className="text-sm text-muted">
              Ingresá tus credenciales
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="facudev4@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={isDark ? 'dark' : ''}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="admin123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={isDark ? 'dark' : ''}
            />
            
            <Button 
              type="submit" 
              className="w-full h-10 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
              isLoading={isLoading}
              disabled={!mounted}
            >
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
