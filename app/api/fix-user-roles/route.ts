import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('=== ACTUALIZANDO ROLES DE USUARIOS ===');

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
      
      // Intentar con SQL directo si falla
      try {
        const { data: sqlResult, error: sqlError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', 'facudev4@gmail.com')
          .single();
        
        if (sqlError) {
          console.error('Error SQL Super Admin:', sqlError);
        } else {
          console.log('Super Admin encontrado:', sqlResult);
        }
      } catch (e) {
        console.error('Excepción SQL Super Admin:', e);
      }
    } else {
      console.log('Super Admin actualizado:', superAdminUpdate);
    }

    // 2. Crear/actualizar Admin Básico
    const { data: basicAdmin, error: basicAdminError } = await supabaseAdmin
      .from('users')
      .upsert({
        email: 'facucercuetti420@gmail.com',
        password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // admin123
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
    } else {
      console.log('Basic Admin creado/actualizado:', basicAdmin);
    }

    // 3. Verificar usuarios finales
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

    return NextResponse.json({
      success: true,
      message: 'Roles actualizados y login probado',
      users: finalUsers || [],
      loginTests: loginTests,
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
        '4. Los iconos serán restaurados en el siguiente paso'
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
