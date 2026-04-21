import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('=== DIAGNÓSTICO COMPLETO DEL SISTEMA ===');

    // 1. Verificar estructura de la tabla users
    const { data: tableStructure, error: tableError } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('Error obteniendo estructura:', tableError);
    }

    // 2. Verificar todos los usuarios y sus roles
    const { data: allUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('email, role, full_name, is_active, created_at, updated_at');

    if (usersError) {
      console.error('Error obteniendo usuarios:', usersError);
    }

    // 3. Verificar roles únicos en la base de datos
    const { data: uniqueRoles, error: rolesError } = await supabaseAdmin
      .from('users')
      .select('role')
      .not('role', 'is', null);

    const distinctRoles = uniqueRoles ? [...new Set(uniqueRoles.map(u => u.role))] : [];

    // 4. Probar login con cada usuario
    const loginTests = [];
    
    if (allUsers) {
      for (const user of allUsers) {
        try {
          const loginResponse = await fetch('http://localhost:9000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: user.email, 
              password: 'admin123' 
            })
          });

          const loginResult = await loginResponse.json();
          loginTests.push({
            email: user.email,
            role: user.role,
            status: loginResponse.status,
            result: loginResult,
            success: loginResponse.status === 200,
            hasToken: !!loginResult.token
          });
        } catch (e) {
          loginTests.push({
            email: user.email,
            role: user.role,
            status: 'error',
            result: e instanceof Error ? e.message : 'Unknown error',
            success: false
          });
        }
      }
    }

    // 5. Verificar rutas existentes
    const adminRoutes = [
      '/admin/dashboard',
      '/admin/superadmin',
      '/admin/categorias',
      '/admin/productos',
      '/admin/pedidos',
      '/admin/ventas',
      '/admin/usuarios'
    ];

    const publicRoutes = [
      '/',
      '/catalogo',
      '/descuentos',
      '/promociones',
      '/novedades',
      '/ofertas'
    ];

    // 6. Probar acceso a rutas de admin con token
    const routeTests = [];
    
    const successfulLogin = loginTests.find(t => t.success);
    if (successfulLogin && successfulLogin.hasToken) {
      for (const route of adminRoutes) {
        try {
          const routeResponse = await fetch(`http://localhost:9000${route}`, {
            headers: {
              'Cookie': `token=${successfulLogin.result.token}`
            }
          });

          routeTests.push({
            route,
            status: routeResponse.status,
            success: routeResponse.status === 200
          });
        } catch (e) {
          routeTests.push({
            route,
            status: 'error',
            success: false
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Diagnóstico completo del sistema',
      tableStructure: tableStructure ? {
        columns: Object.keys(tableStructure[0] || {}),
        sample: tableStructure[0]
      } : null,
      allUsers: allUsers || [],
      distinctRoles: distinctRoles,
      loginTests: loginTests,
      routeTests: routeTests,
      systemInfo: {
        adminRoutes,
        publicRoutes,
        totalUsers: allUsers?.length || 0,
        activeUsers: allUsers?.filter(u => u.is_active).length || 0
      },
      recommendations: [
        '1. Verificar que los roles en la base de datos coincidan con los del middleware',
        '2. Asegurar que las rutas de admin estén protegidas correctamente',
        '3. Actualizar roles de usuario si es necesario',
        '4. Verificar que los dashboards existan y funcionen'
      ]
    });

  } catch (error) {
    console.error('Error en diagnóstico completo:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
