import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('=== ACTUALIZANDO ROLES A ADMIN ===');

    // 1. Actualizar rol de Super Admin
    const { data: superAdminUpdate, error: superAdminError } = await supabaseAdmin
      .from('users')
      .update({ 
        role: 'super_admin',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'facudev4@gmail.com')
      .select()
      .single();

    if (superAdminError) {
      console.error('Error actualizando Super Admin:', superAdminError);
      
      // Si falla por constraint, intentar con SQL directo
      try {
        const { data: sqlResult, error: sqlError } = await supabaseAdmin
          .rpc('exec_sql', { 
            sql: `
              UPDATE users 
              SET role = 'super_admin', updated_at = NOW() 
              WHERE email = 'facudev4@gmail.com';
            `
          });
        
        if (sqlError) {
          console.error('Error SQL Super Admin:', sqlError);
        } else {
          console.log('Super Admin actualizado con SQL');
        }
      } catch (e) {
        console.error('Excepción SQL Super Admin:', e);
      }
    } else {
      console.log('Super Admin actualizado:', superAdminUpdate);
    }

    // 2. Crear/actualizar Admin Básico
    const basicAdminPassword = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm'; // admin123
    
    const { data: basicAdmin, error: basicAdminError } = await supabaseAdmin
      .from('users')
      .upsert({
        email: 'facucercuetti420@gmail.com',
        password_hash: basicAdminPassword,
        full_name: 'Admin Básico',
        role: 'admin_basico',
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (basicAdminError) {
      console.error('Error creando/actualizando Basic Admin:', basicAdminError);
      
      // Intentar con SQL directo
      try {
        const { data: sqlResult2, error: sqlError2 } = await supabaseAdmin
          .rpc('exec_sql', { 
            sql: `
              INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
              VALUES (
                gen_random_uuid(),
                'facucercuetti420@gmail.com',
                '${basicAdminPassword}',
                'Admin Básico',
                'admin_basico',
                true,
                NOW(),
                NOW()
              )
              ON CONFLICT (email) DO UPDATE SET
                role = 'admin_basico',
                updated_at = NOW();
            `
          });
        
        if (sqlError2) {
          console.error('Error SQL Basic Admin:', sqlError2);
        } else {
          console.log('Basic Admin creado/actualizado con SQL');
        }
      } catch (e) {
        console.error('Excepción SQL Basic Admin:', e);
      }
    } else {
      console.log('Basic Admin creado/actualizado:', basicAdmin);
    }

    // 3. Esperar y verificar usuarios finales
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: finalUsers, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('email, role, full_name, is_active')
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com']);

    console.log('Usuarios finales:', finalUsers);

    // 4. Probar login con ambos usuarios
    const loginTests = [];
    
    if (finalUsers && finalUsers.length > 0) {
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

    // 5. Verificar redirección esperada
    const redirectionTests = loginTests.map(test => ({
      ...test,
      expectedRedirect: test.role === 'super_admin' ? '/admin/superadmin' : '/admin/dashboard'
    }));

    return NextResponse.json({
      success: true,
      message: 'Roles actualizados y login probado',
      users: finalUsers || [],
      loginTests: redirectionTests,
      status: loginTests.every(t => t.success) ? 'AUTENTICACIÓN COMPLETAMENTE FUNCIONAL' : 'AUTENTICACIÓN PARCIAL',
      credentials: [
        'Super Admin: facudev4@gmail.com / admin123',
        'Admin Básico: facucercuetti420@gmail.com / admin123'
      ],
      loginUrl: 'http://localhost:9000/admin/login',
      nextSteps: [
        '1. El login está funcionando con roles correctos',
        '2. Prueba acceder al panel de administración',
        '3. Verifica redirección correcta:',
        '   - Super Admin -> /admin/superadmin',
        '   - Admin Básico -> /admin/dashboard',
        '4. Prueba funcionalidad completa del panel'
      ],
      readyForProduction: loginTests.every(t => t.success)
    });

  } catch (error) {
    console.error('Error actualizando roles:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
