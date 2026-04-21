import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('=== VERIFICAR USUARIOS ACTUALES ===');

    // 1. Verificar todos los usuarios en la base de datos
    const { data: allUsers, error: allUsersError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, is_active, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (allUsersError) {
      console.error('Error obteniendo todos los usuarios:', allUsersError);
      return NextResponse.json({ error: 'Error obteniendo usuarios' }, { status: 500 });
    }

    // 2. Verificar usuarios específicos de admin
    const { data: adminUsers, error: adminUsersError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, is_active, created_at, updated_at')
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com'])
      .order('created_at', { ascending: false });

    if (adminUsersError) {
      console.error('Error obteniendo usuarios admin:', adminUsersError);
      return NextResponse.json({ error: 'Error obteniendo usuarios admin' }, { status: 500 });
    }

    // 3. Verificar si existen usuarios con rol 'admin'
    const { data: adminRoleUsers, error: adminRoleError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, is_active')
      .eq('role', 'admin');

    if (adminRoleError) {
      console.error('Error obteniendo usuarios con rol admin:', adminRoleError);
    }

    // 4. Verificar si existen usuarios con rol 'super_admin'
    const { data: superAdminRoleUsers, error: superAdminRoleError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, is_active')
      .eq('role', 'super_admin');

    if (superAdminRoleError) {
      console.error('Error obteniendo usuarios con rol super_admin:', superAdminRoleError);
    }

    // 5. Verificar si existen usuarios con rol 'admin_basico'
    const { data: adminBasicoRoleUsers, error: adminBasicoRoleError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, is_active')
      .eq('role', 'admin_basico');

    if (adminBasicoRoleError) {
      console.error('Error obteniendo usuarios con rol admin_basico:', adminBasicoRoleError);
    }

    console.log('TODOS LOS USUARIOS:', allUsers);
    console.log('USUARIOS ADMIN ESPECÍFICOS:', adminUsers);
    console.log('USUARIOS CON ROL ADMIN:', adminRoleUsers);
    console.log('USUARIOS CON ROL SUPER_ADMIN:', superAdminRoleUsers);
    console.log('USUARIOS CON ROL ADMIN_BASICO:', adminBasicoRoleUsers);

    return NextResponse.json({
      success: true,
      message: 'Usuarios verificados correctamente',
      allUsers: allUsers || [],
      adminUsers: adminUsers || [],
      roleDistribution: {
        admin: adminRoleUsers || [],
        super_admin: superAdminRoleUsers || [],
        admin_basico: adminBasicoRoleUsers || []
      },
      summary: {
        totalUsers: allUsers?.length || 0,
        adminUsersCount: adminUsers?.length || 0,
        usersWithRoleAdmin: adminRoleUsers?.length || 0,
        usersWithRoleSuperAdmin: superAdminRoleUsers?.length || 0,
        usersWithRoleAdminBasico: adminBasicoRoleUsers?.length || 0
      },
      recommendations: {
        facudev4: adminUsers?.find(u => u.email === 'facudev4@gmail.com')?.role || 'NO_EXISTE',
        facucercuetti420: adminUsers?.find(u => u.email === 'facucercuetti420@gmail.com')?.role || 'NO_EXISTE'
      }
    });

  } catch (error) {
    console.error('Error verificando usuarios:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
