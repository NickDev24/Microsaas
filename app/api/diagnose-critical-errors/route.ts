import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('=== DIAGNÓSTICO DE ERRORES CRÍTICOS ===');

    // 1. Verificar estado actual de usuarios
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*')
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com']);

    if (usersError) {
      return NextResponse.json({ error: 'Error obteniendo usuarios', details: usersError.message }, { status: 500 });
    }

    console.log('Usuarios encontrados:', users);

    // 2. Probar login con ambos usuarios
    const loginTests = [];
    
    for (const user of users || []) {
      try {
        const loginResponse = await fetch('http://localhost:9000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: user.email, 
            password: 'admin123' 
          })
        });

        const loginResult = await loginResponse.json();
        loginTests.push({
          email: user.email,
          role: user.role,
          status: loginResponse.status,
          result: loginResult,
          success: loginResponse.status === 200,
          hasToken: !!loginResult.token,
          error: loginResult.error || null
        });
      } catch (e) {
        loginTests.push({
          email: user.email,
          role: user.role,
          status: 'error',
          result: e instanceof Error ? e.message : 'Unknown error',
          success: false
        });
      }
    }

    // 3. Probar acceso a APIs problemáticas
    const apiTests = [];
    const successfulLogin = loginTests.find(t => t.success && t.hasToken);
    
    if (successfulLogin) {
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
              'Cookie': `token=${successfulLogin.result.token}`
            }
          });

          const apiResult = await apiResponse.json().catch(() => ({}));
          apiTests.push({
            api: api.name,
            path: api.path,
            status: apiResponse.status,
            success: apiResponse.status === 200,
            result: apiResult,
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

    // 4. Verificar configuración del middleware
    const middlewareConfig = {
      adminEmails: ['facudev4@gmail.com', 'facucercuetti420@gmail.com'],
      roles: {
        facudev4: users?.find(u => u.email === 'facudev4@gmail.com')?.role,
        facucercuetti: users?.find(u => u.email === 'facucercuetti420@gmail.com')?.role
      },
      successfulLogins: loginTests.filter(t => t.success).map(t => t.email)
    };

    // 5. Analizar causas de errores
    const analysis = {
      login401Cause: loginTests.find(t => t.email === 'facudev4@gmail.com' && t.status === 401) ? 
        'Posibles causas: contraseña incorrecta, email no encontrado, middleware bloqueando' : null,
      api403Cause: apiTests.filter(t => t.status === 403).length > 0 ?
        'Posibles causas: rol insuficiente, middleware bloqueando API, token inválido' : null,
      authMeLoop: apiTests.filter(t => t.path === '/api/auth/me').length > 5 ?
        'Loop infinito detectado - posible problema en componente React' : null
    };

    // 6. Recomendaciones específicas
    const recommendations = [];
    
    if (analysis.login401Cause) {
      recommendations.push({
        issue: 'Error 401 en login facudev4@gmail.com',
        solution: 'Verificar contraseña en BD, revisar middleware de login, actualizar usuario'
      });
    }
    
    if (analysis.api403Cause) {
      recommendations.push({
        issue: 'Errores 403 en APIs',
        solution: 'Verificar permisos de rol en middleware, revisar protección de endpoints'
      });
    }
    
    if (analysis.authMeLoop) {
      recommendations.push({
        issue: 'Loop infinito en /api/auth/me',
        solution: 'Revisar useEffect en componentes, añadir dependencias correctas, evitar re-renders'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Diagnóstico completo de errores críticos',
      users: users || [],
      loginTests: loginTests,
      apiTests: apiTests,
      middlewareConfig: middlewareConfig,
      analysis: analysis,
      recommendations: recommendations,
      status: loginTests.some(t => !t.success) || apiTests.some(t => !t.success) 
        ? 'ERRORES CRÍTICOS DETECTADOS' 
        : 'SISTEMA FUNCIONAL',
      immediateActions: [
        '1. Corregir error 401 en login de facudev4@gmail.com',
        '2. Solucionar errores 403 en APIs',
        '3. Detener loop infinito de /api/auth/me',
        '4. Unificar diseño entre dashboard y overview'
      ]
    });

  } catch (error) {
    console.error('Error en diagnóstico crítico:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
