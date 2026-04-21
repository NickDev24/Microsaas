'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface LocalConfig {
  datosLocal: {
    nombreLocal: string;
    razonSocial: string;
    cuit: string;
    direccion: string;
    localidad: string;
    provincia: string;
    codigoPostal: string;
    telefono: string;
    email: string;
    web: string;
    horarioAtencion: string;
    coordenadas: {
      latitud: number;
      longitud: number;
    };
  };
  datosContacto: {
    whatsapp: string;
    instagram: string;
    facebook: string;
    twitter: string;
    emailContacto: string;
    telefonoContacto: string;
  };
  datosOperativos: {
    moneda: string;
    idioma: string;
    zonaHoraria: string;
    formatoFecha: string;
    formatoHora: string;
    impuestosIncluidos: boolean;
    porcentajeImpuesto: number;
  };
  datosEnvio: {
    costoEnvioLocal: number;
    costoEnvioNacional: number;
    envioGratisMinimo: number;
    metodosEnvio: string[];
    tiempoPreparacion: number;
  };
}

export default function LocalConfigPage() {
  const [activeTab, setActiveTab] = useState<'datos' | 'contacto' | 'operativos' | 'envio'>('datos');
  const [config, setConfig] = useState<LocalConfig>({
    datosLocal: {
      nombreLocal: 'Micro SaaS Ropa',
      razonSocial: 'Micro SaaS Ropa S.A.',
      cuit: '30-12345678-9',
      direccion: 'Av. Corrientes 1234',
      localidad: 'Buenos Aires',
      provincia: 'Buenos Aires',
      codigoPostal: 'C1000',
      telefono: '+54 11 1234-5678',
      email: 'info@microsaasropa.com',
      web: 'www.microsaasropa.com',
      horarioAtencion: 'Lunes a Viernes: 9:00 - 18:00 | Sábados: 9:00 - 13:00',
      coordenadas: {
        latitud: -34.6037,
        longitud: -58.3816
      }
    },
    datosContacto: {
      whatsapp: '+5491112345678',
      instagram: '@microsaasropa',
      facebook: 'microsaasropa',
      twitter: '@microsaasropa',
      emailContacto: 'contacto@microsaasropa.com',
      telefonoContacto: '+54 11 1234-5678'
    },
    datosOperativos: {
      moneda: 'ARS',
      idioma: 'es-AR',
      zonaHoraria: 'America/Argentina/Buenos_Aires',
      formatoFecha: 'DD/MM/YYYY',
      formatoHora: 'HH:mm',
      impuestosIncluidos: true,
      porcentajeImpuesto: 21
    },
    datosEnvio: {
      costoEnvioLocal: 500,
      costoEnvioNacional: 1200,
      envioGratisMinimo: 15000,
      metodosEnvio: ['Correo Argentino', 'OCA', 'Andreani', 'Retiro en local'],
      tiempoPreparacion: 24
    }
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateConfig = (section: keyof LocalConfig, field: string, value: unknown) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const tabs: Array<{ id: 'datos' | 'contacto' | 'operativos' | 'envio'; label: string; icon: string }> = [
    { id: 'datos', label: 'Datos del Local', icon: '🏪' },
    { id: 'contacto', label: 'Contacto', icon: '📞' },
    { id: 'operativos', label: 'Operativos', icon: '⚙️' },
    { id: 'envio', label: 'Envío', icon: '📦' }
  ];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1500));
      setHasChanges(false);
      // Mostrar mensaje de éxito
    } catch (error) {
      console.error('Error saving local config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Configuración del Local</h1>
          <p className="text-muted text-sm">Gestiona los datos de tu negocio y local físico.</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="warning" className="animate-pulse">
              Hay cambios sin guardar
            </Badge>
          )}
          <Button
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'datos' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Información del Local</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre del Local
                  </label>
                  <input
                    type="text"
                    value={config.datosLocal.nombreLocal}
                    onChange={(e) => updateConfig('datosLocal', 'nombreLocal', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Razón Social
                  </label>
                  <input
                    type="text"
                    value={config.datosLocal.razonSocial}
                    onChange={(e) => updateConfig('datosLocal', 'razonSocial', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    CUIT
                  </label>
                  <input
                    type="text"
                    value={config.datosLocal.cuit}
                    onChange={(e) => updateConfig('datosLocal', 'cuit', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={config.datosLocal.direccion}
                    onChange={(e) => updateConfig('datosLocal', 'direccion', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Ubicación</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Localidad
                    </label>
                    <input
                      type="text"
                      value={config.datosLocal.localidad}
                      onChange={(e) => updateConfig('datosLocal', 'localidad', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Provincia
                    </label>
                    <input
                      type="text"
                      value={config.datosLocal.provincia}
                      onChange={(e) => updateConfig('datosLocal', 'provincia', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      value={config.datosLocal.codigoPostal}
                      onChange={(e) => updateConfig('datosLocal', 'codigoPostal', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={config.datosLocal.telefono}
                      onChange={(e) => updateConfig('datosLocal', 'telefono', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={config.datosLocal.email}
                    onChange={(e) => updateConfig('datosLocal', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    value={config.datosLocal.web}
                    onChange={(e) => updateConfig('datosLocal', 'web', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Horario de Atención
                  </label>
                  <textarea
                    value={config.datosLocal.horarioAtencion}
                    onChange={(e) => updateConfig('datosLocal', 'horarioAtencion', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contacto' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Redes Sociales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Redes Sociales</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={config.datosContacto.whatsapp}
                    onChange={(e) => updateConfig('datosContacto', 'whatsapp', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={config.datosContacto.instagram}
                    onChange={(e) => updateConfig('datosContacto', 'instagram', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Facebook
                  </label>
                  <input
                    type="text"
                    value={config.datosContacto.facebook}
                    onChange={(e) => updateConfig('datosContacto', 'facebook', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Twitter
                  </label>
                  <input
                    type="text"
                    value={config.datosContacto.twitter}
                    onChange={(e) => updateConfig('datosContacto', 'twitter', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            {/* Contacto Directo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Contacto Directo</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    value={config.datosContacto.emailContacto}
                    onChange={(e) => updateConfig('datosContacto', 'emailContacto', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    value={config.datosContacto.telefonoContacto}
                    onChange={(e) => updateConfig('datosContacto', 'telefonoContacto', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'operativos' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuración General */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Configuración General</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Moneda
                    </label>
                    <select
                      value={config.datosOperativos.moneda}
                      onChange={(e) => updateConfig('datosOperativos', 'moneda', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="ARS">ARS - Pesos Argentinos</option>
                      <option value="USD">USD - Dólares</option>
                      <option value="EUR">EUR - Euros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Idioma
                    </label>
                    <select
                      value={config.datosOperativos.idioma}
                      onChange={(e) => updateConfig('datosOperativos', 'idioma', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="es-AR">Español (Argentina)</option>
                      <option value="pt-BR">Portugués (Brasil)</option>
                      <option value="en-US">Inglés (EE.UU.)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Zona Horaria
                    </label>
                    <select
                      value={config.datosOperativos.zonaHoraria}
                      onChange={(e) => updateConfig('datosOperativos', 'zonaHoraria', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="America/Argentina/Buenos_Aires">Argentina (GMT-3)</option>
                      <option value="America/Sao_Paulo">Brasil (GMT-3)</option>
                      <option value="America/New_York">EE.UU. (GMT-5)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Formato de Fecha
                    </label>
                    <select
                      value={config.datosOperativos.formatoFecha}
                      onChange={(e) => updateConfig('datosOperativos', 'formatoFecha', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Formato de Hora
                  </label>
                  <select
                    value={config.datosOperativos.formatoHora}
                    onChange={(e) => updateConfig('datosOperativos', 'formatoHora', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="HH:mm">HH:mm (24h)</option>
                    <option value="HH:mm AM/PM">HH:mm AM/PM (12h)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Configuración de Impuestos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Configuración de Impuestos</h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.datosOperativos.impuestosIncluidos}
                      onChange={(e) => updateConfig('datosOperativos', 'impuestosIncluidos', e.target.checked)}
                      className="w-4 h-4 text-accent border-border rounded focus:ring-accent"
                    />
                    <span className="text-sm text-foreground">
                      Precios con impuestos incluidos
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Porcentaje de Impuesto
                  </label>
                  <input
                    type="number"
                    value={config.datosOperativos.porcentajeImpuesto}
                    onChange={(e) => updateConfig('datosOperativos', 'porcentajeImpuesto', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'envio' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Costos de Envío */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Costos de Envío</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Costo Envío Local ($)
                  </label>
                  <input
                    type="number"
                    value={config.datosEnvio.costoEnvioLocal}
                    onChange={(e) => updateConfig('datosEnvio', 'costoEnvioLocal', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Costo Envío Nacional ($)
                  </label>
                  <input
                    type="number"
                    value={config.datosEnvio.costoEnvioNacional}
                    onChange={(e) => updateConfig('datosEnvio', 'costoEnvioNacional', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Envío Gratis a partir de ($)
                  </label>
                  <input
                    type="number"
                    value={config.datosEnvio.envioGratisMinimo}
                    onChange={(e) => updateConfig('datosEnvio', 'envioGratisMinimo', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tiempo de Preparación (hs)
                  </label>
                  <input
                    type="number"
                    value={config.datosEnvio.tiempoPreparacion}
                    onChange={(e) => updateConfig('datosEnvio', 'tiempoPreparacion', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    min="0"
                    max="168"
                  />
                </div>
              </div>
            </div>

            {/* Métodos de Envío */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Métodos de Envío</h3>
              <div className="space-y-4">
                {['Correo Argentino', 'OCA', 'Andreani', 'Retiro en local'].map((metodo) => (
                  <label key={metodo} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.datosEnvio.metodosEnvio.includes(metodo)}
                      onChange={(e) => {
                        const nuevosMetodos = e.target.checked
                          ? [...config.datosEnvio.metodosEnvio, metodo]
                          : config.datosEnvio.metodosEnvio.filter(m => m !== metodo);
                        updateConfig('datosEnvio', 'metodosEnvio', nuevosMetodos);
                      }}
                      className="w-4 h-4 text-accent border-border rounded focus:ring-accent"
                    />
                    <span className="text-sm text-foreground">{metodo}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
