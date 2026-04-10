import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyPassword, createJWTPayload } from '@/lib/auth';
import { signToken, signRefreshToken } from '@/lib/jwt';
import { JWTPayload } from '@/types';

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
    // Silently fail - don't block login for logging errors
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check JWT configuration
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Fetch user from database using admin client to bypass RLS
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, password_hash, is_active')
      .eq('email', normalizedEmail)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      await logSecurityEvent({
        event_type: 'login_failed_user_not_found',
        email: normalizedEmail,
        ip: request.headers.get('x-forwarded-for') || null,
        user_agent: request.headers.get('user-agent') || null,
        path: '/api/auth/login',
      });

      // Generic error to prevent user enumeration
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Only allow admin_basico and super_admin roles to log in to admin panel
    const allowedRoles = ['admin_basico', 'super_admin'];
    if (!allowedRoles.includes(user.role)) {
      await logSecurityEvent({
        event_type: 'login_failed_insufficient_role',
        email: normalizedEmail,
        ip: request.headers.get('x-forwarded-for') || null,
        user_agent: request.headers.get('user-agent') || null,
        path: '/api/auth/login',
        meta: { attempted_role: user.role },
      });

      return NextResponse.json(
        { error: 'No tienes permisos para acceder al panel de administración' },
        { status: 403 }
      );
    }

    // Verify password using bcrypt
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      await logSecurityEvent({
        event_type: 'login_failed_password',
        email: normalizedEmail,
        ip: request.headers.get('x-forwarded-for') || null,
        user_agent: request.headers.get('user-agent') || null,
        path: '/api/auth/login',
      });

      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Create JWT payload
    const payload: JWTPayload = createJWTPayload({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    });

    // Sign tokens
    const token = signToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Log successful login
    await logSecurityEvent({
      event_type: 'login_success',
      email: normalizedEmail,
      ip: request.headers.get('x-forwarded-for') || null,
      user_agent: request.headers.get('user-agent') || null,
      path: '/api/auth/login',
      meta: { role: user.role },
    });

    // Build response
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      token,
    });

    // Set HTTP-only cookies
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
