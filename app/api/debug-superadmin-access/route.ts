import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG SUPERADMIN ACCESS ===');

    // 1. Verificar estado actual del usuario facudev4@gmail.com
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'facudev4@gmail.com')
      .single();

    if (userError) {
      console.error('Error obteniendo usuario:', userError);
      return NextResponse.json({ 
        error: 'Error obteniendo usuario', 
        details: userError.message 
      }, { status: 500 });
    }

    console.log('Usuario encontrado:', user);

    // 2. Probar login directamente
    let loginResult = null;
    let loginSuccess = false;
    
    try {
      const loginResponse = await fetch('http://localhost:9000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'facudev4@gmail.com', 
          password: 'admin123' 
        })
      });

      loginResult = await loginResponse.json();
      loginSuccess = loginResponse.status === 200;
      
      console.log('Login response status:', loginResponse.status);
      console.log('Login result:', loginResult);
      
    } catch (e) {
      console.error('Error en login:', e);
      loginResult = { error: e instanceof Error ? e.message : 'Unknown error' };
    }

    // 3. Si el login fue exitoso, probar acceso a rutas
    let routeTests = [];
    
    if (loginSuccess && loginResult.token) {
      const routes = [
        { name: 'Dashboard Admin', path: '/admin/dashboard' },
        { name: 'Super Admin', path: '/admin/superadmin' },
        { name: 'Usuarios', path: '/admin/usuarios' },
        { name: 'Configuración', path: '/admin/configuracion' }
      ];

      for (const route of routes) {
        try {
          const routeResponse = await fetch(`http://localhost:9000${route.path}`, {
            headers: {
              'Cookie': `token=${loginResult.token}`
            }
          });

          routeTests.push({
            route: route.name,
            path: route.path,
            status: routeResponse.status,
            success: routeResponse.status === 200,
            redirected: routeResponse.redirected,
            redirectUrl: routeResponse.url
          });
        } catch (e) {
          routeTests.push({
            route: route.name,
            path: route.path,
            status: 'error',
            success: false,
            error: e instanceof Error ? e.message : 'Unknown error'
          });
        }
      }
    }

    // 4. Verificar configuración del middleware
    const middlewareConfig = {
      adminEmails: ['facudev4@gmail.com', 'facucercuetti420@gmail.com'],
      userRole: user?.role,
      userActive: user?.is_active,
      loginSuccess: loginSuccess,
      hasToken: loginResult?.token ? true : false
    };

    // 5. Verificar si la página de superadmin existe
    let superadminPageExists = false;
    try {
      const fs = await import('fs');
      const path = await import('path');
      const superadminPath = path.join(process.cwd(), 'app/admin/superadmin/page.tsx');
      superadminPageExists = fs.existsSync(superadminPath);
    } catch (e) {
      console.error('Error verificando página superadmin:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Diagnóstico completo de acceso a superadmin',
      user: {
        email: user?.email,
        role: user?.role,
        full_name: user?.full_name,
        is_active: user?.is_active
      },
      loginTest: {
        success: loginSuccess,
        result: loginResult
      },
      routeTests: routeTests,
      middlewareConfig: middlewareConfig,
      superadminPageExists,
      diagnosis: {
        problem: !loginSuccess ? 'Login fallando' : 
                !routeTests.some(t => t.success) ? 'Acceso a rutas bloqueado' :
                !routeTests.find(t => t.path === '/admin/superadmin')?.success ? 'Acceso a superadmin bloqueado' :
                'Todo funciona correctamente',
        recommendation: !loginSuccess ? 'Verificar credenciales y endpoint de login' :
                      !routeTests.some(t => t.success) ? 'Verificar middleware y permisos' :
                      !routeTests.find(t => t.path === '/admin/superadmin')?.success ? 'Verificar página superadmin y redirección' :
                      'Probar acceso manual en navegador'
      },
      nextSteps: [
        '1. Revisar logs del middleware para ver bloqueos',
        '2. Verificar que la redirección del login funcione',
        '3. Probar acceso directo a /admin/superadmin con token',
        '4. Verificar configuración de roles en el login'
      ]
    });

  } catch (error) {
    console.error('Error en diagnóstico superadmin:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
