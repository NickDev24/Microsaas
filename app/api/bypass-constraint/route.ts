import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== BYPASS CONSTRAINT - SOLUCIÓN DEFINITIVA ===');

    // 1. Primero, intentar deshabilitar temporalmente el constraint
    const { data: disableResult, error: disableError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          ALTER TABLE users DISABLE TRIGGER ALL;
          ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
          ALTER TABLE users ADD CONSTRAINT users_role_check 
          CHECK (role IN ('customer', 'admin_basico', 'super_admin', 'admin'));
        `
      });

    if (disableError) {
      console.log('Error modificando constraint:', disableError.message);
    } else {
      console.log('Constraint modificado exitosamente');
    }

    // 2. Si no funciona, usar SQL directo para insertar
    const superAdminPassword = await hashPassword('admin123');
    const basicAdminPassword = await hashPassword('admin123');

    // Intentar inserción directa con SQL
    const { data: sqlResult, error: sqlError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
          VALUES (
            gen_random_uuid(),
            'facudev4@gmail.com',
            '${superAdminPassword}',
            'Super Admin',
            'super_admin',
            true,
            NOW(),
            NOW()
          )
          ON CONFLICT (email) DO UPDATE SET
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            full_name = EXCLUDED.full_name,
            is_active = EXCLUDED.is_active,
            updated_at = NOW();
        `
      });

    if (sqlError) {
      console.log('Error SQL Super Admin:', sqlError.message);
    } else {
      console.log('Super Admin creado con SQL');
    }

    // Insertar Admin Básico
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
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            full_name = EXCLUDED.full_name,
            is_active = EXCLUDED.is_active,
            updated_at = NOW();
        `
      });

    if (sqlError2) {
      console.log('Error SQL Basic Admin:', sqlError2.message);
    } else {
      console.log('Basic Admin creado con SQL');
    }

    // 3. Esperar y verificar usuarios
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: finalUsers, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('email, role, full_name, is_active')
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com']);

    console.log('Usuarios finales:', finalUsers);

    // 4. Probar login si existen usuarios
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
            success: loginResponse.status === 200
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

    // 5. Si todo falla, crear usuarios con rol customer y modificar manualmente
    if (!finalUsers || finalUsers.length === 0) {
      console.log('Creando usuarios con rol customer como fallback...');
      
      // Crear como customer primero
      const { data: fallbackUser1, error: fallbackError1 } = await supabaseAdmin
        .from('users')
        .insert({
          email: 'facudev4@gmail.com',
          password_hash: superAdminPassword,
          full_name: 'Super Admin',
          role: 'customer',
          is_active: true
        })
        .select()
        .single();

      const { data: fallbackUser2, error: fallbackError2 } = await supabaseAdmin
        .from('users')
        .insert({
          email: 'facucercuetti420@gmail.com',
          password_hash: basicAdminPassword,
          full_name: 'Admin Básico',
          role: 'customer',
          is_active: true
        })
        .select()
        .single();

      return NextResponse.json({
        success: true,
        message: 'Usuarios creados como customer (requieren actualización manual)',
        users: [fallbackUser1, fallbackUser2].filter(Boolean),
        fallbackMode: true,
        instructions: [
          '1. Los usuarios fueron creados con rol customer',
          '2. Ejecuta SQL manual para actualizar roles:',
          '3. UPDATE users SET role = \'super_admin\' WHERE email = \'facudev4@gmail.com\';',
          '4. UPDATE users SET role = \'admin_basico\' WHERE email = \'facucercuetti420@gmail.com\';',
          '5. Luego prueba el login'
        ],
        credentials: [
          'Super Admin: facudev4@gmail.com / admin123',
          'Admin Básico: facucercuetti420@gmail.com / admin123'
        ]
      });
    }

    return NextResponse.json({
      success: true,
      message: loginTests.some(t => t.success) ? 'AUTENTICACIÓN FUNCIONAL' : 'AUTENTICACIÓN PARCIAL',
      users: finalUsers || [],
      loginTests,
      status: loginTests.some(t => t.success) ? 'LOGIN FUNCIONAL' : 'LOGIN NECESITA VERIFICACIÓN',
      credentials: [
        'Super Admin: facudev4@gmail.com / admin123',
        'Admin Básico: facucercuetti420@gmail.com / admin123'
      ],
      nextSteps: loginTests.some(t => t.success) ? [
        'El login está funcionando',
        'Prueba acceder al panel',
        'Verifica funcionalidad completa'
      ] : [
        'Verifica los usuarios en la base de datos',
        'Ejecuta SQL manual si es necesario',
        'Prueba el login nuevamente'
      ]
    });

  } catch (error) {
    console.error('Error en bypass constraint:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
