'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Webhook {
  id: string;
  name: string;
  url: string;
  event: string;
  method: 'POST' | 'GET';
  headers: Record<string, string>;
  isActive: boolean;
  secret: string;
  retryCount: number;
  timeout: number;
  lastTriggered?: string;
  lastStatus?: 'success' | 'failed' | 'pending';
  createdAt: string;
  description: string;
}

interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failed' | 'pending';
  responseCode?: number;
  responseTime: number;
  error?: string;
  payload: unknown;
  timestamp: string;
}

type NewWebhook = {
  name: string;
  url: string;
  event: string;
  method: 'POST' | 'GET';
  headers: Record<string, string>;
  secret: string;
  retryCount: number;
  timeout: number;
  description: string;
};

type ApiWebhook = {
  id: string;
  name: string;
  url: string;
  event: string;
  method: 'POST' | 'GET';
  headers?: Record<string, string>;
  is_active: boolean;
  secret: string;
  retry_count: number;
  timeout: number;
  created_at: string;
  description?: string;
};

type ApiWebhookLog = {
  id: string;
  webhook_id?: string;
  event?: string;
  status?: 'success' | 'failed' | 'pending';
  response_code?: number;
  response_time?: number;
  error?: string;
  payload?: unknown;
  created_at?: string;
};

export default function WebhooksPage() {
  const [activeTab, setActiveTab] = useState<'webhooks' | 'logs'>('webhooks');
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState<NewWebhook>({
    name: '',
    url: '',
    event: '',
    method: 'POST',
    headers: {},
    secret: '',
    retryCount: 3,
    timeout: 30000,
    description: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/webhooks');
      const data = await res.json();

      const mappedWebhooks: Webhook[] = ((data.webhooks || []) as ApiWebhook[]).map((w) => ({
        id: w.id,
        name: w.name,
        url: w.url,
        event: w.event,
        method: w.method,
        headers: w.headers || {},
        isActive: Boolean(w.is_active),
        secret: w.secret,
        retryCount: Number(w.retry_count || 0),
        timeout: Number(w.timeout || 0),
        createdAt: w.created_at,
        description: w.description || '',
      }));

      const mappedLogs: WebhookLog[] = ((data.logs || []) as ApiWebhookLog[]).map((log) => ({
        id: log.id,
        webhookId: log.webhook_id || '',
        event: log.event || 'unknown',
        status: log.status || 'pending',
        responseCode: log.response_code,
        responseTime: Number(log.response_time || 0),
        error: log.error,
        payload: log.payload,
        timestamp: log.created_at || new Date().toISOString(),
      }));

      setWebhooks(mappedWebhooks);
      setWebhookLogs(mappedLogs);
      setStats(data.stats || { total: 0, active: 0, inactive: 0 });
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const availableEvents = [
    'order.created',
    'order.updated',
    'order.cancelled',
    'payment.completed',
    'payment.failed',
    'payment.refunded',
    'product.created',
    'product.updated',
    'product.out_of_stock',
    'customer.created',
    'customer.updated',
    'inventory.low_stock'
  ];

  const handleCreateWebhook = async () => {
    setIsCreating(true);
    try {
      // Simular creación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const webhook: Webhook = {
        id: Date.now().toString(),
        ...newWebhook,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastStatus: undefined
      };
      
      setWebhooks(prev => [...prev, webhook]);
      setNewWebhook({
        name: '',
        url: '',
        event: '',
        method: 'POST',
        headers: {},
        secret: '',
        retryCount: 3,
        timeout: 30000,
        description: ''
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating webhook:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleWebhook = async (webhookId: string) => {
    try {
      // Simular toggle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setWebhooks(prev => prev.map(webhook => 
        webhook.id === webhookId 
          ? { ...webhook, isActive: !webhook.isActive }
          : webhook
      ));
    } catch (error) {
      console.error('Error toggling webhook:', error);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este webhook?')) return;
    
    try {
      // Simular eliminación
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };

  const handleTestWebhook = async (webhook: Webhook) => {
    try {
      // Simular test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar último estado
      setWebhooks(prev => prev.map(w => 
        w.id === webhook.id 
          ? { 
              ...w, 
              lastTriggered: new Date().toISOString(),
              lastStatus: Math.random() > 0.2 ? 'success' : 'failed'
            }
          : w
      ));
      
      // Agregar log de prueba
      const testLog: WebhookLog = {
        id: Date.now().toString(),
        webhookId: webhook.id,
        event: 'test',
        status: Math.random() > 0.2 ? 'success' : 'failed',
        responseCode: Math.random() > 0.2 ? 200 : 500,
        responseTime: Math.floor(Math.random() * 1000) + 100,
        payload: { test: true, timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString()
      };
      
      setWebhookLogs(prev => [testLog, ...prev]);
    } catch (error) {
      console.error('Error testing webhook:', error);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="success">Éxito</Badge>;
      case 'failed':
        return <Badge variant="error">Falló</Badge>;
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>;
      default:
        return <Badge variant="default">Nunca</Badge>;
    }
  };

  const tabs: Array<{ id: 'webhooks' | 'logs'; label: string; count: number }> = [
    { id: 'webhooks', label: 'Webhooks', count: webhooks.length },
    { id: 'logs', label: 'Logs', count: webhookLogs.length },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-sm text-muted-2">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Webhooks</h1>
          <p className="text-muted text-sm">Gestiona las integraciones automáticas con servicios externos.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            + Nuevo Webhook
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-2">Activos</span>
            <span className="text-2xl">🟢</span>
          </div>
          <div className="text-2xl font-bold text-green-500">{stats.active}</div>
          <div className="text-xs text-muted-2">Webhooks funcionando</div>
        </div>
        
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-2">Inactivos</span>
            <span className="text-2xl">🔴</span>
          </div>
          <div className="text-2xl font-bold text-red-500">{stats.inactive}</div>
          <div className="text-xs text-muted-2">Webhooks desactivados</div>
        </div>
        
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-2">Total</span>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-2xl font-bold text-blue-500">{stats.total}</div>
          <div className="text-xs text-muted-2">Todos los webhooks</div>
        </div>
        
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-2">Ejecuciones Hoy</span>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-2xl font-bold text-purple-500">
            {webhookLogs.filter(log => 
              new Date(log.timestamp).toDateString() === new Date().toDateString()
            ).length}
          </div>
          <div className="text-xs text-muted-2">Webhooks ejecutados hoy</div>
        </div>
      </div>

      {/* Create Webhook Form */}
      {showCreateForm && (
        <div className="bg-surface-2 border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Crear Nuevo Webhook</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={newWebhook.name}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Ej: Nueva Orden"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                URL
              </label>
              <input
                type="url"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="https://api.mi-sistema.com/webhook"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Evento
              </label>
              <select
                value={newWebhook.event}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, event: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Seleccionar evento...</option>
                {availableEvents.map(event => (
                  <option key={event} value={event}>{event}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Método HTTP
              </label>
              <select
                value={newWebhook.method}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, method: e.target.value as 'POST' | 'GET' }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Descripción
              </label>
              <textarea
                value={newWebhook.description}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                placeholder="Describe para qué sirve este webhook..."
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button
              onClick={handleCreateWebhook}
              disabled={isCreating || !newWebhook.name || !newWebhook.url || !newWebhook.event}
              className="bg-accent hover:bg-accent/90 text-white"
            >
              {isCreating ? 'Creando...' : 'Crear Webhook'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <span>{tab.label}</span>
              <Badge variant="default" className="text-xs">
                {tab.count}
              </Badge>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'webhooks' && (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{webhook.name}</h3>
                      <Badge variant={webhook.isActive ? 'success' : 'default'}>
                        {webhook.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                      {webhook.lastStatus && getStatusBadge(webhook.lastStatus)}
                    </div>
                    <p className="text-sm text-muted-2 mb-3">{webhook.description}</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-2">URL:</span>
                        <div className="font-mono text-foreground break-all">{webhook.url}</div>
                      </div>
                      <div>
                        <span className="text-muted-2">Evento:</span>
                        <div className="font-mono text-foreground">{webhook.event}</div>
                      </div>
                      <div>
                        <span className="text-muted-2">Método:</span>
                        <div className="font-mono text-foreground">{webhook.method}</div>
                      </div>
                      <div>
                        <span className="text-muted-2">Reintentos:</span>
                        <div className="font-mono text-foreground">{webhook.retryCount}</div>
                      </div>
                      {webhook.lastTriggered && (
                        <div>
                          <span className="text-muted-2">Última ejecución:</span>
                          <div className="font-mono text-foreground">
                            {new Date(webhook.lastTriggered).toLocaleString('es-AR')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestWebhook(webhook)}
                    >
                      Probar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleWebhook(webhook.id)}
                    >
                      {webhook.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWebhook(webhook.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-2">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                      Webhook
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                      Evento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                      Tiempo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-2 uppercase tracking-wider">
                      Error
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {webhookLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-2 transition-colors">
                      <td className="px-4 py-4 text-sm text-muted-2">
                        {new Date(log.timestamp).toLocaleString('es-AR')}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {webhooks.find(w => w.id === log.webhookId)?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-4 text-sm font-mono text-muted-2">
                        {log.event}
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(log.status)}</td>
                      <td className="px-4 py-4 text-sm text-muted-2">
                        {log.responseCode || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-2">
                        {log.responseTime}ms
                      </td>
                      <td className="px-4 py-4 text-sm text-red-500">
                        {log.error || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
