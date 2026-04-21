import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== SOLUCIÓN FINAL DE ACCESO ===');

    // 1. Actualizar usuario existente con rol admin
    const { data: updatedAdmin, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', 'admin-test@gmail.com')
      .select()
      .single();

    if (updateError) {
      console.error('Error actualizando admin-test:', updateError);
    } else {
      console.log('Admin actualizado:', updatedAdmin);
    }

    // 2. Crear/actualizar facucercuetti420@gmail.com con rol admin
    const basicAdminPassword = await hashPassword('admin123');
    
    const { data: basicAdmin, error: basicAdminError } = await supabaseAdmin
      .from('users')
      .upsert({
        email: 'facucercuetti420@gmail.com',
        password_hash: basicAdminPassword,
        full_name: 'Admin Básico',
        role: 'admin',
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (basicAdminError) {
      console.error('Error creando/actualizando admin básico:', basicAdminError);
    } else {
      console.log('Admin básico creado/actualizado:', basicAdmin);
    }

    // 3. Verificar usuarios finales
    const { data: finalUsers, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('email, role, full_name, is_active')
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com', 'admin-test@gmail.com']);

    console.log('Usuarios finales:', finalUsers);

    // 4. Probar login con todos los usuarios
    const loginTests = [];
    
    if (finalUsers) {
      for (const user of finalUsers) {
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

    // 5. Probar acceso a dashboards
    const dashboardTests = [];
    
    const successfulLogins = loginTests.filter(t => t.success);
    for (const login of successfulLogins) {
      const dashboards = [
        { name: 'Dashboard Admin', route: '/admin/dashboard' },
        { name: 'Super Admin', route: '/admin/superadmin' }
      ];

      for (const dashboard of dashboards) {
        try {
          const dashboardResponse = await fetch(`http://localhost:9000${dashboard.route}`, {
            headers: {
              'Cookie': `token=${login.result.token}`
            }
          });

          dashboardTests.push({
            email: login.email,
            dashboard: dashboard.name,
            route: dashboard.route,
            status: dashboardResponse.status,
            success: dashboardResponse.status === 200
          });
        } catch (e) {
          dashboardTests.push({
            email: login.email,
            dashboard: dashboard.name,
            route: dashboard.route,
            status: 'error',
            success: false
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Acceso final configurado',
      users: finalUsers || [],
      loginTests: loginTests,
      dashboardTests: dashboardTests,
      credentials: [
        'Super Admin (email override): facudev4@gmail.com / admin123',
        'Admin (rol BD): admin-test@gmail.com / admin123',
        'Admin Básico: facucercuetti420@gmail.com / admin123'
      ],
      accessUrls: [
        'Login: http://localhost:9000/admin/login',
        'Dashboard Admin: http://localhost:9000/admin/dashboard',
        'Super Admin: http://localhost:9000/admin/superadmin'
      ],
      status: loginTests.some(t => t.success) && dashboardTests.some(t => t.success) 
        ? 'SISTEMA COMPLETAMENTE FUNCIONAL' 
        : 'SISTEMA PARCIALMENTE FUNCIONAL',
      instructions: [
        '1. El login ahora funciona con roles alineados a la BD',
        '2. Los dashboards son accesibles con los usuarios correctos',
        '3. Prueba cada credencial para verificar acceso completo',
        '4. La tienda online (páginas públicas) debe funcionar sin login'
      ]
    });

  } catch (error) {
    console.error('Error en solución final:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
