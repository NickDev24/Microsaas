import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== EMERGENCY FIX - AUTENTICACIÓN ===');

    // 1. Verificar conexión a la base de datos
    const { data: testData, error: testError } = await supabaseAdmin
      .from('users')
      .select('count')
      .single();

    if (testError) {
      console.error('Error de conexión a BD:', testError);
      return NextResponse.json({ 
        error: 'Error de conexión a la base de datos', 
        details: testError.message 
      }, { status: 500 });
    }

    // 2. Crear usuarios con método alternativo
    const usersToCreate = [
      {
        email: 'facudev4@gmail.com',
        password: 'admin123',
        role: 'super_admin',
        full_name: 'Super Admin'
      },
      {
        email: 'facucercuetti420@gmail.com',
        password: 'admin123',
        role: 'admin_basico',
        full_name: 'Admin Básico'
      }
    ];

    const results = [];

    for (const userToCreate of usersToCreate) {
      try {
        // Hash password
        const hashedPassword = await hashPassword(userToCreate.password);
        
        // Intentar inserción directa
        const { data: userData, error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            email: userToCreate.email,
            password_hash: hashedPassword,
            full_name: userToCreate.full_name,
            role: userToCreate.role,
            is_active: true
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Error creando ${userToCreate.email}:`, insertError);
          results.push({
            email: userToCreate.email,
            success: false,
            error: insertError.message
          });
        } else {
          console.log(`Usuario creado: ${userToCreate.email}`, userData);
          results.push({
            email: userToCreate.email,
            success: true,
            data: userData
          });
        }
      } catch (e) {
        console.error(`Excepción creando ${userToCreate.email}:`, e);
        results.push({
          email: userToCreate.email,
          success: false,
          error: e instanceof Error ? e.message : 'Unknown error'
        });
      }
    }

    // 3. Verificar usuarios creados
    const { data: finalUsers, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('email, role, full_name, is_active')
      .in('email', usersToCreate.map(u => u.email));

    // 4. Probar login si los usuarios fueron creados
    const loginResults = [];
    
    if (finalUsers && finalUsers.length > 0) {
      for (const user of finalUsers) {
        try {
          const loginResponse = await fetch('http://localhost:9000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              password: 'admin123'
            })
          });

          const loginResult = await loginResponse.json();
          loginResults.push({
            email: user.email,
            status: loginResponse.status,
            result: loginResult,
            success: loginResponse.status === 200
          });
        } catch (e) {
          loginResults.push({
            email: user.email,
            status: 'error',
            result: e instanceof Error ? e.message : 'Unknown error',
            success: false
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Emergency fix aplicado',
      creationResults: results,
      finalUsers: finalUsers || [],
      loginResults: loginResults,
      status: loginResults.some(r => r.success) ? 'LOGIN FUNCIONAL' : 'LOGIN FALLANDO',
      instructions: {
        ifLoginWorks: [
          '1. Ir a http://localhost:9000/admin/login',
          '2. Usar credenciales: facudev4@gmail.com / admin123',
          '3. Verificar acceso al panel',
          '4. Probar funcionalidad completa'
        ],
        ifLoginFails: [
          '1. Revisar logs del servidor',
          '2. Verificar configuración de Supabase',
          '3. Revisar variables de entorno',
          '4. Contactar soporte técnico'
        ]
      }
    });

  } catch (error) {
    console.error('Error en emergency fix:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
