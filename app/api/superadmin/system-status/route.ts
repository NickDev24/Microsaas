import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';

function isSuperAdminRole(role: string | null | undefined) {
  return String(role || '').trim().toLowerCase() === 'super_admin';
}

function ok(latency_ms: number) {
  return { status: 'OK' as const, latency_ms };
}

function err(error: string, latency_ms?: number) {
  return { status: 'ERROR' as const, latency_ms, error };
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload || !isSuperAdminRole(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const origin = new URL(request.url).origin;

  const supabaseStart = Date.now();
  const supabaseRes = await supabaseAdmin.from('webhook_logs').select('id', { count: 'exact', head: true }).limit(1);
  const supabaseLatency = Date.now() - supabaseStart;
  const supabaseStatus = supabaseRes.error ? err(supabaseRes.error.message, supabaseLatency) : ok(supabaseLatency);

  const apiStart = Date.now();
  let apiStatus: ReturnType<typeof ok> | ReturnType<typeof err>;
  try {
    const res = await fetch(`${origin}/api/overview`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });
    const apiLatency = Date.now() - apiStart;
    apiStatus = res.ok ? ok(apiLatency) : err(`HTTP ${res.status}`, apiLatency);
  } catch (e) {
    apiStatus = err(e instanceof Error ? e.message : 'Fetch failed', Date.now() - apiStart);
  }

  const webhooksStart = Date.now();
  const { error: webhookLogsError } = await supabaseAdmin
    .from('webhook_logs')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1);
  const webhooksLatency = Date.now() - webhooksStart;
  const webhooksStatus = webhookLogsError ? err(webhookLogsError.message, webhooksLatency) : ok(webhooksLatency);

  const n8nUrl = process.env.N8N_HEALTHCHECK_URL || process.env.WEBHOOK_N8N_URL;
  const n8nStart = Date.now();
  let n8nStatus: ReturnType<typeof ok> | ReturnType<typeof err>;
  if (!n8nUrl) {
    n8nStatus = err('Missing N8N_HEALTHCHECK_URL (or WEBHOOK_N8N_URL)', 0);
  } else {
    try {
      const res = await fetch(n8nUrl, {
        method: 'GET',
        cache: 'no-store',
      });
      const n8nLatency = Date.now() - n8nStart;
      n8nStatus = res.ok ? ok(n8nLatency) : err(`HTTP ${res.status}`, n8nLatency);
    } catch (e) {
      n8nStatus = err(e instanceof Error ? e.message : 'Fetch failed', Date.now() - n8nStart);
    }
  }

  return NextResponse.json({
    supabase: supabaseStatus,
    api: apiStatus,
    webhooks: webhooksStatus,
    n8n: n8nStatus,
  });
}
