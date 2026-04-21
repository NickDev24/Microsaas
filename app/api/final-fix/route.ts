import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== SOLUCIÓN FINAL DE AUTENTICACIÓN ===');

    // 1. Verificar estructura actual de la tabla
    const { data: sampleUser, error: sampleError } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(1);

    console.log('Estructura de tabla:', sampleUser ? Object.keys(sampleUser[0]) : 'No data');

    // 2. Eliminar cualquier usuario admin existente
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com']);

    if (deleteError) {
      console.log('Error eliminando usuarios:', deleteError.message);
    }

    // 3. Crear usuarios con la estructura exacta de la tabla
    const superAdminPassword = await hashPassword('admin123');
    const basicAdminPassword = await hashPassword('admin123');

    // Insertar Super Admin con todos los campos requeridos
    const { data: superAdmin, error: superAdminError } = await supabaseAdmin
      .from('users')
      .insert({
        email: 'facudev4@gmail.com',
        password_hash: superAdminPassword,
        full_name: 'Super Admin',
        role: 'super_admin',
        is_active: true,
        role_id: null, // Campo que existe en la tabla
        last_login: null // Campo que existe en la tabla
      })
      .select()
      .single();

    if (superAdminError) {
      console.error('Error creando super admin:', superAdminError);
      
      // Intentar sin campos opcionales
      const { data: superAdmin2, error: superAdminError2 } = await supabaseAdmin
        .from('users')
        .insert({
          email: 'facudev4@gmail.com',
          password_hash: superAdminPassword,
          full_name: 'Super Admin',
          role: 'super_admin',
          is_active: true
        })
        .select()
        .single();
      
      if (superAdminError2) {
        console.error('Error segundo intento super admin:', superAdminError2);
      } else {
        console.log('Super admin creado (segundo intento):', superAdmin2);
      }
    } else {
      console.log('Super admin creado:', superAdmin);
    }

    // Insertar Admin Básico
    const { data: basicAdmin, error: basicAdminError } = await supabaseAdmin
      .from('users')
      .insert({
        email: 'facucercuetti420@gmail.com',
        password_hash: basicAdminPassword,
        full_name: 'Admin Básico',
        role: 'admin_basico',
        is_active: true,
        role_id: null,
        last_login: null
      })
      .select()
      .single();

    if (basicAdminError) {
      console.error('Error creando basic admin:', basicAdminError);
      
      // Intentar sin campos opcionales
      const { data: basicAdmin2, error: basicAdminError2 } = await supabaseAdmin
        .from('users')
        .insert({
          email: 'facucercuetti420@gmail.com',
          password_hash: basicAdminPassword,
          full_name: 'Admin Básico',
          role: 'admin_basico',
          is_active: true
        })
        .select()
        .single();
      
      if (basicAdminError2) {
        console.error('Error segundo intento basic admin:', basicAdminError2);
      } else {
        console.log('Basic admin creado (segundo intento):', basicAdmin2);
      }
    } else {
      console.log('Basic admin creado:', basicAdmin);
    }

    // 4. Verificar usuarios creados
    const { data: finalUsers, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('email, role, full_name, is_active')
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com']);

    console.log('Usuarios finales:', finalUsers);

    // 5. Probar login con cada usuario
    const loginTests = [];
    
    for (const user of ['facudev4@gmail.com', 'facucercuetti420@gmail.com']) {
      try {
        const loginResponse = await fetch('http://localhost:9000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user,
            password: 'admin123'
          })
        });

        const loginResult = await loginResponse.json();
        loginTests.push({
          email: user,
          status: loginResponse.status,
          result: loginResult,
          success: loginResponse.status === 200
        });
      } catch (e) {
        loginTests.push({
          email: user,
          status: 'error',
          result: e instanceof Error ? e.message : 'Unknown error',
          success: false
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Solución final de autenticación aplicada',
      users: finalUsers || [],
      loginTests: loginTests,
      tableStructure: sampleUser ? Object.keys(sampleUser[0]) : [],
      credentials: [
        'Super Admin: facudev4@gmail.com / admin123',
        'Admin Básico: facucercuetti420@gmail.com / admin123'
      ],
      loginUrl: 'http://localhost:9000/admin/login',
      status: loginTests.some(test => test.success) ? 'LOGIN FUNCIONAL' : 'LOGIN FALLANDO',
      recommendations: loginTests.some(test => test.success) ? [
        'El login está funcionando correctamente',
        'Prueba acceder al panel de administración',
        'Verifica la funcionalidad completa'
      ] : [
        'Revisa los logs del servidor para más detalles',
        'Verifica la configuración de la base de datos',
        'Contacta al administrador del sistema'
      ]
    });

  } catch (error) {
    console.error('Error final:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
