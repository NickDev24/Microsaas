import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('=== CORRECCIÓN FINAL DE ROLES ===');

    // 1. Verificar estado actual de usuarios
    const { data: currentUsers, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, is_active')
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com']);

    if (checkError) {
      console.error('Error verificando usuarios:', checkError);
      return NextResponse.json({ error: 'Error verificando usuarios' }, { status: 500 });
    }

    console.log('Usuarios actuales:', currentUsers);

    // 2. Actualizar facudev4@gmail.com a super_admin
    let superAdminResult = null;
    try {
      const { data: superAdmin, error: superAdminError } = await supabaseAdmin
        .from('users')
        .update({ 
          role: 'super_admin',
          updated_at: new Date().toISOString()
        })
        .eq('email', 'facudev4@gmail.com')
        .select()
        .single();

      if (superAdminError) {
        console.error('Error actualizando super_admin:', superAdminError);
        
        // Si hay error de constraint, intentar eliminar y recrear
        if (superAdminError.message?.includes('constraint')) {
          console.log('Intentando eliminar y recrear usuario super_admin...');
          
          // Eliminar usuario
          await supabaseAdmin
            .from('users')
            .delete()
            .eq('email', 'facudev4@gmail.com');
          
          // Recrear usuario con rol correcto
          const { data: newSuperAdmin, error: recreateError } = await supabaseAdmin
            .from('users')
            .insert({
              email: 'facudev4@gmail.com',
              full_name: 'Super Admin',
              role: 'super_admin',
              password_hash: '$2b$12$dJeH2UZnKMjJU7DVmsCXCO5IC8/goFpT3CdcNhJVkjnRvL23EOdKu',
              is_active: true
            })
            .select()
            .single();

          if (recreateError) {
            console.error('Error recreando super_admin:', recreateError);
            return NextResponse.json({ error: 'Error recreando super_admin', details: recreateError.message }, { status: 500 });
          }
          
          superAdminResult = newSuperAdmin;
        } else {
          return NextResponse.json({ error: 'Error actualizando super_admin', details: superAdminError.message }, { status: 500 });
        }
      } else {
        superAdminResult = superAdmin;
      }
    } catch (error) {
      console.error('Error en actualización de super_admin:', error);
      return NextResponse.json({ error: 'Error crítico actualizando super_admin' }, { status: 500 });
    }

    // 3. Actualizar facucercuetti420@gmail.com a admin_basico
    let adminBasicoResult = null;
    try {
      const { data: adminBasico, error: adminBasicoError } = await supabaseAdmin
        .from('users')
        .update({ 
          role: 'admin_basico',
          updated_at: new Date().toISOString()
        })
        .eq('email', 'facucercuetti420@gmail.com')
        .select()
        .single();

      if (adminBasicoError) {
        console.error('Error actualizando admin_basico:', adminBasicoError);
        
        // Si hay error de constraint, intentar eliminar y recrear
        if (adminBasicoError.message?.includes('constraint')) {
          console.log('Intentando eliminar y recrear usuario admin_basico...');
          
          // Eliminar usuario
          await supabaseAdmin
            .from('users')
            .delete()
            .eq('email', 'facucercuetti420@gmail.com');
          
          // Recrear usuario con rol correcto
          const { data: newAdminBasico, error: recreateError } = await supabaseAdmin
            .from('users')
            .insert({
              email: 'facucercuetti420@gmail.com',
              full_name: 'Admin Básico',
              role: 'admin_basico',
              password_hash: '$2b$12$dJeH2UZnKMjJU7DVmsCXCO5IC8/goFpT3CdcNhJVkjnRvL23EOdKu',
              is_active: true
            })
            .select()
            .single();

          if (recreateError) {
            console.error('Error recreando admin_basico:', recreateError);
            return NextResponse.json({ error: 'Error recreando admin_basico', details: recreateError.message }, { status: 500 });
          }
          
          adminBasicoResult = newAdminBasico;
        } else {
          return NextResponse.json({ error: 'Error actualizando admin_basico', details: adminBasicoError.message }, { status: 500 });
        }
      } else {
        adminBasicoResult = adminBasico;
      }
    } catch (error) {
      console.error('Error en actualización de admin_basico:', error);
      return NextResponse.json({ error: 'Error crítico actualizando admin_basico' }, { status: 500 });
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
      message: 'Roles asignados correctamente',
      before: currentUsers,
      after: finalUsers,
      superAdmin: {
        email: 'facudev4@gmail.com',
        role: 'super_admin',
        user: superAdminResult
      },
      adminBasico: {
        email: 'facucercuetti420@gmail.com',
        role: 'admin_basico',
        user: adminBasicoResult
      },
      nextSteps: [
        '1. Actualizar middleware para usar roles específicos (super_admin, admin_basico)',
        '2. Actualizar APIs para usar roles específicos',
        '3. Probar acceso con nuevos roles específicos'
      ]
    });

  } catch (error) {
    console.error('Error en corrección final de roles:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
