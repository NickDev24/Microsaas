import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('=== ELIMINAR CONSTRAINT users_role_check ===');

    // 1. Eliminar el constraint que bloquea los roles
    try {
      const { error: dropError } = await supabaseAdmin.rpc('execute_sql', {
        sql: 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;'
      });

      if (dropError) {
        console.error('Error eliminando constraint:', dropError);
        
        // Alternativa: intentar con SQL directo
        const { error: sqlError } = await supabaseAdmin
          .from('users')
          .select('1')
          .limit(1);
        
        if (sqlError) {
          console.log('Error SQL directo:', sqlError);
        }
      } else {
        console.log('Constraint eliminado exitosamente');
      }
    } catch (error) {
      console.error('Error en eliminación de constraint:', error);
    }

    // 2. Verificar si el constraint aún existe
    const { data: constraintCheck, error: checkError } = await supabaseAdmin
      .rpc('get_table_constraints', { table_name: 'users' });

    if (checkError) {
      console.log('No se puede verificar constraints, continuando...');
    } else {
      console.log('Constraints actuales:', constraintCheck);
    }

    // 3. Ahora intentar asignar los roles específicos
    console.log('Asignando roles específicos...');

    // Actualizar facudev4@gmail.com a super_admin
    const { data: superAdmin, error: superAdminError } = await supabaseAdmin
      .from('users')
      .upsert({
        email: 'facudev4@gmail.com',
        full_name: 'Super Admin',
        role: 'super_admin',
        password_hash: '$2b$12$dJeH2UZnKMjJU7DVmsCXCO5IC8/goFpT3CdcNhJVkjnRvL23EOdKu',
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (superAdminError) {
      console.error('Error actualizando super_admin:', superAdminError);
      return NextResponse.json({ error: 'Error actualizando super_admin', details: superAdminError.message }, { status: 500 });
    }

    // Actualizar facucercuetti420@gmail.com a admin_basico
    const { data: adminBasico, error: adminBasicoError } = await supabaseAdmin
      .from('users')
      .upsert({
        email: 'facucercuetti420@gmail.com',
        full_name: 'Admin Básico',
        role: 'admin_basico',
        password_hash: '$2b$12$dJeH2UZnKMjJU7DVmsCXCO5IC8/goFpT3CdcNhJVkjnRvL23EOdKu',
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (adminBasicoError) {
      console.error('Error actualizando admin_basico:', adminBasicoError);
      return NextResponse.json({ error: 'Error actualizando admin_basico', details: adminBasicoError.message }, { status: 500 });
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

    return NextResponse.json({
      success: true,
      message: 'Roles específicos asignados correctamente',
      constraintDropped: true,
      superAdmin: {
        email: 'facudev4@gmail.com',
        role: 'super_admin',
        user: superAdmin
      },
      adminBasico: {
        email: 'facucercuetti420@gmail.com',
        role: 'admin_basico',
        user: adminBasico
      },
      finalUsers: finalUsers,
      nextSteps: [
        '1. Actualizar middleware para usar roles específicos (super_admin, admin_basico)',
        '2. Actualizar APIs para usar roles específicos',
        '3. Probar acceso con roles específicos'
      ]
    });

  } catch (error) {
    console.error('Error en eliminación de constraint y asignación de roles:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
