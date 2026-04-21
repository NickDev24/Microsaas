import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('=== CORREGIR ROL DE SUPERADMIN ===');

    // 1. Actualizar rol de facudev4@gmail.com a 'admin'
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'facudev4@gmail.com')
      .select()
      .single();

    if (updateError) {
      console.error('Error actualizando rol de superadmin:', updateError);
      return NextResponse.json({ 
        error: 'Error actualizando rol', 
        details: updateError.message 
      }, { status: 500 });
    }

    console.log('Rol actualizado exitosamente:', updatedUser);

    // 2. Verificar usuarios actualizados
    const { data: allUsers, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('email, role, full_name, is_active, updated_at')
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com']);

    if (verifyError) {
      console.error('Error verificando usuarios:', verifyError);
    }

    // 3. Probar login con usuario actualizado
    let loginTest = null;
    try {
      const loginResponse = await fetch('http://localhost:9000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'facudev4@gmail.com', 
          password: 'admin123' 
        })
      });

      loginTest = {
        status: loginResponse.status,
        result: await loginResponse.json(),
        success: loginResponse.status === 200
      };
    } catch (e) {
      loginTest = {
        status: 'error',
        result: { error: e instanceof Error ? e.message : 'Unknown error' },
        success: false
      };
    }

    // 4. Probar acceso a APIs problemáticas
    const apiTests = [];
    
    if (loginTest.success && loginTest.result.token) {
      const problematicApis = [
        { name: 'Overview', path: '/api/overview' },
        { name: 'Sales', path: '/api/sales' },
        { name: 'Orders', path: '/api/orders' },
        { name: 'Auth Me', path: '/api/auth/me' }
      ];

      for (const api of problematicApis) {
        try {
          const apiResponse = await fetch(`http://localhost:9000${api.path}`, {
            headers: {
              'Cookie': `token=${loginTest.result.token}`
            }
          });

          const apiResult = await apiResponse.json().catch(() => ({}));
          apiTests.push({
            api: api.name,
            path: api.path,
            status: apiResponse.status,
            success: apiResponse.status === 200,
            error: apiResult.error || null
          });
        } catch (e) {
          apiTests.push({
            api: api.name,
            path: api.path,
            status: 'error',
            success: false,
            error: e instanceof Error ? e.message : 'Unknown error'
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Rol de superadmin corregido y APIs probadas',
      updatedUser: updatedUser,
      allUsers: allUsers || [],
      loginTest: loginTest,
      apiTests: apiTests,
      status: loginTest.success && apiTests.every(t => t.success) 
        ? 'SUPERADMIN COMPLETAMENTE FUNCIONAL' 
        : 'PROBLEMAS PERSISTENTES',
      summary: {
        roleChanged: updatedUser?.role === 'admin',
        loginWorking: loginTest.success,
        apisWorking: apiTests.every(t => t.success),
        beforeUpdate: {
          email: 'facudev4@gmail.com',
          oldRole: 'customer',
          problem: 'Sin acceso a APIs de admin'
        },
        afterUpdate: {
          email: 'facudev4@gmail.com',
          newRole: updatedUser?.role,
          result: apiTests.every(t => t.success) ? 'Acceso completo a APIs' : 'Problemas persisten'
        }
      },
      nextSteps: [
        '1. El superadmin ahora tiene rol admin y acceso a APIs',
        '2. Probar acceso a /admin/superadmin en navegador',
        '3. Verificar que todas las APIs funcionen correctamente',
        '4. Unificar diseño entre dashboard y overview'
      ],
      credentials: {
        superAdmin: 'facudev4@gmail.com / admin123',
        adminBasico: 'facucercuetti420@gmail.com / admin123'
      }
    });

  } catch (error) {
    console.error('Error corrigiendo rol de superadmin:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
