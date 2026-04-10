import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';

function isSuperAdminRole(role: string | null | undefined) {
  return String(role || '').trim().toLowerCase() === 'super_admin';
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  const clamped = Math.min(sorted.length - 1, Math.max(0, idx));
  return sorted[clamped];
}

type ApiRequestLogRow = {
  method?: string | null;
  path?: string | null;
  status_code?: number | null;
  duration_ms?: number | null;
};

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload || !isSuperAdminRole(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const windowMinutes = Math.max(1, Math.min(24 * 60, Number(searchParams.get('windowMinutes') || 60)));
  const limit = Math.max(100, Math.min(5000, Number(searchParams.get('limit') || 5000)));

  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('api_request_logs')
    .select('method,path,status_code,duration_ms,created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const groups = new Map<string, { method: string; path: string; durations: number[]; total: number; errors: number }>();

  for (const row of (data || []) as ApiRequestLogRow[]) {
    const method = String(row.method || 'GET').toUpperCase();
    const path = String(row.path || '');
    const status = Number(row.status_code || 0);
    const duration = Number(row.duration_ms || 0);

    const key = `${method} ${path}`;
    const g = groups.get(key) || { method, path, durations: [], total: 0, errors: 0 };
    g.total += 1;
    g.durations.push(duration);
    if (status >= 400) g.errors += 1;
    groups.set(key, g);
  }

  const items = Array.from(groups.values()).map((g) => {
    const durations = g.durations.sort((a, b) => a - b);
    const sum = durations.reduce((acc, v) => acc + v, 0);
    const avg = durations.length ? sum / durations.length : 0;
    const p95 = percentile(durations, 95);

    return {
      path: g.path,
      method: g.method,
      request_count: g.total,
      avg_duration_ms: avg,
      p95_duration_ms: p95,
      error_rate: g.total ? g.errors / g.total : 0,
    };
  });

  items.sort((a, b) => b.request_count - a.request_count);

  return NextResponse.json({
    windowMinutes,
    since,
    sampleLimit: limit,
    items,
  });
}
