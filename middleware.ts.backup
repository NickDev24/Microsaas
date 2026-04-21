import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import type { JWTPayload } from '@/types';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');

// Unified roles as per project specification
const ROLES = {
  ADMIN_BASICO: 'admin_basico',
  SUPER_ADMIN: 'super_admin',
} as const;

function isAllowedAdminRole(role: string | undefined): role is (typeof ROLES)[keyof typeof ROLES] {
  return role === ROLES.ADMIN_BASICO || role === ROLES.SUPER_ADMIN;
}

// Routes that require specific roles
const ROLE_PROTECTED_ROUTES: Record<string, string[]> = {
  '/admin/superadmin': [ROLES.SUPER_ADMIN],
  '/admin/usuarios': [ROLES.SUPER_ADMIN],
  '/admin/roles': [ROLES.SUPER_ADMIN],
  '/admin/configuracion': [ROLES.SUPER_ADMIN],
};

async function logSecurityEvent(params: {
  event_type: string;
  email?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  path?: string | null;
  meta?: Record<string, unknown>;
}) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return;

    await fetch(`${supabaseUrl}/rest/v1/security_events`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        event_type: params.event_type,
        email: params.email ?? null,
        ip: params.ip ?? null,
        user_agent: params.user_agent ?? null,
        path: params.path ?? null,
        meta: params.meta ?? {},
      }),
    });
  } catch {
    return;
  }
}

async function logApiRequest(params: {
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  user_email?: string | null;
  user_role?: string | null;
}) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return;

    await fetch(`${supabaseUrl}/rest/v1/api_request_logs`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        method: params.method,
        path: params.path,
        status_code: params.status_code,
        duration_ms: params.duration_ms,
        user_email: params.user_email ?? null,
        user_role: params.user_role ?? null,
      }),
    });
  } catch {
    return;
  }
}

async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return null;
    }
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

// Define public API routes (mostly GET for content)
const publicApiPrefixes = [
  '/api/auth',
  '/api/categories',
  '/api/products',
  '/api/promotions',
  '/api/limited-editions',
  '/api/seasonal-discounts',
];

// Check if route requires specific role
function getRequiredRoles(pathname: string): string[] | null {
  for (const [route, roles] of Object.entries(ROLE_PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if it's an admin route
  if (pathname.startsWith('/admin')) {
    // Exclude login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Get token from cookies
    const token = request.cookies.get('token')?.value;

    if (!token) {
      await logSecurityEvent({
        event_type: 'admin_access_no_token',
        ip: request.headers.get('x-forwarded-for') || null,
        user_agent: request.headers.get('user-agent') || null,
        path: pathname,
      });
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const payload = await verifyTokenEdge(token);
    if (!payload) {
      await logSecurityEvent({
        event_type: 'admin_access_invalid_token',
        ip: request.headers.get('x-forwarded-for') || null,
        user_agent: request.headers.get('user-agent') || null,
        path: pathname,
      });
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Check if route requires specific role
    const requiredRoles = getRequiredRoles(pathname);
    if (requiredRoles && !requiredRoles.includes(payload.role || '')) {
      await logSecurityEvent({
        event_type: 'admin_access_insufficient_role',
        email: payload.email,
        ip: request.headers.get('x-forwarded-for') || null,
        user_agent: request.headers.get('user-agent') || null,
        path: pathname,
        meta: { required: requiredRoles, actual: payload.role },
      });
      // Redirect to dashboard if insufficient permissions
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // All admin routes require at least admin_basico or super_admin
    if (!isAllowedAdminRole(payload.role)) {
      await logSecurityEvent({
        event_type: 'admin_access_invalid_role',
        email: payload.email,
        ip: request.headers.get('x-forwarded-for') || null,
        user_agent: request.headers.get('user-agent') || null,
        path: pathname,
        meta: { actual_role: payload.role },
      });
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  }

  // 2. Check if it's an API route
  if (pathname.startsWith('/api')) {
    const isProxyRequest = request.headers.get('x-mw-proxy') === '1';
    const start = Date.now();

    // Allow public API methods
    const isPublicPrefix = publicApiPrefixes.some(prefix => pathname.startsWith(prefix));

    // Auth routes are public (POST /api/auth/login)
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    // If it's a public GET, we still proxy to measure status/latency (no auth payload).
    if (isPublicPrefix && request.method === 'GET') {
      if (isProxyRequest) {
        return NextResponse.next();
      }

      const proxyHeaders = new Headers(request.headers);
      proxyHeaders.set('x-mw-proxy', '1');

      const clonedRequest = request.clone();
      const proxyRequest = new Request(clonedRequest.url, {
        method: clonedRequest.method,
        headers: proxyHeaders,
        body: clonedRequest.body,
        redirect: 'manual',
      });

      try {
        const response = await fetch(proxyRequest);
        const durationMs = Date.now() - start;

        await logApiRequest({
          method: request.method,
          path: pathname,
          status_code: response.status,
          duration_ms: durationMs,
          user_email: null,
          user_role: null,
        });

        return response;
      } catch {
        const durationMs = Date.now() - start;
        await logApiRequest({
          method: request.method,
          path: pathname,
          status_code: 599,
          duration_ms: durationMs,
          user_email: null,
          user_role: null,
        });

        return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 });
      }
    }

    // Protect all other API routes
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : request.cookies.get('token')?.value;

    if (!token) {
      await logSecurityEvent({
        event_type: 'api_access_no_token',
        ip: request.headers.get('x-forwarded-for') || null,
        user_agent: request.headers.get('user-agent') || null,
        path: pathname,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyTokenEdge(token);
    if (!payload) {
      await logSecurityEvent({
        event_type: 'api_access_invalid_token',
        ip: request.headers.get('x-forwarded-for') || null,
        user_agent: request.headers.get('user-agent') || null,
        path: pathname,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role-based protection for specific endpoints
    if (['POST', 'DELETE', 'PUT', 'PATCH'].includes(request.method)) {
      // Only super_admin can delete categories
      if (pathname.startsWith('/api/categories') && request.method === 'DELETE') {
        if (payload.role !== ROLES.SUPER_ADMIN) {
          return NextResponse.json({ error: 'Forbidden - Requires super_admin' }, { status: 403 });
        }
      }
      // Only super_admin can manage users
      if (pathname.startsWith('/api/users') && payload.role !== ROLES.SUPER_ADMIN) {
        return NextResponse.json({ error: 'Forbidden - Requires super_admin' }, { status: 403 });
      }
      // superadmin routes are restricted to super_admin
      if (pathname.startsWith('/api/superadmin') && payload.role !== ROLES.SUPER_ADMIN) {
        return NextResponse.json({ error: 'Forbidden - Requires super_admin' }, { status: 403 });
      }
    }

    if (isProxyRequest) {
      return NextResponse.next();
    }

    const proxyHeaders = new Headers(request.headers);
    proxyHeaders.set('x-mw-proxy', '1');

    const clonedRequest = request.clone();
    const proxyRequest = new Request(clonedRequest.url, {
      method: clonedRequest.method,
      headers: proxyHeaders,
      body: clonedRequest.body,
      redirect: 'manual',
    });

    try {
      const response = await fetch(proxyRequest);
      const durationMs = Date.now() - start;

      await logApiRequest({
        method: request.method,
        path: pathname,
        status_code: response.status,
        duration_ms: durationMs,
        user_email: payload.email,
        user_role: payload.role,
      });

      return response;
    } catch {
      const durationMs = Date.now() - start;

      await logApiRequest({
        method: request.method,
        path: pathname,
        status_code: 599,
        duration_ms: durationMs,
        user_email: payload.email,
        user_role: payload.role,
      });

      return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
};
