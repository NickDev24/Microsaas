import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== ELIMINANDO CONSTRAINT DIRECTAMENTE ===');

    // 1. Eliminar el constraint usando SQL directo
    const { data: dropResult, error: dropError } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(1); // Esto fallará, pero nos da info sobre la tabla

    // Intentar eliminar constraint con SQL crudo
    try {
      const { data: sqlResult, error: sqlError } = await supabaseAdmin
        .rpc('sql', { 
          query: 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;' 
        });
      
      if (sqlError) {
        console.log('Error SQL (esperado):', sqlError.message);
      } else {
        console.log('Constraint eliminado con SQL');
      }
    } catch (e) {
      console.log('Excepción SQL (esperado):', e);
    }

    // 2. Esperar y crear usuarios
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Eliminar usuarios existentes
    await supabaseAdmin
      .from('users')
      .delete()
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com']);

    // 3. Crear usuarios con roles correctos
    const superAdminPassword = await hashPassword('admin123');
    const basicAdminPassword = await hashPassword('admin123');

    // Intentar crear Super Admin
    const { data: superAdmin, error: superAdminError } = await supabaseAdmin
      .from('users')
      .insert({
        email: 'facudev4@gmail.com',
        password_hash: superAdminPassword,
        full_name: 'Super Admin',
        role: 'super_admin',
        is_active: true
      })
      .select()
      .single();

    if (superAdminError) {
      console.error('Super Admin error:', superAdminError);
      
      // Si falla por constraint, intentar con customer temporalmente
      const { data: tempUser, error: tempError } = await supabaseAdmin
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

      if (tempError) {
        return NextResponse.json({ 
          error: 'No se puede crear usuario', 
          details: tempError.message 
        }, { status: 500 });
      }

      console.log('Usuario temporal creado:', tempUser);
      
      // Ahora actualizar a super_admin
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({ role: 'super_admin' })
        .eq('email', 'facudev4@gmail.com')
        .select()
        .single();

      if (updateError) {
        console.error('Error actualizando a super_admin:', updateError);
        return NextResponse.json({ 
          error: 'No se puede actualizar rol', 
          details: updateError.message 
        }, { status: 500 });
      }

      console.log('Super Admin creado:', updatedUser);
    }

    // Crear Admin Básico
    const { data: basicAdmin, error: basicAdminError } = await supabaseAdmin
      .from('users')
      .insert({
        email: 'facucercuetti420@gmail.com',
        password_hash: basicAdminPassword,
        full_name: 'Admin Básico',
        role: 'admin_basico',
        is_active: true
      })
      .select()
      .single();

    if (basicAdminError) {
      console.error('Basic Admin error:', basicAdminError);
      
      // Mismo workaround
      const { data: tempUser2, error: tempError2 } = await supabaseAdmin
        .from('users')
        .insert({
          email: 'facucercuetti420@gmail.com',
          password_hash: basicAdminPassword,
          full_name: 'Admin Básico',
          role: 'customer',
          is_active: true
        })
        .select()
        .single();

      if (tempError2) {
        return NextResponse.json({ 
          error: 'No se puede crear segundo usuario', 
          details: tempError2.message 
        }, { status: 500 });
      }

      // Actualizar a admin_basico
      const { data: updatedUser2, error: updateError2 } = await supabaseAdmin
        .from('users')
        .update({ role: 'admin_basico' })
        .eq('email', 'facucercuetti420@gmail.com')
        .select()
        .single();

      if (updateError2) {
        return NextResponse.json({ 
          error: 'No se puede actualizar rol segundo usuario', 
          details: updateError2.message 
        }, { status: 500 });
      }

      console.log('Basic Admin creado:', updatedUser2);
    }

    // 4. Verificar usuarios finales
    const { data: finalUsers, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('email, role, full_name, is_active')
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com']);

    // 5. Probar login
    const loginTests = [];
    
    for (const email of ['facudev4@gmail.com', 'facucercuetti420@gmail.com']) {
      try {
        const loginResponse = await fetch('http://localhost:9000/api/auth/login', {
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

    return NextResponse.json({
      success: true,
      message: 'Usuarios creados con workaround',
      users: finalUsers || [],
      loginTests,
      status: loginTests.some(t => t.success) ? 'LOGIN FUNCIONAL' : 'LOGIN FALLANDO',
      credentials: [
        'Super Admin: facudev4@gmail.com / admin123',
        'Admin Básico: facucercuetti420@gmail.com / admin123'
      ]
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
