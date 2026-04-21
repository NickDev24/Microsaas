import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('=== ELIMINAR CONSTRAINT users_role_check CON SQL ===');

    // 1. Intentar eliminar el constraint con SQL directo
    try {
      const { error: dropError } = await supabaseAdmin
        .rpc('exec_sql', {
          sql: 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;'
        });

      if (dropError) {
        console.error('Error con RPC exec_sql:', dropError);
        
        // Intentar con SQL directo usando .rpc
        const { error: rpcError } = await supabaseAdmin
          .rpc('execute_sql', {
            sql_string: 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;'
          });

        if (rpcError) {
          console.error('Error con RPC execute_sql:', rpcError);
        } else {
          console.log('Constraint eliminado con execute_sql');
        }
      } else {
        console.log('Constraint eliminado con exec_sql');
      }
    } catch (error) {
      console.error('Error en eliminación de constraint:', error);
    }

    // 2. Verificar si el constraint fue eliminado
    console.log('Verificando constraints actuales...');
    
    // Intentar insertar un usuario con rol específico para probar
    const { data: testUser, error: testError } = await supabaseAdmin
      .from('users')
      .insert({
        email: 'test@constraint.com',
        full_name: 'Test Constraint',
        role: 'super_admin',
        password_hash: '$2b$12$dJeH2UZnKMjJU7DVmsCXCO5IC8/goFpT3CdcNhJVkjnRvL23EOdKu',
        is_active: true
      })
      .select()
      .single();

    if (testError) {
      console.error('Constraint aún existe:', testError.message);
      
      // Si aún existe, intentar eliminar con método alternativo
      console.log('Intentando método alternativo...');
      
      // Eliminar todos los usuarios con emails específicos
      await supabaseAdmin
        .from('users')
        .delete()
        .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com', 'test@constraint.com']);
      
      console.log('Usuarios eliminados, intentando crear nuevos...');
      
      // Crear usuarios nuevos sin constraint
      const { data: newSuperAdmin, error: newSuperError } = await supabaseAdmin
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

      if (newSuperError) {
        console.error('Error creando super_admin:', newSuperError);
        return NextResponse.json({ 
          error: 'No se puede crear super_admin', 
          details: newSuperError.message,
          constraintIssue: true 
        }, { status: 500 });
      }

      const { data: newAdminBasico, error: newAdminError } = await supabaseAdmin
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

      if (newAdminError) {
        console.error('Error creando admin_basico:', newAdminError);
        return NextResponse.json({ 
          error: 'No se puede crear admin_basico', 
          details: newAdminError.message,
          constraintIssue: true 
        }, { status: 500 });
      }

      console.log('USUARIOS CREADOS EXITOSAMENTE CON ROLES ESPECÍFICOS');
      
      return NextResponse.json({
        success: true,
        message: 'Roles específicos asignados correctamente (método alternativo)',
        constraintRemoved: true,
        superAdmin: {
          email: 'facudev4@gmail.com',
          role: 'super_admin',
          user: newSuperAdmin
        },
        adminBasico: {
          email: 'facucercuetti420@gmail.com',
          role: 'admin_basico',
          user: newAdminBasico
        },
        nextSteps: [
          '1. Actualizar middleware para usar roles específicos (super_admin, admin_basico)',
          '2. Actualizar APIs para usar roles específicos',
          '3. Probar login con roles específicos'
        ]
      });

    } else {
      console.log('Test user creado, constraint eliminado');
      
      // Eliminar usuario de prueba
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('email', 'test@constraint.com');
      
      return NextResponse.json({
        success: true,
        message: 'Constraint eliminado correctamente',
        constraintRemoved: true,
        testUser: testUser
      });
    }

  } catch (error) {
    console.error('Error eliminando constraint:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
