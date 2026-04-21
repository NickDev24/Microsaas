import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, signToken } from '@/lib/jwt';
import { JWTPayload } from '@/types';
import { supabaseAdmin } from '@/lib/supabase';

function clearAuthCookies(response: NextResponse) {
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      const res = NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
      clearAuthCookies(res);
      return res;
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      const res = NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
      clearAuthCookies(res);
      return res;
    }

    // Revalidate user against DB (prevents zombie sessions / role drift)
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', payload.sub)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      const res = NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
      clearAuthCookies(res);
      return res;
    }

    // Sign new access token
    const newPayload: JWTPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = signToken(newPayload);

    const response = NextResponse.json({ token });

    // Update access token cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
