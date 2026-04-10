import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';

function isSuperAdminRole(role: string | null | undefined) {
  return String(role || '').trim().toLowerCase() === 'super_admin';
}

export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload || !isSuperAdminRole(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const start = Date.now();

  // A light query against an always-present table in this project.
  const { error } = await supabaseAdmin
    .from('api_request_logs')
    .select('id', { count: 'exact', head: true })
    .limit(1);

  const latency_ms = Date.now() - start;

  if (error) {
    return NextResponse.json(
      {
        status: 'ERROR' as const,
        latency_ms,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: 'OK' as const, latency_ms });
}
