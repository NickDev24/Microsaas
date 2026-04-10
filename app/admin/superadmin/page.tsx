'use client';

import { useEffect, useMemo, useState } from 'react';
import { KPICard } from '@/components/admin/KPICard';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Chart } from '@/components/admin/Chart';

type HealthStatus = 'OK' | 'ERROR';

interface SystemStatus {
  supabase: { status: HealthStatus; latency_ms?: number; error?: string | null };
  api: { status: HealthStatus; latency_ms?: number; error?: string | null };
  n8n: { status: HealthStatus; latency_ms?: number; error?: string | null };
  webhooks: { status: HealthStatus; latency_ms?: number; error?: string | null };
}

interface DbPingStatus {
  status: HealthStatus;
  latency_ms?: number;
  error?: string | null;
}

interface ApiEndpointMetric {
  id: string;
  path: string;
  method: string;
  request_count: number;
  avg_duration_ms: number;
  p95_duration_ms: number;
  error_rate: number;
}

interface WebhookLogRow {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  status_code?: number | null;
  success: boolean;
  response_body?: string | null;
  created_at?: string;
}

function StatusBadge({ status }: { status: HealthStatus }) {
  return <Badge variant={status === 'OK' ? 'success' : 'error'}>{status}</Badge>;
}

export default function SuperAdminPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [dbPing, setDbPing] = useState<DbPingStatus | null>(null);
  const [apiMetrics, setApiMetrics] = useState<ApiEndpointMetric[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLogRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const [systemRes, dbRes, apiRes, webhookRes] = await Promise.all([
          fetch('/api/superadmin/system-status'),
          fetch('/api/superadmin/db-ping'),
          fetch('/api/superadmin/api-metrics?windowMinutes=60'),
          fetch('/api/superadmin/webhook-logs?limit=50'),
        ]);

        const [systemJson, dbJson, apiJson, webhookJson] = await Promise.all([
          systemRes.json(),
          dbRes.json(),
          apiRes.json(),
          webhookRes.json(),
        ]);

        if (cancelled) return;

        setSystemStatus(systemJson);
        setDbPing(dbJson);
        setApiMetrics(
          Array.isArray(apiJson?.items)
            ? apiJson.items.map((item: Omit<ApiEndpointMetric, 'id'>, index: number) => ({
                ...item,
                id: `${item.method}-${item.path}-${index}`,
              }))
            : []
        );
        setWebhookLogs(Array.isArray(webhookJson?.items) ? webhookJson.items : []);
      } catch {
        if (cancelled) return;
        setSystemStatus(null);
        setDbPing(null);
        setApiMetrics([]);
        setWebhookLogs([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const apiColumns = useMemo(
    () => [
      { header: 'Method', accessor: (row: ApiEndpointMetric) => row.method },
      { header: 'Path', accessor: (row: ApiEndpointMetric) => row.path },
      { header: 'Requests', accessor: (row: ApiEndpointMetric) => row.request_count },
      { header: 'Avg (ms)', accessor: (row: ApiEndpointMetric) => Math.round(row.avg_duration_ms) },
      { header: 'P95 (ms)', accessor: (row: ApiEndpointMetric) => Math.round(row.p95_duration_ms) },
      {
        header: 'Error Rate',
        accessor: (row: ApiEndpointMetric) => `${(row.error_rate * 100).toFixed(1)}%`,
      },
    ],
    []
  );

  const webhookColumns = useMemo(
    () => [
      { header: 'At', accessor: (row: WebhookLogRow) => (row.created_at ? new Date(row.created_at).toLocaleString('es-AR') : '-') },
      { header: 'Event', accessor: (row: WebhookLogRow) => row.event_type },
      { header: 'Entity', accessor: (row: WebhookLogRow) => `${row.entity_type}:${row.entity_id}` },
      {
        header: 'Status',
        accessor: (row: WebhookLogRow) => (
          <Badge variant={row.success ? 'success' : 'error'}>{row.status_code ?? (row.success ? 200 : 'ERR')}</Badge>
        ),
      },
    ],
    []
  );

  const apiChartData = useMemo(() => {
    const top = [...apiMetrics]
      .sort((a, b) => b.request_count - a.request_count)
      .slice(0, 8);

    return top.map((m) => ({
      label: `${m.method} ${m.path}`.slice(0, 18),
      value: Math.round(m.avg_duration_ms),
    }));
  }, [apiMetrics]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Superadmin Técnico</h1>
          <p className="text-muted text-sm">Observabilidad, seguridad y control del sistema.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-2">Auto-refresh:</span>
          <Badge variant="info">30s</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
        <KPICard
          title="Supabase"
          value={systemStatus?.supabase?.status || '...'}
          subtitle={
            systemStatus?.supabase?.status === 'OK'
              ? `${systemStatus?.supabase?.latency_ms ?? 0}ms`
              : systemStatus?.supabase?.error || 'Error'
          }
          trend={{ value: 0, isUp: true }}
          icon="🗄️"
          color={systemStatus?.supabase?.status === 'OK' ? 'green' : 'red'}
        />
        <KPICard
          title="DB Ping"
          value={dbPing?.status || '...'}
          subtitle={
            dbPing?.status === 'OK'
              ? `${dbPing?.latency_ms ?? 0}ms`
              : dbPing?.error || 'Error'
          }
          trend={{ value: 0, isUp: true }}
          icon="📡"
          color={dbPing?.status === 'OK' ? 'green' : 'red'}
        />
        <KPICard
          title="API"
          value={systemStatus?.api?.status || '...'}
          subtitle={
            systemStatus?.api?.status === 'OK'
              ? `${systemStatus?.api?.latency_ms ?? 0}ms`
              : systemStatus?.api?.error || 'Error'
          }
          trend={{ value: 0, isUp: true }}
          icon="🧩"
          color={systemStatus?.api?.status === 'OK' ? 'green' : 'red'}
        />
        <KPICard
          title="Webhooks"
          value={systemStatus?.webhooks?.status || '...'}
          subtitle={
            systemStatus?.webhooks?.status === 'OK'
              ? `${systemStatus?.webhooks?.latency_ms ?? 0}ms`
              : systemStatus?.webhooks?.error || 'Error'
          }
          trend={{ value: 0, isUp: true }}
          icon="🔗"
          color={systemStatus?.webhooks?.status === 'OK' ? 'green' : 'red'}
        />
        <KPICard
          title="N8N"
          value={systemStatus?.n8n?.status || '...'}
          subtitle={
            systemStatus?.n8n?.status === 'OK'
              ? `${systemStatus?.n8n?.latency_ms ?? 0}ms`
              : systemStatus?.n8n?.error || 'Error'
          }
          trend={{ value: 0, isUp: true }}
          icon="⚙️"
          color={systemStatus?.n8n?.status === 'OK' ? 'green' : 'red'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">API Monitor (últimos 60 min)</h2>
            {systemStatus ? <StatusBadge status={systemStatus.api.status} /> : <Badge variant="warning">N/A</Badge>}
          </div>
          <DataTable
            columns={apiColumns}
            data={apiMetrics}
            isLoading={isLoading}
            emptyMessage="Todavía no hay métricas. Generá tráfico y verificá que exista la tabla api_request_logs."
          />
        </div>

        <div className="space-y-4">
          <Chart
            type="bar"
            title="Top Endpoints (Avg ms)"
            data={apiChartData}
            height={220}
            color="#3b82f6"
            animated={true}
            showTooltip={true}
          />

          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Webhook Logs (últimos 50)</h2>
              {systemStatus ? <StatusBadge status={systemStatus.webhooks.status} /> : <Badge variant="warning">N/A</Badge>}
            </div>
            <DataTable
              columns={webhookColumns}
              data={webhookLogs}
              isLoading={isLoading}
              emptyMessage="No hay logs en webhook_logs."
            />
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-2">Notas técnicas</h2>
        <div className="text-sm text-muted space-y-1">
          <div>
            <Badge variant="info">API metrics</Badge> vienen de <code>api_request_logs</code> (instrumentado en <code>middleware.ts</code>).
          </div>
          <div>
            <Badge variant="info">Status codes</Badge> se capturan vía proxy interno desde el middleware.
          </div>
          <div>
            <Badge variant="warning">Render time/memory</Badge> se agregan en próxima iteración (limitaciones del runtime browser/edge).
          </div>
        </div>
      </div>
    </div>
  );
}
