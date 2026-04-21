import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIANDO CORRECCIÓN DE USUARIOS ===');

    // 1. Verificar usuarios existentes
    const { data: existingUsers, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com']);

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return NextResponse.json({ error: 'Error fetching users', details: fetchError.message }, { status: 500 });
    }

    console.log('Usuarios existentes:', existingUsers);

    // 2. Crear/actualizar Super Admin
    const superAdminPassword = await hashPassword('admin123');
    const { data: superAdmin, error: superAdminError } = await supabaseAdmin
      .from('users')
      .upsert({
        email: 'facudev4@gmail.com',
        password_hash: superAdminPassword,
        role: 'super_admin',
        full_name: 'Super Admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (superAdminError) {
      console.error('Error creating super admin:', superAdminError);
      return NextResponse.json({ error: 'Error creating super admin', details: superAdminError.message }, { status: 500 });
    }

    // 3. Crear/actualizar Admin Básico
    const basicAdminPassword = await hashPassword('admin123');
    const { data: basicAdmin, error: basicAdminError } = await supabaseAdmin
      .from('users')
      .upsert({
        email: 'facucercuetti420@gmail.com',
        password_hash: basicAdminPassword,
        role: 'admin_basico',
        full_name: 'Admin Básico',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (basicAdminError) {
      console.error('Error creating basic admin:', basicAdminError);
      return NextResponse.json({ error: 'Error creating basic admin', details: basicAdminError.message }, { status: 500 });
    }

    // 4. Verificar estado final
    const { data: finalUsers, error: finalError } = await supabaseAdmin
      .from('users')
      .select('email, role, full_name, is_active, created_at')
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com']);

    console.log('Estado final de usuarios:', finalUsers);

    return NextResponse.json({
      success: true,
      message: 'Usuarios admin corregidos exitosamente',
      users: {
        superAdmin: {
          email: superAdmin.email,
          role: superAdmin.role,
          full_name: superAdmin.full_name,
          is_active: superAdmin.is_active,
          password: 'admin123'
        },
        basicAdmin: {
          email: basicAdmin.email,
          role: basicAdmin.role,
          full_name: basicAdmin.full_name,
          is_active: basicAdmin.is_active,
          password: 'admin123'
        }
      },
      finalUsers: finalUsers,
      instructions: {
        loginUrl: 'http://localhost:9000/admin/login',
        credentials: [
          'Super Admin: facudev4@gmail.com / admin123 -> /admin/superadmin',
          'Admin Básico: facucercuetti420@gmail.com / admin123 -> /admin/dashboard'
        ],
        nextSteps: [
          '1. Ir al login',
          '2. Usar las credenciales anteriores',
          '3. Verificar redirección correcta',
          '4. Probar funcionalidad del panel'
        ]
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
