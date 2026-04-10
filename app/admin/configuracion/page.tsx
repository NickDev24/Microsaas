'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface ConfigData {
  footer: {
    company: string;
    address: string;
    phone: string;
    email: string;
    socialLinks: {
      facebook: string;
      instagram: string;
      twitter: string;
      whatsapp: string;
    };
  };
  legales: {
    privacyPolicy: string;
    termsOfService: string;
    returnPolicy: string;
    dataUsage: string;
  };
  facturacion: {
    empresa: string;
    cuit: string;
    iva: string;
    direccion: string;
    telefono: string;
    email: string;
    ivaInscripto: boolean;
  };
}

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<'footer' | 'legales' | 'facturacion'>('footer');
  const [config, setConfig] = useState<ConfigData>({
    footer: {
      company: 'Micro SaaS Ropa',
      address: 'Av. Principal 123, Ciudad',
      phone: '+54 11 1234-5678',
      email: 'contacto@microsaasropa.com',
      socialLinks: {
        facebook: 'https://facebook.com/microsaasropa',
        instagram: 'https://instagram.com/microsaasropa',
        twitter: 'https://twitter.com/microsaasropa',
        whatsapp: '+5491112345678'
      }
    },
    legales: {
      privacyPolicy: '',
      termsOfService: '',
      returnPolicy: '',
      dataUsage: ''
    },
    facturacion: {
      empresa: '',
      cuit: '',
      iva: 'Responsable Inscripto',
      direccion: '',
      telefono: '',
      email: '',
      ivaInscripto: true
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1500));
      setHasChanges(false);
      // Mostrar mensaje de éxito
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (section: keyof ConfigData, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const updateNestedConfig = (section: keyof ConfigData, nestedField: string, field: string, value: any) => {
    if (section !== 'footer' || nestedField !== 'socialLinks') return;
    setConfig(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        socialLinks: {
          ...prev.footer.socialLinks,
          [field as keyof ConfigData['footer']['socialLinks']]: value as string,
        },
      },
    }));
    setHasChanges(true);
  };

  const tabs: Array<{ id: 'footer' | 'legales' | 'facturacion'; label: string; icon: string }> = [
    { id: 'footer', label: 'Footer y Contacto', icon: '📞' },
    { id: 'legales', label: 'Legales', icon: '⚖️' },
    { id: 'facturacion', label: 'Facturación', icon: '🧾' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Configuración</h1>
          <p className="text-muted text-sm">Gestiona la configuración general de tu tienda.</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <div className="animate-pulse">
              <Badge variant="warning">Hay cambios sin guardar</Badge>
            </div>
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
        {activeTab === 'footer' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información de la Empresa */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Información de la Empresa</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre de la Empresa
                  </label>
                  <input
                    type="text"
                    value={config.footer.company}
                    onChange={(e) => updateConfig('footer', 'company', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={config.footer.address}
                    onChange={(e) => updateConfig('footer', 'address', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={config.footer.phone}
                    onChange={(e) => updateConfig('footer', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    value={config.footer.email}
                    onChange={(e) => updateConfig('footer', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Redes Sociales</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={config.footer.socialLinks.facebook}
                    onChange={(e) => updateNestedConfig('footer', 'socialLinks', 'facebook', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={config.footer.socialLinks.instagram}
                    onChange={(e) => updateNestedConfig('footer', 'socialLinks', 'instagram', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={config.footer.socialLinks.twitter}
                    onChange={(e) => updateNestedConfig('footer', 'socialLinks', 'twitter', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={config.footer.socialLinks.whatsapp}
                    onChange={(e) => updateNestedConfig('footer', 'socialLinks', 'whatsapp', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'legales' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Documentación Legal</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                { key: 'privacyPolicy', label: 'Política de Privacidad', icon: '🔒' },
                { key: 'termsOfService', label: 'Términos de Servicio', icon: '📋' },
                { key: 'returnPolicy', label: 'Política de Devolución', icon: '↩️' },
                { key: 'dataUsage', label: 'Uso de Datos', icon: '📊' }
              ].map((doc) => (
                <div key={doc.key} className="space-y-2">
                  <label className="block text-sm font-medium text-foreground flex items-center gap-2">
                    <span>{doc.icon}</span>
                    {doc.label}
                  </label>
                  <textarea
                    value={config.legales[doc.key as keyof typeof config.legales]}
                    onChange={(e) => updateConfig('legales', doc.key, e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    placeholder={`Escribe el contenido de ${doc.label.toLowerCase()}...`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'facturacion' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Configuración de Facturación</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Datos Fiscales */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-foreground">Datos Fiscales</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Razón Social
                    </label>
                    <input
                      type="text"
                      value={config.facturacion.empresa}
                      onChange={(e) => updateConfig('facturacion', 'empresa', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      CUIT
                    </label>
                    <input
                      type="text"
                      value={config.facturacion.cuit}
                      onChange={(e) => updateConfig('facturacion', 'cuit', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Condición IVA
                    </label>
                    <select
                      value={config.facturacion.iva}
                      onChange={(e) => updateConfig('facturacion', 'iva', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="Responsable Inscripto">Responsable Inscripto</option>
                      <option value="Monotributo">Monotributo</option>
                      <option value="Exento">Exento</option>
                      <option value="Consumidor Final">Consumidor Final</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contacto Fiscal */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-foreground">Contacto Fiscal</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Dirección Fiscal
                    </label>
                    <input
                      type="text"
                      value={config.facturacion.direccion}
                      onChange={(e) => updateConfig('facturacion', 'direccion', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Teléfono Fiscal
                    </label>
                    <input
                      type="tel"
                      value={config.facturacion.telefono}
                      onChange={(e) => updateConfig('facturacion', 'telefono', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Fiscal
                    </label>
                    <input
                      type="email"
                      value={config.facturacion.email}
                      onChange={(e) => updateConfig('facturacion', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Generador de Facturas */}
            <div className="mt-8 p-6 bg-surface-2 border border-border rounded-xl">
              <h4 className="text-md font-medium text-foreground mb-4">Generador de Facturas</h4>
              <p className="text-sm text-muted-2 mb-4">
                Configura los datos para generar facturas automáticamente cuando se realicen ventas.
              </p>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.facturacion.ivaInscripto}
                    onChange={(e) => updateConfig('facturacion', 'ivaInscripto', e.target.checked)}
                    className="w-4 h-4 text-accent border-border rounded focus:ring-accent"
                  />
                  <span className="text-sm text-foreground">
                    Habilitar generación automática de facturas
                  </span>
                </label>
                <Button
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent hover:text-white"
                >
                  Configurar Plantilla
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
