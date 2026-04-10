'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface LegalDocument {
  id: string;
  type: 'privacy_policy' | 'terms_of_service' | 'return_policy' | 'data_usage' | 'shipping_policy' | 'warranty_policy';
  title: string;
  content: string;
  isActive: boolean;
  version: number;
  lastUpdated: string;
  requiredByLaw: boolean;
}

export default function LegalesPage() {
  const [activeTab, setActiveTab] = useState<'documents' | 'templates' | 'compliance'>('documents');
  const [documents, setDocuments] = useState<LegalDocument[]>([
    {
      id: '1',
      type: 'privacy_policy',
      title: 'Política de Privacidad',
      content: `# Política de Privacidad

## Información que Recopilamos

Recopilamos la siguiente información personal cuando usted utiliza nuestro sitio web:

1. **Información de Identificación**: Nombre, apellido, dirección de correo electrónico, número de teléfono.
2. **Información de Envío**: Dirección de envío, datos de facturación.
3. **Información de Pago**: Datos de tarjeta de crédito/débito (procesados de forma segura).
4. **Información de Navegación**: Dirección IP, tipo de navegador, tiempo de acceso.

## Uso de la Información

Utilizamos su información personal para:

- Procesar y completar sus pedidos
- Comunicarnos con usted sobre su pedido
- Mejorar nuestros productos y servicios
- Enviarle correos electrónicos de marketing (con su consentimiento)
- Cumplir con obligaciones legales

## Compartición de Información

No vendemos, intercambiamos ni transferimos su información personal a terceros, excepto:

- Proveedores de servicios de pago para procesar transacciones
- Empresas de envío para entregar sus pedidos
- Autoridades gubernamentales cuando sea requerido por ley

## Seguridad de Datos

Implementamos medidas de seguridad adecuadas para proteger su información:

- Encriptación SSL en todas las transmisiones
- Almacenamiento seguro en servidores protegidos
- Acceso restringido a la información personal
- Cumplimiento con la Ley de Protección de Datos Personales N° 25.326

## Sus Derechos

Usted tiene derecho a:

- Acceder a su información personal
- Corregir información inexacta
- Eliminar su información personal
- Oponerse al procesamiento de sus datos
- Retirar el consentimiento para marketing

## Contacto

Para consultas sobre privacidad, contáctenos en:
- Email: privacidad@microsaasropa.com
- Teléfono: +54 11 1234-5678

Última actualización: ${new Date().toLocaleDateString('es-AR')}`,
      isActive: true,
      version: 1,
      lastUpdated: new Date().toISOString(),
      requiredByLaw: true
    },
    {
      id: '2',
      type: 'terms_of_service',
      title: 'Términos y Condiciones',
      content: `# Términos y Condiciones de Servicio

## Aceptación de los Términos

Al acceder y utilizar microsaasropa.com, usted acepta y se obliga por estos Términos y Condiciones.

## Descripción del Servicio

Micro SaaS Ropa es una plataforma de comercio electrónico que vende ropa y accesorios a través de internet.

## Registro del Usuario

Para utilizar nuestros servicios, usted debe:

- Ser mayor de 18 años
- Proporcionar información veraz y completa
- Crear una cuenta segura
- Aceptar estos términos y condiciones

## Productos y Precios

- Todos los precios están expresados en pesos argentinos (ARS)
- Los precios incluyen IVA según legislación vigente
- Nos reservamos el derecho de modificar precios sin previo aviso
- Las fotografías son ilustrativas y pueden variar ligeramente

## Proceso de Compra

1. **Selección**: Elige los productos deseados
2. **Carrito**: Agrega productos al carrito de compras
3. **Checkout**: Completa información de envío y pago
4. **Confirmación**: Recibe correo electrónico de confirmación
5. **Envío**: Prepara y envía su pedido

## Formas de Pago

Aceptamos las siguientes formas de pago:

- Tarjetas de crédito/débito (Visa, Mastercard, American Express)
- Transferencia bancaria
- Mercado Pago
- Efectivo (solo para retiro en local)

## Envío y Entrega

- Realizamos envíos a todo el territorio argentino
- Tiempos de entrega estimados: 2-5 días hábiles (CABA) / 3-7 días hábiles (resto del país)
- Seguimiento de envío disponible
- Costos de envío calculados al momento del checkout

## Política de Devoluciones

- Devoluciones aceptadas dentro de los 30 días posteriores a la compra
- Productos deben estar en condiciones originales
- Etiquetas y embalaje original deben estar intactos
- Los costos de envío de devolución corren por cuenta del cliente

## Propiedad Intelectual

Todo el contenido del sitio web (diseño, textos, imágenes, logos) es propiedad de Micro SaaS Ropa y está protegido por leyes de propiedad intelectual.

## Limitación de Responsabilidad

No somos responsables por:

- Daños indirectos o consecuentes
- Pérdidas de datos
- Interrupciones del servicio
- Contenido de sitios web enlazados

## Modificaciones

Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigencia desde su publicación en el sitio web.

## Ley Aplicable

Estos términos se rigen por las leyes de la República Argentina.

Última actualización: ${new Date().toLocaleDateString('es-AR')}`,
      isActive: true,
      version: 1,
      lastUpdated: new Date().toISOString(),
      requiredByLaw: true
    },
    {
      id: '3',
      type: 'return_policy',
      title: 'Política de Devolución',
      content: `# Política de Devolución y Cambio

## Plazo de Devolución

Usted tiene un plazo de **30 días corridos** desde la fecha de recepción del producto para solicitar una devolución o cambio, según lo establecido por el Código Civil y Comercial de la Nación.

## Productos Elegibles para Devolución

Pueden ser devueltos:

- Productos en perfectas condiciones
- Con etiquetas originales
- En su embalaje original
- Con ticket o comprobante de compra

**No se aceptan devoluciones de:**

- Productos de venta por liquidación
- Ropa interior por razones de higiene
- Productos personalizados
- Productos dañados por mal uso

## Proceso de Devolución

1. **Contacto**: Envíe un email a devoluciones@microsaasropa.com
2. **Autorización**: Espere nuestra autorización de devolución
3. **Envío**: Devuelva el producto siguiendo nuestras instrucciones
4. **Reembolso**: Procesaremos el reembolso dentro de 5-10 días hábiles

## Costos de Devolución

- **Devoluciones por cambio**: Sin costo
- **Devoluciones por arrepentimiento**: El cliente cubre el costo de envío
- **Productos defectuosos**: Nos hacemos cargo del envío de devolución

## Formas de Reembolso

- **Reembolso Completo**: Devolución del dinero al medio de pago original
- **Crédito de Tienda**: Crédito para futuras compras (con 10% de bonificación)
- **Cambio**: Cambio por otro producto de igual o mayor valor

## Productos Defectuosos

Si recibe un producto defectuoso:

- Notifíquenos inmediatamente
- Ofrecemos reparación, cambio o reembolso
- Los costos son cubiertos por Micro SaaS Ropa
- Plazo de garantía: 90 días por defectos de fabricación

## Dirección de Devolución

Una vez autorizada, envíe los productos a:

Micro SaaS Ropa - Depto. Devoluciones
Av. Corrientes 1234, Piso 2
C1000 CABA, Argentina

## Contacto

Para consultas sobre devoluciones:
- Email: devoluciones@microsaasropa.com
- WhatsApp: +54 9 1234-5678
- Teléfono: +54 11 1234-5678 (Lun-Vie 9-18hs)

Última actualización: ${new Date().toLocaleDateString('es-AR')}`,
      isActive: true,
      version: 1,
      lastUpdated: new Date().toISOString(),
      requiredByLaw: true
    },
    {
      id: '4',
      type: 'data_usage',
      title: 'Uso de Datos Personales',
      content: `# Uso de Datos Personales

## Base Legal

Nuestro tratamiento de datos personales se rige por:

- Ley 25.326 de Protección de Datos Personales
- Decreto Reglamentario 1558/2019
- Resolución 47/2018 de la AAIP
- RG 3670/2019 de AFIP

## Datos Personales que Tratamos

### Datos de Identificación
- Nombre y apellido
- Documento (DNI/LE/LC/Pasaporte)
- CUIT/CUIL
- Fecha de nacimiento
- Nacionalidad

### Datos de Contacto
- Dirección postal
- Teléfono fijo y móvil
- Correo electrónico
- Redes sociales (si proporciona)

### Datos Comerciales
- Historial de compras
- Preferencias de productos
- Datos de facturación
- Métodos de pago utilizados

### Datos de Navegación
- Dirección IP
- Tipo y versión de navegador
- Sistema operativo
- Dispositivo utilizado
- Cookies y datos de navegación

## Finalidad del Tratamiento

Tratamos sus datos personales para:

1. **Ejecución del Contrato**: Procesar sus pedidos y facturas
2. **Gestión Comercial**: Enviarle ofertas y promociones personalizadas
3. **Mejora del Servicio**: Analizar patrones para mejorar nuestra plataforma
4. **Cumplimiento Legal**: Cumplir con obligaciones fiscales y legales
5. **Seguridad**: Prevenir fraudes y proteger su cuenta

## Plazos de Conservación

- **Datos de clientes**: 5 años desde la última compra (Ley 25.326)
- **Datos de navegación**: 6 meses (RG 3670/2019)
- **Datos de facturación**: 10 años (Ley 11.683)
- **Datos de empleados**: 15 años post-cese (Ley 24.013)

## Derechos del Titular

Como titular de los datos, usted tiene derecho a:

1. **Acceso**: Solicitar acceso a sus datos personales
2. **Rectificación**: Corregir datos inexactos o incompletos
3. **Supresión**: Solicitar la eliminación de sus datos
4. **Oposición**: Oponerse al tratamiento de sus datos
5. **Portabilidad**: Transferir sus datos a otro responsable
6. **Revocación**: Retirar el consentimiento en cualquier momento

## Seguridad de los Datos

Implementamos medidas técnicas y organizativas:

- **Encriptación**: Todos los datos transmitidos están encriptados (SSL/TLS)
- **Control de Acceso**: Autenticación multifactor y registros de acceso
- **Análisis de Riesgos**: Evaluación periódica de vulnerabilidades
- **Respuesta a Incidentes**: Procedimientos para notificar brechas de seguridad

## Transferencias Internacionales

No realizamos transferencias internacionales de datos personales, excepto:

- Con su consentimiento explícito
- A proveedores de servicios internacionales con protección equivalente
- Cuando sea necesario para la ejecución del contrato

## Marketing y Publicidad

Solo enviamos comunicaciones comerciales con:

- **Consentimiento previo**: Su autorización explícita
- **Facilidad de baja**: Opción simple para darse de baja
- **Segmentación**: Comunicaciones relevantes a sus intereses
- **Respeto horarios**: Envíos entre 9:00 y 18:00hs

## Datos de Menores

No recopilamos datos de menores de 18 años sin:

- Consentimiento expreso de los padres/tutores
- Verificación de edad
- Limitación al mínimo necesario

## Contacto DPD (Delegado de Protección de Datos)

Nuestro Delegado de Protección de Datos:

**Nombre**: Dr. Juan Pérez
**Email**: dpd@microsaasropa.com
**Teléfono**: +54 11 1234-5678
**Domicilio**: Av. Corrientes 1234, C1000 CABA

## Procedimientos para Ejercer Derechos

Para ejercer sus derechos:

1. **Solicitud escrita**: Email o carta firmada
2. **Identificación**: Acreditación de identidad
3. **Respuesta**: Dentro de los 10 días hábiles
4. **Gratuidad**: Sin costo para ejercer sus derechos

## Actualizaciones

Cualquier modificación a nuestras políticas de privacidad será comunicada:

- Con 30 días de antelación
- Por email y sitio web
- Con explicación clara de los cambios

Última actualización: ${new Date().toLocaleDateString('es-AR')}`,
      isActive: true,
      version: 1,
      lastUpdated: new Date().toISOString(),
      requiredByLaw: true
    }
  ]);

  const [editingDocument, setEditingDocument] = useState<LegalDocument | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!editingDocument) return;
    
    setIsLoading(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Actualizar documento en la lista
      setDocuments(prev => prev.map(doc => 
        doc.id === editingDocument.id 
          ? { ...editingDocument, lastUpdated: new Date().toISOString() }
          : doc
      ));
      
      setEditingDocument(null);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (document: LegalDocument) => {
    setEditingDocument(document);
    setHasChanges(true);
  };

  const handlePublish = async (document: LegalDocument) => {
    setIsLoading(true);
    try {
      // Simular publicación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDocuments(prev => prev.map(doc => 
        doc.id === document.id 
          ? { ...doc, isActive: true, lastUpdated: new Date().toISOString() }
          : doc
      ));
    } catch (error) {
      console.error('Error publishing document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels = {
      privacy_policy: 'Política de Privacidad',
      terms_of_service: 'Términos y Condiciones',
      return_policy: 'Política de Devolución',
      data_usage: 'Uso de Datos Personales',
      shipping_policy: 'Política de Envío',
      warranty_policy: 'Garantía'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const tabs: Array<{ id: 'documents' | 'templates' | 'compliance'; label: string; icon: string }> = [
    { id: 'documents', label: 'Documentos', icon: '📄' },
    { id: 'templates', label: 'Plantillas', icon: '📋' },
    { id: 'compliance', label: 'Cumplimiento', icon: '✅' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Documentos Legales</h1>
          <p className="text-muted text-sm">Gestiona los documentos legales y de cumplimiento normativo.</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="warning" className="animate-pulse">
              Hay cambios sin guardar
            </Badge>
          )}
          <Button
            onClick={handleSave}
            disabled={isLoading || !hasChanges || !editingDocument}
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
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Documents List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {documents.map((document) => (
                <div key={document.id} className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {document.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-2">
                        <span>Versión {document.version}</span>
                        <span>•</span>
                        <span>Actualizado: {new Date(document.lastUpdated).toLocaleDateString('es-AR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {document.requiredByLaw && (
                        <Badge variant="warning" className="text-xs">
                          Requerido por ley
                        </Badge>
                      )}
                      <Badge variant={document.isActive ? 'success' : 'default'} className="text-xs">
                        {document.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(document)}
                        className="flex-1"
                      >
                        Editar
                      </Button>
                      <Button
                        variant={document.isActive ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => handlePublish(document)}
                        disabled={document.isActive}
                        className="flex-1"
                      >
                        {document.isActive ? 'Publicado' : 'Publicar'}
                      </Button>
                    </div>
                    
                    {editingDocument?.id === document.id && (
                      <div className="mt-4 p-4 bg-surface-2 rounded-lg">
                        <h4 className="text-md font-medium text-foreground mb-3">Editar Documento</h4>
                        <textarea
                          value={editingDocument.content}
                          onChange={(e) => setEditingDocument({ ...editingDocument, content: e.target.value })}
                          rows={15}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none text-sm font-mono"
                        />
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingDocument(null)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="bg-accent hover:bg-accent/90 text-white"
                          >
                            {isLoading ? 'Guardando...' : 'Guardar'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Plantillas Legales</h3>
              <p className="text-sm text-muted-2 mb-6">
                Plantillas predefinidas para documentos legales según normativa argentina.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                  { title: 'Términos y Condiciones E-commerce', description: 'Plantilla completa para comercio electrónico' },
                  { title: 'Política de Privacidad', description: 'Cumplimiento Ley 25.326' },
                  { title: 'Política de Devolución', description: 'Según Código Civil y Comercial' },
                  { title: 'Términos de Uso', description: 'Para sitios web y aplicaciones' }
                ].map((template, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer">
                    <h4 className="text-md font-medium text-foreground mb-2">{template.title}</h4>
                    <p className="text-sm text-muted-2">{template.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Legal Requirements */}
              <div className="bg-surface border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Requisitos Legales</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Ley 25.326', status: 'Cumplido', description: 'Protección de Datos Personales' },
                    { label: 'RG 3670/2019', status: 'Cumplido', description: 'Conservación de Datos' },
                    { label: 'Ley 24.240', status: 'Cumplido', description: 'Defensa del Consumidor' },
                    { label: 'Ley de E-commerce', status: 'En proceso', description: 'Información al consumidor' }
                  ].map((req, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{req.label}</div>
                        <div className="text-xs text-muted-2">{req.description}</div>
                      </div>
                      <Badge 
                        variant={req.status === 'Cumplido' ? 'success' : req.status === 'En proceso' ? 'warning' : 'error'}
                        className="text-xs"
                      >
                        {req.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Checklist */}
              <div className="bg-surface border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Checklist de Cumplimiento</h3>
                <div className="space-y-3">
                  {[
                    { item: 'Defensor del Consumidor', checked: true },
                    { item: 'Botón de arrepentimiento', checked: true },
                    { item: 'Información fiscal', checked: true },
                    { item: 'Términos y condiciones', checked: true },
                    { item: 'Política de privacidad', checked: true },
                    { item: 'Medios de contacto', checked: true },
                    { item: 'Libro de quejas', checked: false },
                    { item: 'Auditoría anual', checked: false }
                  ].map((item, index) => (
                    <label key={index} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        className="w-4 h-4 text-accent border-border rounded focus:ring-accent"
                        readOnly
                      />
                      <span className="text-sm text-foreground">{item.item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
