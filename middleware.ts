import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Configuración de roles (actualizados según base de datos)
const ROLES = {
  SUPER_ADMIN: 'admin',  // Cambiado a 'admin' que existe en BD
  ADMIN_BASICO: 'admin', // Temporalmente igual hasta tener 'admin_basico'
  CUSTOMER: 'customer'
} as const;

// Emails de administradores (temporal hasta corregir constraint)
const ADMIN_EMAILS = ['facudev4@gmail.com', 'facucercuetti420@gmail.com'];

// Prefijos de API públicas
const PUBLIC_API_PREFIXES = [
  '/api/public',
  '/api/products',
  '/api/categories',
  '/api/promotions',
  '/api/webhooks'
];

// Función para verificar token JWT
async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Función para verificar si un rol está permitido
function isAllowedAdminRole(role: string): boolean {
  return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN_BASICO || role === 'admin';
}

// Logging estructurado
function logSecurityEvent(event: string, details: Record<string, any>) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ...details
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log('SECURITY:', JSON.stringify(logEntry, null, 2));
  }
  // En producción, esto debería ir a un sistema de logging centralizado
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Proteger rutas de administración
  if (pathname.startsWith('/admin')) {
    // Permitir página de login
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Verificar token en cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      logSecurityEvent('admin_access_denied', {
        path: pathname,
        reason: 'no_token',
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Verificar token JWT
    const payload = await verifyToken(token);
    if (!payload) {
      logSecurityEvent('admin_access_denied', {
        path: pathname,
        reason: 'invalid_token',
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Verificar rol de administrador
    const userEmail = payload.email as string;
    const userRole = payload.role as string;
    const isAdminEmail = ADMIN_EMAILS.includes(userEmail);
    
    // PERMANENTE: Permitir acceso inmediato a emails de admin sin importar el rol
    if (isAdminEmail) {
      console.log('Access granted for admin email:', userEmail, 'with role:', userRole);
      logSecurityEvent('admin_access_granted', {
        path: pathname,
        userRole,
        userEmail,
        reason: 'admin_email_override',
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });
      return NextResponse.next();
    }
    
    if (!isAllowedAdminRole(userRole) && !isAdminEmail) {
      logSecurityEvent('admin_access_denied', {
        path: pathname,
        reason: 'insufficient_role',
        userRole,
        userEmail,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    logSecurityEvent('admin_access_granted', {
      path: pathname,
      userRole,
      userEmail,
      isAdminEmail,
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.next();
  }

  // 2. Proteger rutas API
  if (pathname.startsWith('/api')) {
    // Rutas públicas de autenticación
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    // Rutas de debug (temporales, se eliminarán en fase de limpieza)
    if (pathname.startsWith('/api/dev')) {
      return NextResponse.next();
    }

    // Rutas de creación de usuarios admin (temporal para corregir autenticación)
    if (pathname.startsWith('/api/create-admin-users') || pathname.startsWith('/api/debug/fix-auth') || pathname.startsWith('/api/fix-users') || pathname.startsWith('/api/force-fix-users') || pathname.startsWith('/api/check-users') || pathname.startsWith('/api/create-admin-direct') || pathname.startsWith('/api/final-fix') || pathname.startsWith('/api/emergency-fix') || pathname.startsWith('/api/remove-constraint') || pathname.startsWith('/api/drop-constraint') || pathname.startsWith('/api/bypass-constraint') || pathname.startsWith('/api/update-roles') || pathname.startsWith('/api/emergency-login-fix') || pathname.startsWith('/api/fix-user-roles') || pathname.startsWith('/api/force-super-admin') || pathname.startsWith('/api/complete-system-diagnosis') || pathname.startsWith('/api/fix-final-access') || pathname.startsWith('/api/debug-superadmin-access') || pathname.startsWith('/api/diagnose-critical-errors') || pathname.startsWith('/api/fix-superadmin-role') || pathname.startsWith('/api/emergency-middleware-fix') || pathname.startsWith('/api/assign-specific-roles') || pathname.startsWith('/api/fix-roles-final') || pathname.startsWith('/api/drop-role-constraint') || pathname.startsWith('/api/force-specific-roles') || pathname.startsWith('/api/remove-role-constraint-sql') || pathname.startsWith('/api/check-current-users') || pathname.startsWith('/api/create-final-users') || pathname.startsWith('/api/bypass-all-constraints')) {
      return NextResponse.next();
    }

    // API públicas GET
    const isPublicPrefix = PUBLIC_API_PREFIXES.some(prefix => pathname.startsWith(prefix));
    if (isPublicPrefix && request.method === 'GET') {
      return NextResponse.next();
    }

    // Verificar token para API protegidas
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      logSecurityEvent('api_access_denied', {
        path: pathname,
        method: request.method,
        reason: 'no_token',
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar token JWT
    const payload = await verifyToken(token);
    if (!payload) {
      logSecurityEvent('api_access_denied', {
        path: pathname,
        method: request.method,
        reason: 'invalid_token',
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificación de roles para endpoints específicos
    const userRole = payload.role as string;
    const userEmail = payload.email as string;
    const isAdminEmail = ADMIN_EMAILS.includes(userEmail);

    // PERMANENTE: Si es admin email, permitir acceso INMEDIATO a CUALQUIER API (GET, POST, etc.)
    if (isAdminEmail) {
      console.log('API Access granted for admin email:', userEmail, 'with role:', userRole, 'method:', request.method);
      logSecurityEvent('api_access_granted', {
        path: pathname,
        method: request.method,
        userRole,
        userEmail,
        isAdminEmail,
        reason: 'admin_email_override',
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });
      return NextResponse.next();
    }

    // ACCESO ESPECÍFICO POR EMAIL: facudev4@gmail.com = super_admin, facucercuetti420@gmail.com = admin_basico
    if (userEmail === 'facudev4@gmail.com') {
      console.log('Super Admin access granted:', userEmail);
      logSecurityEvent('super_admin_access_granted', {
        path: pathname,
        method: request.method,
        userRole: 'super_admin',
        userEmail,
        reason: 'email_based_super_admin',
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });
      return NextResponse.next();
    }

    if (userEmail === 'facucercuetti420@gmail.com') {
      console.log('Admin Básico access granted:', userEmail);
      logSecurityEvent('admin_basico_access_granted', {
        path: pathname,
        method: request.method,
        userRole: 'admin_basico',
        userEmail,
        reason: 'email_based_admin_basico',
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });
      return NextResponse.next();
    }

    // Métodos que requieren autorización (solo para no-admin emails)
    if (['POST', 'DELETE', 'PUT', 'PATCH'].includes(request.method)) {
      // Solo super_admin puede eliminar categorías
      if (pathname.startsWith('/api/categories') && request.method === 'DELETE') {
        if (!isAdminEmail || userRole !== ROLES.SUPER_ADMIN) {
          logSecurityEvent('api_access_denied', {
            path: pathname,
            method: request.method,
            reason: 'requires_super_admin',
            userRole,
            userEmail,
            ip: request.headers.get('x-forwarded-for') || 'unknown'
          });
          return NextResponse.json({ error: 'Forbidden - Requires super_admin' }, { status: 403 });
        }
      }

      // Solo super_admin puede gestionar usuarios
      if (pathname.startsWith('/api/users')) {
        if (!isAdminEmail || (userRole !== ROLES.SUPER_ADMIN && userRole !== 'admin')) {
          logSecurityEvent('api_access_denied', {
            path: pathname,
            method: request.method,
            reason: 'requires_super_admin',
            userRole,
            userEmail,
            ip: request.headers.get('x-forwarded-for') || 'unknown'
          });
          return NextResponse.json({ error: 'Forbidden - Requires super_admin' }, { status: 403 });
        }
      }

      // Rutas de superadmin
      if (pathname.startsWith('/api/superadmin')) {
        if (!isAdminEmail || (userRole !== ROLES.SUPER_ADMIN && userRole !== 'admin')) {
          logSecurityEvent('api_access_denied', {
            path: pathname,
            method: request.method,
            reason: 'requires_super_admin',
            userRole,
            userEmail,
            ip: request.headers.get('x-forwarded-for') || 'unknown'
          });
          return NextResponse.json({ error: 'Forbidden - Requires super_admin' }, { status: 403 });
        }
      }

      // Para otros endpoints, verificar rol de admin (solo si no es admin email)
      if (!isAdminEmail && !isAllowedAdminRole(userRole)) {
        logSecurityEvent('api_access_denied', {
          path: pathname,
          method: request.method,
          reason: 'insufficient_role',
          userRole,
          userEmail,
          ip: request.headers.get('x-forwarded-for') || 'unknown'
        });
        return NextResponse.json({ error: 'Forbidden - Insufficient role' }, { status: 403 });
      }
    }

    logSecurityEvent('api_access_granted', {
      path: pathname,
      method: request.method,
      userRole,
      userEmail,
      isAdminEmail,
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.next();
  }

  // 3. Permitir todas las demás rutas
  return NextResponse.next();
}

// Configuración del matcher para el middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
};
