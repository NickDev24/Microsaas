import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREAR USUARIOS FINALES CON ROLES ESPECÍFICOS ===');

    // 1. Eliminar usuarios existentes con estos emails (si existen)
    console.log('Eliminando usuarios existentes...');
    
    await supabaseAdmin
      .from('users')
      .delete()
      .eq('email', 'facudev4@gmail.com');

    await supabaseAdmin
      .from('users')
      .delete()
      .eq('email', 'facucercuetti420@gmail.com');

    // 2. Crear usuario facudev4@gmail.com con rol 'super_admin'
    console.log('Creando usuario super_admin...');
    const { data: superAdmin, error: superAdminError } = await supabaseAdmin
      .from('users')
      .insert({
        email: 'facudev4@gmail.com',
        full_name: 'Super Admin',
        role: 'super_admin',
        password_hash: '$2b$12$dJeH2UZnKMjJU7DVmsCXCO5IC8/goFpT3CdcNhJVkjnRvL23EOdKu',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (superAdminError) {
      console.error('Error creando super_admin:', superAdminError);
      return NextResponse.json({ 
        error: 'Error creando super_admin', 
        details: superAdminError.message 
      }, { status: 500 });
    }

    // 3. Crear usuario facucercuetti420@gmail.com con rol 'admin_basico'
    console.log('Creando usuario admin_basico...');
    const { data: adminBasico, error: adminBasicoError } = await supabaseAdmin
      .from('users')
      .insert({
        email: 'facucercuetti420@gmail.com',
        full_name: 'Admin Básico',
        role: 'admin_basico',
        password_hash: '$2b$12$dJeH2UZnKMjJU7DVmsCXCO5IC8/goFpT3CdcNhJVkjnRvL23EOdKu',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (adminBasicoError) {
      console.error('Error creando admin_basico:', adminBasicoError);
      return NextResponse.json({ 
        error: 'Error creando admin_basico', 
        details: adminBasicoError.message 
      }, { status: 500 });
    }

    // 4. Verificar estado final
    const { data: finalUsers, error: finalError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, is_active')
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com']);

    if (finalError) {
      console.error('Error verificando estado final:', finalError);
      return NextResponse.json({ error: 'Error verificando estado final' }, { status: 500 });
    }

    console.log('USUARIOS CREADOS EXITOSAMENTE:');
    console.log('Super Admin:', superAdmin);
    console.log('Admin Básico:', adminBasico);

    return NextResponse.json({
      success: true,
      message: 'Usuarios creados correctamente con roles específicos',
      superAdmin: {
        email: 'facudev4@gmail.com',
        role: 'super_admin',
        fullName: 'Super Admin',
        user: superAdmin
      },
      adminBasico: {
        email: 'facucercuetti420@gmail.com',
        role: 'admin_basico',
        fullName: 'Admin Básico',
        user: adminBasico
      },
      finalUsers: finalUsers,
      credentials: {
        superAdmin: {
          email: 'facudev4@gmail.com',
          password: 'admin123'
        },
        adminBasico: {
          email: 'facucercuetti420@gmail.com',
          password: 'admin123'
        }
      },
      systemStatus: {
        middleware: 'Configurado para acceso basado en email',
        apis: 'Configuradas para aceptar múltiples roles',
        types: 'UserRole actualizado para incluir todos los roles'
      },
      nextSteps: [
        '1. Probar login con facudev4@gmail.com (super_admin)',
        '2. Probar login con facucercuetti420@gmail.com (admin_basico)',
        '3. Verificar acceso a dashboards específicos',
        '4. Verificar acceso a APIs con roles específicos'
      ]
    });

  } catch (error) {
    console.error('Error creando usuarios finales:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
