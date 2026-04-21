import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('=== ASIGNAR ROLES ESPECÍFICOS ===');

    // 1. Asignar rol 'super_admin' a facudev4@gmail.com
    const { data: superAdminUser, error: superAdminError } = await supabaseAdmin
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
      return NextResponse.json({ error: 'Error actualizando super_admin' }, { status: 500 });
    }

    // 2. Asignar rol 'admin_basico' a facucercuetti420@gmail.com
    const { data: adminBasicoUser, error: adminBasicoError } = await supabaseAdmin
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
      return NextResponse.json({ error: 'Error actualizando admin_basico' }, { status: 500 });
    }

    // 3. Verificar usuarios actualizados
    const { data: users, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, is_active')
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com']);

    if (verifyError) {
      console.error('Error verificando usuarios:', verifyError);
      return NextResponse.json({ error: 'Error verificando usuarios' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Roles asignados correctamente',
      superAdmin: {
        email: 'facudev4@gmail.com',
        role: 'super_admin',
        user: superAdminUser
      },
      adminBasico: {
        email: 'facucercuetti420@gmail.com',
        role: 'admin_basico',
        user: adminBasicoUser
      },
      allUsers: users,
      nextSteps: [
        '1. Actualizar middleware para usar roles específicos',
        '2. Actualizar APIs para usar roles específicos',
        '3. Probar acceso con nuevos roles'
      ]
    });

  } catch (error) {
    console.error('Error en asignación de roles:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
