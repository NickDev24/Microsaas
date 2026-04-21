'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface InvoiceData {
  // Datos del Emisor
  emisor: {
    razonSocial: string;
    nombreComercial: string;
    cuit: string;
    condicionIva: 'Responsable Inscripto' | 'Monotributo' | 'Exento' | 'No Inscripto';
    domicilio: {
      calle: string;
      numero: string;
      piso: string;
      departamento: string;
      localidad: string;
      provincia: string;
      codigoPostal: string;
    };
    telefono: string;
    email: string;
    inicioActividades: string;
  };
  
  // Datos del Receptor
  receptor: {
    tipoDocumento: 'DNI' | 'CUIT' | 'LE' | 'LC' | 'PAS';
    numeroDocumento: string;
    razonSocial: string;
    domicilio: {
      calle: string;
      numero: string;
      piso: string;
      departamento: string;
      localidad: string;
      provincia: string;
      codigoPostal: string;
    };
    telefono: string;
    email: string;
    condicionIva: 'Responsable Inscripto' | 'Monotributo' | 'Exento' | 'No Inscripto' | 'Consumidor Final';
  };
  
  // Datos de la Factura
  factura: {
    tipo: 'Factura A' | 'Factura B' | 'Factura C' | 'Factura M' | 'Nota de Crédito' | 'Nota de Débito';
    puntoVenta: string;
    numeroComprobante: string;
    fechaEmision: string;
    fechaVencimiento?: string;
    moneda: 'ARS' | 'USD' | 'EUR';
    cotizacionMoneda?: number;
    condicionVenta: 'Contado' | 'Cuenta Corriente' | 'Tarjeta' | 'Cheque' | 'Otra';
    formaPago: string;
    cae?: string;
    vencimientoCae?: string;
  };
  
  // Items de la Factura
  items: Array<{
    codigo: string;
    descripcion: string;
    cantidad: number;
    unidadMedida: string;
    precioUnitario: number;
    bonificacion: number;
    alicuotaIVA: number;
    subtotal: number;
    iva: number;
    total: number;
  }>;
  
  // Totales
  totales: {
    subtotalNeto: number;
    subtotalNoGravado: number;
    subtotalExento: number;
    subtotalIVA: number;
    totalIVA21: number;
    totalIVA105: number;
    totalIVA0: number;
    totalIVA: number;
    totalImpuestosNacionales: number;
    totalIngresosBrutos: number;
    totalOtrosTributos: number;
    total: number;
  };
  
  // Información Adicional
  informacionAdicional: {
    observaciones: string;
    datosAdicionales: string;
    metodoPago: string;
    numeroTarjeta?: string;
    bancoEmisorCheque?: string;
    numeroCheque?: string;
    fechaCobroCheque?: string;
  };
}

export default function FacturacionPage() {
  const [activeTab, setActiveTab] = useState<'generator' | 'history' | 'settings'>('generator');
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    emisor: {
      razonSocial: 'Micro SaaS Ropa S.A.',
      nombreComercial: 'Micro SaaS Ropa',
      cuit: '30-12345678-9',
      condicionIva: 'Responsable Inscripto',
      domicilio: {
        calle: 'Av. Corrientes',
        numero: '1234',
        piso: '2',
        departamento: 'A',
        localidad: 'Buenos Aires',
        provincia: 'Buenos Aires',
        codigoPostal: 'C1000'
      },
      telefono: '+54 11 1234-5678',
      email: 'facturacion@microsaasropa.com',
      inicioActividades: '01/01/2020'
    },
    receptor: {
      tipoDocumento: 'DNI',
      numeroDocumento: '',
      razonSocial: '',
      domicilio: {
        calle: '',
        numero: '',
        piso: '',
        departamento: '',
        localidad: '',
        provincia: '',
        codigoPostal: ''
      },
      telefono: '',
      email: '',
      condicionIva: 'Consumidor Final'
    },
    factura: {
      tipo: 'Factura B',
      puntoVenta: '0001',
      numeroComprobante: '00000001',
      fechaEmision: new Date().toISOString().split('T')[0],
      moneda: 'ARS',
      cotizacionMoneda: 1,
      condicionVenta: 'Contado',
      formaPago: 'Efectivo'
    },
    items: [],
    totales: {
      subtotalNeto: 0,
      subtotalNoGravado: 0,
      subtotalExento: 0,
      subtotalIVA: 0,
      totalIVA21: 0,
      totalIVA105: 0,
      totalIVA0: 0,
      totalIVA: 0,
      totalImpuestosNacionales: 0,
      totalIngresosBrutos: 0,
      totalOtrosTributos: 0,
      total: 0
    },
    informacionAdicional: {
      observaciones: '',
      datosAdicionales: '',
      metodoPago: 'Efectivo'
    }
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  type InvoiceItem = InvoiceData['items'][number];
  type InvoiceItemField = keyof InvoiceItem;

  type TabId = 'generator' | 'history' | 'settings';
  type CondicionIvaEmisor = InvoiceData['emisor']['condicionIva'];
  type TipoDocumento = InvoiceData['receptor']['tipoDocumento'];
  type TipoFactura = InvoiceData['factura']['tipo'];

  const addItem = () => {
    const newItem = {
      codigo: '',
      descripcion: '',
      cantidad: 1,
      unidadMedida: 'UN',
      precioUnitario: 0,
      bonificacion: 0,
      alicuotaIVA: 21,
      subtotal: 0,
      iva: 0,
      total: 0
    };
    
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (index: number, field: InvoiceItemField, value: InvoiceItem[InvoiceItemField]) => {
    setInvoiceData(prev => {
      const newItems = [...prev.items];
      const item = { ...newItems[index] };
      
      // Actualizar el campo específico
      item[field] = value as never;
      
      // Recalcular totales del item
      const cantidad = item.cantidad || 0;
      const precioUnitario = item.precioUnitario || 0;
      const bonificacion = item.bonificacion || 0;
      const alicuotaIVA = item.alicuotaIVA || 0;
      
      const subtotal = (cantidad * precioUnitario) - bonificacion;
      const iva = subtotal * (alicuotaIVA / 100);
      const total = subtotal + iva;
      
      item.subtotal = subtotal;
      item.iva = iva;
      item.total = total;
      
      newItems[index] = item;
      
      // Recalcular totales generales
      const totals = calculateTotals(newItems);
      
      return {
        ...prev,
        items: newItems,
        totales: totals
      };
    });
  };

  const removeItem = (index: number) => {
    setInvoiceData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const totals = calculateTotals(newItems);
      
      return {
        ...prev,
        items: newItems,
        totales: totals
      };
    });
  };

  const calculateTotals = (items: InvoiceData['items']) => {
    const totals = {
      subtotalNeto: 0,
      subtotalNoGravado: 0,
      subtotalExento: 0,
      subtotalIVA: 0,
      totalIVA21: 0,
      totalIVA105: 0,
      totalIVA0: 0,
      totalIVA: 0,
      totalImpuestosNacionales: 0,
      totalIngresosBrutos: 0,
      totalOtrosTributos: 0,
      total: 0
    };
    
    items.forEach(item => {
      const subtotal = item.subtotal || 0;
      const iva = item.iva || 0;
      const alicuota = item.alicuotaIVA || 0;
      
      if (alicuota === 21) {
        totals.totalIVA21 += iva;
        totals.subtotalNeto += subtotal;
      } else if (alicuota === 10.5) {
        totals.totalIVA105 += iva;
        totals.subtotalNeto += subtotal;
      } else if (alicuota === 0) {
        totals.totalIVA0 += 0;
        totals.subtotalExento += subtotal;
      } else {
        totals.subtotalNoGravado += subtotal;
      }
      
      totals.subtotalIVA += iva;
      totals.total += item.total || 0;
    });
    
    totals.totalIVA = totals.totalIVA21 + totals.totalIVA105 + totals.totalIVA0;
    totals.totalIngresosBrutos = totals.subtotalNeto + totals.subtotalNoGravado;
    
    return totals;
  };

  const generateCAE = async () => {
    setIsGenerating(true);
    try {
      // Simular generación de CAE con AFIP
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular respuesta de AFIP
      const caeResponse = {
        cae: '61223049361725',
        vencimientoCae: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
      setInvoiceData(prev => ({
        ...prev,
        factura: {
          ...prev.factura,
          cae: caeResponse.cae,
          vencimientoCae: caeResponse.vencimientoCae
        }
      }));
      
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating CAE:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    // Simular descarga del PDF
    const invoiceContent = generateInvoiceContent();
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Factura-${invoiceData.factura.numeroComprobante}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateInvoiceContent = () => {
    return `
FACTURA ELECTRÓNICA ${invoiceData.factura.tipo}
===============================================

DATOS DEL EMISOR
-----------------
Razón Social: ${invoiceData.emisor.razonSocial}
Nombre Comercial: ${invoiceData.emisor.nombreComercial}
CUIT: ${invoiceData.emisor.cuit}
Condición IVA: ${invoiceData.emisor.condicionIva}
Domicilio: ${invoiceData.emisor.domicilio.calle} ${invoiceData.emisor.domicilio.numero} ${invoiceData.emisor.domicilio.piso} ${invoiceData.emisor.domicilio.departamento}
Localidad: ${invoiceData.emisor.domicilio.localidad} (${invoiceData.emisor.domicilio.provincia})
Código Postal: ${invoiceData.emisor.domicilio.codigoPostal}
Teléfono: ${invoiceData.emisor.telefono}
Email: ${invoiceData.emisor.email}
Inicio de Actividades: ${invoiceData.emisor.inicioActividades}

DATOS DEL RECEPTOR
-----------------
Tipo Doc: ${invoiceData.receptor.tipoDocumento}
Número: ${invoiceData.receptor.numeroDocumento}
Razón Social: ${invoiceData.receptor.razonSocial}
Condición IVA: ${invoiceData.receptor.condicionIva}
Domicilio: ${invoiceData.receptor.domicilio.calle} ${invoiceData.receptor.domicilio.numero} ${invoiceData.receptor.domicilio.piso} ${invoiceData.receptor.domicilio.departamento}
Localidad: ${invoiceData.receptor.domicilio.localidad} (${invoiceData.receptor.domicilio.provincia})
Código Postal: ${invoiceData.receptor.domicilio.codigoPostal}
Teléfono: ${invoiceData.receptor.telefono}
Email: ${invoiceData.receptor.email}

DATOS DE LA FACTURA
------------------
Tipo: ${invoiceData.factura.tipo}
Punto de Venta: ${invoiceData.factura.puntoVenta}
Número Comprobante: ${invoiceData.factura.numeroComprobante}
Fecha Emisión: ${invoiceData.factura.fechaEmision}
Moneda: ${invoiceData.factura.moneda}
Cotización: ${invoiceData.factura.cotizacionMoneda}
Condición Venta: ${invoiceData.factura.condicionVenta}
Forma de Pago: ${invoiceData.factura.formaPago}
${invoiceData.factura.cae ? `CAE: ${invoiceData.factura.cae}` : ''}
${invoiceData.factura.vencimientoCae ? `Vencimiento CAE: ${invoiceData.factura.vencimientoCae}` : ''}

DETALLE DE ITEMS
---------------
${invoiceData.items.map((item, index) => `
${index + 1}. ${item.descripcion}
   Código: ${item.codigo}
   Cantidad: ${item.cantidad} ${item.unidadMedida}
   Precio Unitario: $${item.precioUnitario.toFixed(2)}
   Bonificación: $${item.bonificacion.toFixed(2)}
   Subtotal: $${item.subtotal.toFixed(2)}
   IVA ${item.alicuotaIVA}%: $${item.iva.toFixed(2)}
   Total: $${item.total.toFixed(2)}
`).join('')}

TOTALES
--------
Subtotal Neto: $${invoiceData.totales.subtotalNeto.toFixed(2)}
Subtotal No Gravado: $${invoiceData.totales.subtotalNoGravado.toFixed(2)}
Subtotal Exento: $${invoiceData.totales.subtotalExento.toFixed(2)}
Subtotal IVA: $${invoiceData.totales.subtotalIVA.toFixed(2)}
IVA 21%: $${invoiceData.totales.totalIVA21.toFixed(2)}
IVA 10.5%: $${invoiceData.totales.totalIVA105.toFixed(2)}
IVA 0%: $${invoiceData.totales.totalIVA0.toFixed(2)}
Total IVA: $${invoiceData.totales.totalIVA.toFixed(2)}
Total Impuestos Nacionales: $${invoiceData.totales.totalImpuestosNacionales.toFixed(2)}
Total Ingresos Brutos: $${invoiceData.totales.totalIngresosBrutos.toFixed(2)}
Total Otros Tributos: $${invoiceData.totales.totalOtrosTributos.toFixed(2)}
TOTAL: $${invoiceData.totales.total.toFixed(2)}

INFORMACIÓN ADICIONAL
-------------------
Observaciones: ${invoiceData.informacionAdicional.observaciones}
Datos Adicionales: ${invoiceData.informacionAdicional.datosAdicionales}
Método de Pago: ${invoiceData.informacionAdicional.metodoPago}

Esta factura electrónica ha sido generada según Resolución General 3670/2012 de AFIP.
    `;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Generador de Facturas</h1>
          <p className="text-muted text-sm">Genera facturas electrónicas legales para Argentina con CAE de AFIP.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info" className="text-xs">
            Cumple RG 3670/2012
          </Badge>
          <Badge variant="success" className="text-xs">
            Certificado AFIP
          </Badge>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {[
            { id: 'generator', label: 'Generador', icon: '🧾' },
            { id: 'history', label: 'Historial', icon: '📋' },
            { id: 'settings', label: 'Configuración', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
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
        {activeTab === 'generator' && (
          <div className="space-y-6">
            {/* Invoice Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Emisor Data */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Datos del Emisor</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Razón Social
                    </label>
                    <input
                      type="text"
                      value={invoiceData.emisor.razonSocial}
                      onChange={(e) => setInvoiceData(prev => ({
                        ...prev,
                        emisor: { ...prev.emisor, razonSocial: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      CUIT
                    </label>
                    <input
                      type="text"
                      value={invoiceData.emisor.cuit}
                      onChange={(e) => setInvoiceData(prev => ({
                        ...prev,
                        emisor: { ...prev.emisor, cuit: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Condición IVA
                    </label>
                    <select
                      value={invoiceData.emisor.condicionIva}
                      onChange={(e) => setInvoiceData(prev => ({
                        ...prev,
                        emisor: { ...prev.emisor, condicionIva: e.target.value as CondicionIvaEmisor }
                      }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="Responsable Inscripto">Responsable Inscripto</option>
                      <option value="Monotributo">Monotributo</option>
                      <option value="Exento">Exento</option>
                      <option value="No Inscripto">No Inscripto</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Receptor Data */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Datos del Receptor</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Tipo Doc.
                      </label>
                      <select
                        value={invoiceData.receptor.tipoDocumento}
                        onChange={(e) => setInvoiceData(prev => ({
                          ...prev,
                          receptor: { ...prev.receptor, tipoDocumento: e.target.value as TipoDocumento }
                        }))}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="DNI">DNI</option>
                        <option value="CUIT">CUIT</option>
                        <option value="LE">LE</option>
                        <option value="LC">LC</option>
                        <option value="PAS">PAS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Número
                      </label>
                      <input
                        type="text"
                        value={invoiceData.receptor.numeroDocumento}
                        onChange={(e) => setInvoiceData(prev => ({
                          ...prev,
                          receptor: { ...prev.receptor, numeroDocumento: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Razón Social
                    </label>
                    <input
                      type="text"
                      value={invoiceData.receptor.razonSocial}
                      onChange={(e) => setInvoiceData(prev => ({
                        ...prev,
                        receptor: { ...prev.receptor, razonSocial: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={invoiceData.receptor.email}
                      onChange={(e) => setInvoiceData(prev => ({
                        ...prev,
                        receptor: { ...prev.receptor, email: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Datos de la Factura</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Tipo
                  </label>
                  <select
                    value={invoiceData.factura.tipo}
                    onChange={(e) => setInvoiceData(prev => ({
                      ...prev,
                      factura: { ...prev.factura, tipo: e.target.value as TipoFactura }
                    }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="Factura A">Factura A</option>
                    <option value="Factura B">Factura B</option>
                    <option value="Factura C">Factura C</option>
                    <option value="Factura M">Factura M</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Punto Venta
                  </label>
                  <input
                    type="text"
                    value={invoiceData.factura.puntoVenta}
                    onChange={(e) => setInvoiceData(prev => ({
                      ...prev,
                      factura: { ...prev.factura, puntoVenta: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Número Comprobante
                  </label>
                  <input
                    type="text"
                    value={invoiceData.factura.numeroComprobante}
                    onChange={(e) => setInvoiceData(prev => ({
                      ...prev,
                      factura: { ...prev.factura, numeroComprobante: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Fecha Emisión
                  </label>
                  <input
                    type="date"
                    value={invoiceData.factura.fechaEmision}
                    onChange={(e) => setInvoiceData(prev => ({
                      ...prev,
                      factura: { ...prev.factura, fechaEmision: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Items de la Factura</h3>
                <Button onClick={addItem} className="bg-green-500 hover:bg-green-600 text-white">
                  + Agregar Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {invoiceData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 lg:grid-cols-8 gap-3 p-4 bg-surface-2 border border-border rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Código
                      </label>
                      <input
                        type="text"
                        value={item.codigo}
                        onChange={(e) => updateItem(index, 'codigo', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-border rounded bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Descripción
                      </label>
                      <input
                        type="text"
                        value={item.descripcion}
                        onChange={(e) => updateItem(index, 'descripcion', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-border rounded bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => updateItem(index, 'cantidad', parseFloat(e.target.value))}
                        className="w-full px-2 py-1 text-sm border border-border rounded bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        min="0.01"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Precio Unitario
                      </label>
                      <input
                        type="number"
                        value={item.precioUnitario}
                        onChange={(e) => updateItem(index, 'precioUnitario', parseFloat(e.target.value))}
                        className="w-full px-2 py-1 text-sm border border-border rounded bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Bonificación
                      </label>
                      <input
                        type="number"
                        value={item.bonificacion}
                        onChange={(e) => updateItem(index, 'bonificacion', parseFloat(e.target.value))}
                        className="w-full px-2 py-1 text-sm border border-border rounded bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        IVA %
                      </label>
                      <select
                        value={item.alicuotaIVA}
                        onChange={(e) => updateItem(index, 'alicuotaIVA', parseFloat(e.target.value))}
                        className="w-full px-2 py-1 text-sm border border-border rounded bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value={21}>21%</option>
                        <option value={10.5}>10.5%</option>
                        <option value={0}>0%</option>
                      </select>
                    </div>
                    <div className="flex items-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Eliminar
                      </Button>
                      <div className="text-sm text-muted-2">
                        Total: ${item.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Section */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Totales</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-2 mb-1">
                    Subtotal Neto
                  </label>
                  <div className="text-lg font-semibold text-foreground">
                    ${invoiceData.totales.subtotalNeto.toFixed(2)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-2 mb-1">
                    Total IVA
                  </label>
                  <div className="text-lg font-semibold text-foreground">
                    ${invoiceData.totales.totalIVA.toFixed(2)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-2 mb-1">
                    Total Impuestos
                  </label>
                  <div className="text-lg font-semibold text-foreground">
                    ${invoiceData.totales.totalImpuestosNacionales.toFixed(2)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-2 mb-1">
                    TOTAL
                  </label>
                  <div className="text-2xl font-bold text-accent">
                    ${invoiceData.totales.total.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Button
                onClick={generateCAE}
                disabled={isGenerating || invoiceData.items.length === 0}
                className="bg-accent hover:bg-accent/90 text-white"
              >
                {isGenerating ? 'Generando CAE...' : 'Generar CAE'}
              </Button>
              
              {invoiceData.factura.cae && (
                <>
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="outline"
                  >
                    {showPreview ? 'Ocultar' : 'Vista Previa'}
                  </Button>
                  <Button
                    onClick={downloadPDF}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Descargar PDF
                  </Button>
                </>
              )}
            </div>

            {/* CAE Info */}
            {invoiceData.factura.cae && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="text-green-600">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 0116 0zm-3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.293a1 1 0 00-1.414 0l-4 4a1 1 0 001.414 1.414l4-4a1 1 0 000 1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-green-800">CAE Generado</div>
                    <div className="text-2xl font-bold text-green-600">{invoiceData.factura.cae}</div>
                    <div className="text-sm text-green-600">Vence: {invoiceData.factura.vencimientoCae}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showPreview && (
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Vista Previa de Factura</h3>
            <pre className="text-xs bg-surface-2 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
              {generateInvoiceContent()}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
