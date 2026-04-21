'use client';

import { useEffect } from 'react';

// Componente para redirección directa después del login
export default function DirectRedirect() {
  useEffect(() => {
    // Obtener el token del localStorage o de la respuesta del login
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userEmail = urlParams.get('email');
    const destination = urlParams.get('destination') || '/admin/dashboard';
    
    console.log('Direct redirect:', { token: token ? 'exists' : 'missing', userEmail, destination });
    
    if (token && userEmail) {
      // Guardar token en localStorage como fallback
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_email', userEmail);
      
      // Redirigir al destino
      console.log('Redirecting to:', destination);
      window.location.href = destination;
    } else {
      // Si no hay token, volver al login
      console.log('No token found, redirecting to login');
      window.location.href = '/admin/login';
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
}
