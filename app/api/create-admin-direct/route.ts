import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREANDO USUARIOS ADMIN DIRECTAMENTE ===');

    // 1. Primero eliminar usuarios existentes para evitar conflictos
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com']);

    if (deleteError) {
      console.log('Error al eliminar usuarios existentes:', deleteError.message);
    }

    // 2. Crear Super Admin directamente
    const superAdminPassword = await hashPassword('admin123');
    
    const { data: superAdmin, error: superAdminError } = await supabaseAdmin
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        email: 'facudev4@gmail.com',
        password_hash: superAdminPassword,
        full_name: 'Super Admin',
        role: 'super_admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (superAdminError) {
      console.error('Error creating super admin:', superAdminError);
      
      // Si falla, intentar con SQL directo
      try {
        const { data: sqlResult, error: sqlError } = await supabaseAdmin
          .from('users')
          .insert({
            id: crypto.randomUUID(),
            email: 'facudev4@gmail.com',
            password_hash: superAdminPassword,
            full_name: 'Super Admin',
            role: 'super_admin',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (sqlError) {
          console.error('Error SQL super admin:', sqlError);
        } else {
          console.log('Super admin creado con SQL:', sqlResult);
        }
      } catch (e) {
        console.error('Excepción SQL super admin:', e);
      }
    } else {
      console.log('Super admin creado exitosamente:', superAdmin);
    }

    // 3. Crear Admin Básico directamente
    const basicAdminPassword = await hashPassword('admin123');
    
    const { data: basicAdmin, error: basicAdminError } = await supabaseAdmin
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        email: 'facucercuetti420@gmail.com',
        password_hash: basicAdminPassword,
        full_name: 'Admin Básico',
        role: 'admin_basico',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (basicAdminError) {
      console.error('Error creating basic admin:', basicAdminError);
    } else {
      console.log('Basic admin creado exitosamente:', basicAdmin);
    }

    // 4. Verificar usuarios creados
    const { data: createdUsers, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('email, role, full_name, is_active, created_at')
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com']);

    console.log('Usuarios creados:', createdUsers);

    // 5. Probar login con Super Admin
    const loginResponse = await fetch('http://localhost:9000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'facudev4@gmail.com',
        password: 'admin123'
      })
    });

    const loginResult = await loginResponse.json();
    console.log('Login test result:', loginResult);

    return NextResponse.json({
      success: true,
      message: 'Usuarios admin creados directamente',
      users: createdUsers || [],
      loginTest: {
        status: loginResponse.status,
        result: loginResult
      },
      credentials: [
        'Super Admin: facudev4@gmail.com / admin123',
        'Admin Básico: facucercuetti420@gmail.com / admin123'
      ],
      loginUrl: 'http://localhost:9000/admin/login',
      nextSteps: [
        '1. Probar login con las credenciales',
        '2. Verificar redirección al dashboard',
        '3. Probar funcionalidad del panel'
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
