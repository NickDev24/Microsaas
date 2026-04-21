'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/components/providers/useTheme';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Debugging: Verificar credenciales antes de enviar
      console.log('Attempting login with:', { email, password: password ? '***' : 'empty' });
      
      // Exactamente igual al curl que funciona
      const requestBody = JSON.stringify({ email, password });
      console.log('Request body:', requestBody);
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: requestBody,
        // Sin credentials: 'include' para que sea idéntico al curl
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));

      const data = await res.json();
      console.log('=== LOGIN RESPONSE START ===');
      console.log('Status:', res.status);
      console.log('Data:', data);
      console.log('=== LOGIN RESPONSE END ===');
      
      if (!res.ok) {
        const message =
          data?.details && typeof data.details === 'string'
            ? `${data.error || 'Error'}: ${data.details}`
            : data?.error || 'Credenciales incorrectas';
        
        // Solo log en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.error('Login error:', message);
        }
        
        throw new Error(message);
      }

      // Login successful - no sensitive data logged
      addToast('Bienvenido, login exitoso!', 'success');

      const role = data?.user?.role;
      const userEmail = data?.user?.email;
      
      // Debug info only in development
      if (process.env.NODE_ENV === 'development') {
        console.log('=== LOGIN DEBUG ===');
        console.log('Role:', role);
        console.log('Email logged for debugging');
      }
      
      // Determinar destino basado en el email del usuario
      let destination = '/admin/dashboard'; // default
      
      if (userEmail === 'facudev4@gmail.com') {
        destination = '/admin/superadmin';
        console.log('Super Admin destination:', destination);
      } else if (userEmail === 'facucercuetti420@gmail.com') {
        destination = '/admin/dashboard';
        console.log('Admin Básico destination:', destination);
      } else {
        console.log('Default destination:', destination);
      }
      
      console.log('=== EXECUTING REDIRECT ===');
      console.log('Final destination:', destination);
      
      // Guardar información del usuario para uso futuro
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('userEmail', userEmail);
        sessionStorage.setItem('userRole', role || 'customer');
        sessionStorage.setItem('loginTime', Date.now().toString());
        console.log('Session data saved');
      }
      
      // Redirección inmediata sin delay
      console.log('About to redirect immediately...');
      
      try {
        console.log('Using window.location.href to:', destination);
        window.location.href = destination;
        console.log('Redirect command sent');
      } catch (error) {
        console.error('Redirect failed:', error);
        // Fallback
        window.location.replace(destination);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error inesperado al iniciar sesión';
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300 bg-background text-foreground">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-3 rounded-full transition-all duration-300 bg-surface border border-border text-foreground hover:bg-surface-2"
        aria-label="Cambiar tema"
      >
        {isDark ? '🌙' : '☀️'}
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
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold">Dashboard Completo</h3>
                  <p className="text-sm opacity-80">Control total de tu negocio</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🛍️</span>
                </div>
                <div>
                  <h3 className="font-semibold">Gestión de Productos</h3>
                  <p className="text-sm opacity-80">Catálogo inteligente</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <h3 className="font-semibold">Análisis en Tiempo Real</h3>
                  <p className="text-sm opacity-80">Métricas y reportes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-12 rounded-r-3xl bg-surface border border-border">
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={isDark ? 'dark' : ''}
              />
              
              <Button 
                type="submit" 
                className="w-full h-12 font-semibold"
                isLoading={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-2">
              <p>¿Necesitas ayuda? Contactá al soporte técnico</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Design */}
      <div className="lg:hidden w-full max-w-md">
        <div className="p-8 rounded-3xl shadow-2xl border bg-surface border-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-4xl">🛍️</span>
              <h1 className="text-3xl font-black tracking-tighter text-foreground">
                MODA<span className={isDark ? 'text-orange-400' : 'text-orange-600'}>SHOP</span>
              </h1>
            </div>
            <p className="text-muted">
              Panel Admin
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={isDark ? 'dark' : ''}
            />
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
              isLoading={isLoading}
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
  );
}
