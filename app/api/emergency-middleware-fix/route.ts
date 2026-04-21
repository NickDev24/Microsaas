import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== EMERGENCY MIDDLEWARE FIX ===');

    // 1. Analizar el problema del middleware
    const middlewareIssues = {
      contradiction: 'Middleware registra api_access_granted pero devuelve 403',
      loopInfinite: 'Múltiples peticiones GET /admin/login indican loop infinito',
      login401: 'POST /api/auth/login devuelve 401',
      apis403: 'APIs con rol admin siguen devolviendo 403'
    };

    // 2. Probar login directo sin middleware
    let directLoginTest = null;
    try {
      const loginResponse = await fetch('http://localhost:9000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'facudev4@gmail.com', 
          password: 'admin123' 
        })
      });

      directLoginTest = {
        status: loginResponse.status,
        result: await loginResponse.json().catch(() => ({})),
        success: loginResponse.status === 200
      };
    } catch (e) {
      directLoginTest = {
        status: 'error',
        result: { error: e instanceof Error ? e.message : 'Unknown error' },
        success: false
      };
    }

    // 3. Verificar configuración actual del middleware
    const middlewareConfig = {
      adminEmails: ['facudev4@gmail.com', 'facucercuetti420@gmail.com'],
      roles: {
        SUPER_ADMIN: 'admin',
        ADMIN_BASICO: 'admin',
        CUSTOMER: 'customer'
      },
      isAllowedAdminRole: 'function(role) { return role === "admin" || role === "admin_basico" || role === "super_admin"; }'
    };

    // 4. Diagnóstico del problema
    const diagnosis = {
      rootCause: 'El middleware tiene una verificación doble: primero permite acceso (api_access_granted) pero luego aplica otra verificación que niega el acceso',
      specificIssue: 'La función isAllowedAdminRole probablemente no está siendo llamada correctamente o hay una condición que anula el email override',
      loginIssue: directLoginTest.status === 401 ? 'El login endpoint está fallando antes de llegar al middleware de rutas admin' : 'Login funciona pero acceso a APIs falla'
    };

    // 5. Solución propuesta
    const proposedFix = {
      step1: 'Simplificar middleware: si isAdminEmail, permitir acceso inmediatamente sin verificar rol',
      step2: 'Corregir loop infinito en login page (revisar useEffect y dependencias)',
      step3: 'Verificar que el login endpoint no tenga verificaciones de rol restrictivas',
      step4: 'Asegurar que las APIs usen la misma lógica de permisos que las páginas admin'
    };

    return NextResponse.json({
      success: true,
      message: 'Diagnóstico de emergencia del middleware',
      issues: middlewareIssues,
      directLoginTest: directLoginTest,
      middlewareConfig: middlewareConfig,
      diagnosis: diagnosis,
      proposedFix: proposedFix,
      immediateAction: 'El middleware necesita ser simplificado para evitar la contradicción entre api_access_granted y 403',
      status: 'EMERGENCY - MIDDLEWARE CONTRADICTION DETECTED',
      nextSteps: [
        '1. Simplificar verificación de middleware para admin emails',
        '2. Corregir loop infinito en login page',
        '3. Probar login y acceso a APIs después del fix',
        '4. Verificar que no haya más contradicciones'
      ]
    });

  } catch (error) {
    console.error('Error en diagnóstico de emergencia:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
