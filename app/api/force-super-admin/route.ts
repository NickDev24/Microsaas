import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('=== FORZANDO ACTUALIZACIÓN A SUPER ADMIN ===');

    // 1. Primero intentar actualizar directamente
    const { data: directUpdate, error: directError } = await supabaseAdmin
      .from('users')
      .update({ 
        role: 'super_admin',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'facudev4@gmail.com')
      .select()
      .single();

    if (directError) {
      console.error('Error actualización directa:', directError);
      
      // 2. Si falla por constraint, eliminar y recrear usuario
      console.log('Intentando eliminar y recrear usuario...');
      
      // Eliminar usuario existente
      const { error: deleteError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('email', 'facudev4@gmail.com');

      if (deleteError) {
        console.error('Error eliminando usuario:', deleteError);
      } else {
        console.log('Usuario eliminado, recreando...');
      }

      // Recrear usuario con rol super_admin
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          email: 'facudev4@gmail.com',
          password_hash: '$2b$12$dJeH2UZnKMjJU7DVmsCXCO5IC8/goFpT3CdcNhJVkjnRvL23EOdKu', // admin123
          full_name: 'Super Admin',
          role: 'super_admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error recreando usuario:', insertError);
        
        // 3. Último recurso: crear como customer y actualizar con SQL
        const { data: tempUser, error: tempError } = await supabaseAdmin
          .from('users')
          .insert({
            email: 'facudev4@gmail.com',
            password_hash: '$2b$12$dJeH2UZnKMjJU7DVmsCXCO5IC8/goFpT3CdcNhJVkjnRvL23EOdKu',
            full_name: 'Super Admin',
            role: 'customer',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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
        return NextResponse.json({
          success: true,
          message: 'Usuario creado como customer, necesita actualización manual',
          user: tempUser,
          instructions: [
            'Ejecuta SQL manual para actualizar rol:',
            'UPDATE users SET role = \'super_admin\' WHERE email = \'facudev4@gmail.com\';'
          ]
        });
      }

      console.log('Usuario recreado con super_admin:', newUser);
      
      // 4. Probar login con nuevo usuario
      const loginResponse = await fetch('http://localhost:9000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'facudev4@gmail.com', 
          password: 'admin123' 
        })
      });

      const loginResult = await loginResponse.json();
      
      return NextResponse.json({
        success: true,
        message: 'Super Admin creado y login probado',
        user: newUser,
        loginTest: {
          status: loginResponse.status,
          result: loginResult,
          success: loginResponse.status === 200
        },
        credentials: 'facudev4@gmail.com / admin123',
        loginUrl: 'http://localhost:9000/admin/login',
        destination: '/admin/superadmin'
      });
    }

    // Si la actualización directa funcionó
    console.log('Usuario actualizado directamente:', directUpdate);
    
    // Probar login
    const loginResponse = await fetch('http://localhost:9000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'facudev4@gmail.com', 
        password: 'admin123' 
      })
    });

    const loginResult = await loginResponse.json();
    
    return NextResponse.json({
      success: true,
      message: 'Super Admin actualizado y login probado',
      user: directUpdate,
      loginTest: {
        status: loginResponse.status,
        result: loginResult,
        success: loginResponse.status === 200
      },
      credentials: 'facudev4@gmail.com / admin123',
      loginUrl: 'http://localhost:9000/admin/login',
      destination: '/admin/superadmin'
    });

  } catch (error) {
    console.error('Error forzando super admin:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
