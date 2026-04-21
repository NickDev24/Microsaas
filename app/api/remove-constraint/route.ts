import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== ELIMINANDO CONSTRAINT Y CREANDO USUARIOS ===');

    // 1. Eliminar el constraint problemático usando SQL directo
    const { data: constraintResult, error: constraintError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;' 
      });
    
    if (constraintError) {
      console.log('Error eliminando constraint (puede ser normal):', constraintError.message);
    } else {
      console.log('Constraint eliminado exitosamente');
    }

    // 2. Esperar un momento para que se aplique el cambio
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Eliminar usuarios existentes para recrearlos limpios
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com']);

    if (deleteError) {
      console.log('Error eliminando usuarios existentes:', deleteError.message);
    }

    // 4. Crear Super Admin
    const superAdminPassword = await hashPassword('admin123');
    const { data: superAdmin, error: superAdminError } = await supabaseAdmin
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

    if (superAdminError) {
      console.error('Error creando super admin:', superAdminError);
      return NextResponse.json({ 
        error: 'Error creando super admin', 
        details: superAdminError.message 
      }, { status: 500 });
    }

    console.log('Super admin creado:', superAdmin);

    // 5. Crear Admin Básico
    const basicAdminPassword = await hashPassword('admin123');
    const { data: basicAdmin, error: basicAdminError } = await supabaseAdmin
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

    if (basicAdminError) {
      console.error('Error creando basic admin:', basicAdminError);
      return NextResponse.json({ 
        error: 'Error creando basic admin', 
        details: basicAdminError.message 
      }, { status: 500 });
    }

    console.log('Basic admin creado:', basicAdmin);

    // 6. Probar login con ambos usuarios
    const loginTests = [];
    
    for (const [email, description] of [
      ['facudev4@gmail.com', 'Super Admin'],
      ['facucercuetti420@gmail.com', 'Admin Básico']
    ]) {
      try {
        const loginResponse = await fetch('http://localhost:9000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: 'admin123'
          })
        });

        const loginResult = await loginResponse.json();
        loginTests.push({
          email: email,
          description: description,
          status: loginResponse.status,
          result: loginResult,
          success: loginResponse.status === 200
        });
      } catch (e) {
        loginTests.push({
          email: email,
          description: description,
          status: 'error',
          result: e instanceof Error ? e.message : 'Unknown error',
          success: false
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Constraint eliminado y usuarios creados exitosamente',
      constraintRemoved: !constraintError,
      users: {
        superAdmin: {
          email: superAdmin.email,
          role: superAdmin.role,
          full_name: superAdmin.full_name
        },
        basicAdmin: {
          email: basicAdmin.email,
          role: basicAdmin.role,
          full_name: basicAdmin.full_name
        }
      },
      loginTests: loginTests,
      status: loginTests.every(test => test.success) ? 'LOGIN COMPLETAMENTE FUNCIONAL' : 'LOGIN PARCIALMENTE FUNCIONAL',
      credentials: [
        'Super Admin: facudev4@gmail.com / admin123',
        'Admin Básico: facucercuetti420@gmail.com / admin123'
      ],
      loginUrl: 'http://localhost:9000/admin/login',
      nextSteps: [
        '1. Ir al login',
        '2. Probar ambas credenciales',
        '3. Verificar redirección correcta',
        '4. Probar funcionalidad del panel'
      ]
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
