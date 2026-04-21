import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== EMERGENCY LOGIN FIX ===');

    // 1. Verificar usuarios existentes
    const { data: existingUsers, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com']);

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return NextResponse.json({ 
        error: 'Error verificando usuarios', 
        details: fetchError.message 
      }, { status: 500 });
    }

    console.log('Usuarios existentes:', existingUsers);

    // 2. Si no hay usuarios, crearlos con rol customer primero
    if (!existingUsers || existingUsers.length === 0) {
      console.log('Creando usuarios administradores...');
      
      const superAdminPassword = await hashPassword('admin123');
      const basicAdminPassword = await hashPassword('admin123');

      // Crear Super Admin con rol customer (luego actualizamos)
      const { data: superAdmin, error: superAdminError } = await supabaseAdmin
        .from('users')
        .insert({
          email: 'facudev4@gmail.com',
          password_hash: superAdminPassword,
          full_name: 'Super Admin',
          role: 'customer', // Temporal
          is_active: true
        })
        .select()
        .single();

      if (superAdminError) {
        console.error('Error creando super admin:', superAdminError);
        return NextResponse.json({ 
          error: 'Error creando super admin', 
          details: superAdminError.message 
        }, { status: 500 });
      }

      // Crear Admin Básico
      const { data: basicAdmin, error: basicAdminError } = await supabaseAdmin
        .from('users')
        .insert({
          email: 'facucercuetti420@gmail.com',
          password_hash: basicAdminPassword,
          full_name: 'Admin Básico',
          role: 'customer', // Temporal
          is_active: true
        })
        .select()
        .single();

      if (basicAdminError) {
        console.error('Error creando basic admin:', basicAdminError);
        return NextResponse.json({ 
          error: 'Error creando basic admin', 
          details: basicAdminError.message 
        }, { status: 500 });
      }

      console.log('Usuarios creados temporalmente:', { superAdmin, basicAdmin });
    }

    // 3. Probar login con cada usuario
    const loginTests = [];
    
    for (const email of ['facudev4@gmail.com', 'facucercuetti420@gmail.com']) {
      try {
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: 'admin123' })
        });

        const loginResult = await loginResponse.json();
        loginTests.push({
          email,
          status: loginResponse.status,
          result: loginResult,
          success: loginResponse.status === 200
        });
      } catch (e) {
        loginTests.push({
          email,
          status: 'error',
          result: e instanceof Error ? e.message : 'Unknown error',
          success: false
        });
      }
    }

    // 4. Si el login funciona, intentar actualizar roles
    if (loginTests.some(test => test.success)) {
      console.log('Login funciona, actualizando roles...');
      
      for (const email of ['facudev4@gmail.com', 'facucercuetti420@gmail.com']) {
        const newRole = email === 'facudev4@gmail.com' ? 'super_admin' : 'admin_basico';
        
        const { data: updatedUser, error: updateError } = await supabaseAdmin
          .from('users')
          .update({ role: newRole })
          .eq('email', email)
          .select()
          .single();

        if (updateError) {
          console.error(`Error actualizando rol de ${email}:`, updateError);
        } else {
          console.log(`Rol actualizado para ${email}:`, updatedUser);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Emergency login fix aplicado',
      existingUsers: existingUsers || [],
      loginTests: loginTests,
      credentials: [
        'Super Admin: facudev4@gmail.com / admin123',
        'Admin Básico: facucercuetti420@gmail.com / admin123'
      ],
      loginUrl: 'http://localhost:3000/admin/login',
      status: loginTests.some(test => test.success) ? 'LOGIN FUNCIONAL' : 'LOGIN FALLANDO',
      instructions: loginTests.some(test => test.success) ? [
        'El login está funcionando',
        'Prueba acceder con las credenciales',
        'Verifica redirección al dashboard'
      ] : [
        'El login está fallando',
        'Revisa la conexión a la base de datos',
        'Verifica las variables de entorno',
        'Reinicia el servidor'
      ]
    });

  } catch (error) {
    console.error('Error en emergency login fix:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
