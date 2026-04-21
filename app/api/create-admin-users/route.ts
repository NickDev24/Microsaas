import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import { signToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Crear Super Admin
    const superAdminPassword = await hashPassword('admin123');
    const { data: superAdmin, error: superAdminError } = await supabaseAdmin
      .from('users')
      .upsert({
        email: 'facudev4@gmail.com',
        password_hash: superAdminPassword,
        role: 'super_admin',
        full_name: 'Super Admin',
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (superAdminError) {
      console.error('Error creating super admin:', superAdminError);
    }

    // Crear Admin Básico
    const basicAdminPassword = await hashPassword('admin123');
    const { data: basicAdmin, error: basicAdminError } = await supabaseAdmin
      .from('users')
      .upsert({
        email: 'facucercuetti420@gmail.com',
        password_hash: basicAdminPassword,
        role: 'admin_basico',
        full_name: 'Admin Básico',
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (basicAdminError) {
      console.error('Error creating basic admin:', basicAdminError);
    }

    return NextResponse.json({
      success: true,
      message: 'Usuarios admin creados exitosamente',
      users: {
        superAdmin: superAdmin ? {
          email: superAdmin.email,
          role: superAdmin.role,
          password: 'admin123'
        } : null,
        basicAdmin: basicAdmin ? {
          email: basicAdmin.email,
          role: basicAdmin.role,
          password: 'admin123'
        } : null
      },
      instructions: {
        loginUrl: 'http://localhost:3001/admin/login',
        credentials: [
          'Super Admin: facudev4@gmail.com / admin123',
          'Admin Básico: facucercuetti420@gmail.com / admin123'
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
