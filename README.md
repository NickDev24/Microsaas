# ModaShop Argentina - Micro-SaaS E-commerce Seguro

Sistema de e-commerce de ropa y accesorios construido con Next.js 16, Supabase, y tecnología moderna. **Versión auditada y segura** - autenticación con bcrypt, JWT, y webhooks con firma HMAC.

## 🚀 Estado del Proyecto

✅ **AUDITADO Y SEGURO** - Última revisión: Marzo 2026

### Cambios de Seguridad Implementados

- ✅ Autenticación real con bcrypt contra base de datos
- ✅ Roles unificados: `admin_basico` y `super_admin`
- ✅ Webhooks con firma HMAC-SHA256
- ✅ Variables de entorno eliminadas del repositorio
- ✅ Tests de autenticación agregados
- ✅ Schema SQL consolidado y documentado

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Frontend**: Next.js 16 (App Router) + TypeScript 5
- **Backend**: API Routes de Next.js
- **Base de Datos**: Supabase (PostgreSQL)
- **Storage**: Cloudinary para imágenes
- **Autenticación**: JWT + bcrypt (12 rounds)
- **Estilos**: Tailwind CSS 4 + CSS Variables
- **Animaciones**: Framer Motion
- **Webhooks**: Integración con N8N (HMAC-SHA256)
- **Testing**: Vitest
- **Estado**: Zustand

### Flujo de Arquitectura
```
Frontend Público → Supabase (lectura directa con RLS)
Panel Admin → API Routes → Supabase → Webhooks → N8N
Middleware → Validación JWT + bcrypt → Control de Acceso
```

## 📁 Estructura del Proyecto

```
microsaas-ropa/
├── app/
│   ├── (public)/                     # Rutas públicas
│   │   ├── layout.tsx               # Layout público (navbar, footer)
│   │   ├── page.tsx                # Home / Vidriera
│   │   ├── catalogo/               # Catálogo de productos
│   │   ├── producto/[id]/          # Detalle de producto
│   │   ├── promociones/            # Página de promociones
│   │   ├── edicion-limitada/        # Ediciones limitadas
│   │   ├── descuentos/             # Descuentos de temporada
│   │   ├── contacto/               # Contacto
│   │   └── legales/               # Documentos legales
│   │       ├── terminos-y-condiciones/
│   │       ├── politica-de-privacidad/
│   │       ├── politica-de-devoluciones/
│   │       └── politica-de-envios/
│   ├── admin/                     # Panel de administración
│   │   ├── layout.tsx              # Layout admin (sidebar, topbar)
│   │   ├── login/                  # Login admin
│   │   ├── dashboard/              # Dashboard principal
│   │   ├── overview/               # Vista general
│   │   ├── productos/              # CRUD productos
│   │   ├── categorias/             # CRUD categorías
│   │   ├── pedidos/               # Gestión de pedidos
│   │   ├── ventas/                # Gestión de ventas
│   │   ├── usuarios/              # Gestión de usuarios
│   │   ├── roles/                 # Gestión de roles y permisos
│   │   ├── webhooks/              # Configuración de webhooks
│   │   ├── stock-bajo/            # Alertas de stock bajo
│   │   ├── configuracion/          # Configuración del sistema
│   │   ├── local/                 # Datos del local
│   │   └── legales/              # Documentos legales
│   └── api/                      # API Routes
│       ├── auth/                   # Autenticación
│       ├── dashboard/              # Métricas del dashboard
│       ├── overview/               # Datos de overview
│       ├── products/               # Productos CRUD
│       ├── categories/             # Categorías CRUD
│       ├── orders/                 # Pedidos CRUD
│       ├── sales/                  # Ventas CRUD
│       ├── customers/              # Clientes
│       ├── users/                  # Usuarios
│       ├── roles/                  # Roles y permisos
│       ├── webhooks/               # Webhooks
│       └── upload/                # Cloudinary upload
├── components/
│   ├── public/                    # Componentes frontend público
│   │   ├── Navbar.tsx            # Navegación principal
│   │   ├── Footer.tsx            # Footer con enlaces legales
│   │   ├── ProductCard.tsx        # Card de producto
│   │   ├── Cart.tsx               # Carrito de compras
│   │   └── BottomNav.tsx          # Navegación móvil
│   ├── admin/                     # Componentes panel admin
│   │   ├── AdminLayout.tsx        # Layout con sidebar
│   │   ├── Topbar.tsx            # Barra superior
│   │   ├── Sidebar.tsx           # Menú lateral
│   │   ├── KPICard.tsx           # Cards de métricas
│   │   ├── DataTable.tsx          # Tablas de datos
│   │   ├── FormModal.tsx          # Modales de formulario
│   │   └── Chart.tsx             # Gráficos
│   └── ui/                       # Componentes UI reutilizables
│       ├── Button.tsx             # Botones
│       ├── Input.tsx              # Inputs
│       ├── Modal.tsx              # Modales
│       ├── Badge.tsx              # Badges
│       ├── ThemeToggle.tsx        # Toggle tema
│       └── PageTransition.tsx     # Transiciones
├── lib/
│   ├── supabase.ts               # Cliente Supabase
│   ├── cloudinary.ts             # Config Cloudinary
│   ├── jwt.ts                   # Utilidades JWT
│   ├── store.ts                 # Estado global
│   └── constants.ts             # Constantes
├── types/
│   └── index.ts                 # Tipos TypeScript
├── public/                     # Archivos estáticos
├── .env                        # Variables de entorno
├── database-schema.sql          # Schema principal
├── database-schema-completo.sql # Schema completo con tablas faltantes
├── middleware.ts               # Middleware de autenticación
└── README.md                   # Este archivo
```

## 🎨 Sistema de Diseño

### Tema Global
- **Modos**: Light/Dark con persistencia en localStorage
- **Tokens CSS**: Variables personalizadas en `globals.css`
- **Colores**: 
  - Primary: Naranja (#fb923c)
  - Background: Negro profundo (#0a0a0a)
  - Surface: Gris oscuro (#1a1a1a)
  - Acentos: Gradientes naranja/púrpura/rosa

### Componentes UI
- **Buttons**: 3 variantes (primary, secondary, ghost)
- **Cards**: Con hover effects y glow
- **Modals**: Overlays con backdrop blur
- **Charts**: SVG puro, responsive
- **Tables**: Paginación, filtros, ordenamiento

## 🗄️ Base de Datos

### Tablas Principales
```sql
-- Usuarios y Roles
users                    -- Usuarios del sistema
roles                   -- Roles con permisos
customers               -- Clientes del e-commerce

-- Catálogo
categories              -- Categorías de productos
products               -- Productos
product_images         -- Imágenes de productos

-- Ventas y Pedidos
orders                 -- Pedidos de clientes
order_items            -- Items de pedidos
sales                  -- Ventas registradas
sale_items             -- Items de ventas
invoices               -- Facturas

-- Promociones
promotions             -- Promociones generales
seasonal_discounts     -- Descuentos estacionales
limited_editions       -- Ediciones limitadas

-- Sistema
webhooks               -- Configuración webhooks
webhook_logs          -- Logs de ejecución
system_settings        -- Configuración del sistema
local_config          -- Datos del local
legal_documents       -- Documentos legales
visits                -- Visitas para analytics
search_events          -- Eventos de búsqueda
```

### Relaciones Clave
- `users` → `orders` (crea pedidos)
- `users` → `sales` (registra ventas)
- `categories` → `products` (contiene productos)
- `products` → `product_images` (tiene imágenes)
- `orders` → `order_items` (contiene items)
- `sales` → `sale_items` (contiene items)
- `sales` → `invoices` (genera facturas)

## 🚀 Panel Administrativo

### Dashboard Principal
- **6 KPI Cards**: Ventas, ingresos, pedidos, conversión, ticket promedio, stock crítico
- **4 Gráficos**: Ventas por mes, comparación por canal, rendimiento por producto, embudo de conversión
- **Widgets Inteligentes**: Termómetro del mes, dispositivos, keywords, categorías top
- **Actividad en Tiempo Real**: Feed de eventos del sistema

### Secciones del Admin
1. **Navegación**: Dashboard, Overview
2. **Ventas**: Ventas, Pedidos, Facturación
3. **Catálogo**: Productos, Categorías, Promociones, Ediciones Limitadas, Descuentos
4. **Operaciones**: Stock Bajo, Webhooks
5. **Usuarios**: Usuarios, Roles
6. **Configuración**: Configuración, Datos del Local, Documentos Legales

### API Endpoints
```
/api/dashboard          # Métricas del dashboard
/api/overview           # Datos de overview
/api/products           # CRUD productos
/api/categories         # CRUD categorías
/api/orders             # CRUD pedidos
/api/sales              # CRUD ventas
/api/customers          # Clientes
/api/users              # Usuarios
/api/roles              # Roles y permisos
/api/webhooks           # Webhooks
/api/upload             # Cloudinary upload
```

## 🔐 Seguridad y Autenticación

### JWT Implementation
- **Middleware**: Validación de tokens en cada request
- **Roles**: admin, manager, employee con permisos granulares
- **Row Level Security**: Políticas de seguridad a nivel de fila en Supabase
- **Session Management**: Tokens refresh y logout seguro

### Permisos por Rol
- **Admin**: Acceso completo a todas las funciones
- **Manager**: Gestión de productos, pedidos, ventas
- **Employee**: Solo lectura y operaciones básicas

## 📊 Analytics y Métricas

### Datos en Tiempo Real
- **Ventas**: Por día, semana, mes con tendencias
- **Productos**: Más vendidos, stock bajo, rendimiento
- **Clientes**: Nuevos, activos, conversión
- **Tráfico**: Dispositivos, keywords, páginas vistas

### Reportes
- **Ventas**: Consolidado diario con totales
- **Inventario**: Niveles de stock y alertas
- **Clientes**: Historial y comportamiento
- **Financiero**: Ingresos, facturación, impuestos

## 🛒 E-commerce Features

### Catálogo de Productos
- **Categorías**: Organización jerárquica
- **Productos**: Detalles completos con múltiples imágenes
- **Variantes**: Tallas, colores, materiales
- **Stock**: Control con alertas de bajo stock
- **Precios**: Precio normal, precio comparativo, descuentos

### Gestión de Pedidos
- **Estados**: Pendiente, confirmado, enviado, entregado, cancelado
- **Notificaciones**: Email/SMS para actualizaciones
- **Integración**: Con servicios de mensajería
- **Facturación**: Generación automática de facturas

### Promociones
- **Descuentos**: Porcentuales y fijos
- **Temporadas**: Promociones estacionales
- **Ediciones Limitadas**: Productos exclusivos
- **Segmentación**: Por categorías, productos, clientes

## 📱 Frontend Público

### Páginas Principales
- **Home**: Vidriera con productos destacados
- **Catálogo**: Listado con filtros y búsqueda
- **Producto**: Detalle completo con galería
- **Carrito**: Gestión de items y checkout
- **Contacto**: Formulario de contacto
- **Legales**: Términos, privacidad, devoluciones

### Features
- **Responsive**: Mobile-first design
- **Búsqueda**: Instantánea con sugerencias
- **Filtros**: Por categoría, precio, talle, color
- **Wishlist**: Guardar productos favoritos
- **Reviews**: Calificaciones y reseñas

## 🔄 Integraciones

### Webhooks
- **Eventos**: Creación/actualización de productos, pedidos, ventas
- **Destino**: N8N para automatizaciones
- **Retries**: Configurable con backoff exponencial
- **Logs**: Registro completo de ejecuciones

### Cloudinary
- **Upload**: Directo desde el admin
- **Optimización**: Auto-optimización de imágenes
- **Transformaciones**: Resize, crop, format conversion
- **CDN**: Entrega rápida global

## 🚀 Deployment

### Variables de Entorno
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=

# Webhooks
WEBHOOK_SECRET=
WEBHOOK_URL=
```

### Build y Deploy
```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start
```

## 📈 Monitoreo y Analytics

### Métricas del Sistema
- **Performance**: Tiempo de carga, Core Web Vitals
- **Errores**: Rate de errores, logs detallados
- **Usuarios**: Sesiones, páginas vistas, conversiones
- **Negocio**: Ventas, ingresos, crecimiento

### Alertas
- **Stock Bajo**: Notificación automática
- **Errores**: Email de errores críticos
- **Performance**: Alertas de lentitud
- **Seguridad**: Intentos de acceso fallidos

## 🧰 Testing

### Estrategia de Testing
- **Unit Tests**: Componentes y utilidades
- **Integration Tests**: API endpoints
- **E2E Tests**: Flujos críticos de usuario
- **Performance Tests**: Carga y estrés

## 📋 Tareas de Mantenimiento

### Diarias
- Backup de base de datos
- Revisión de logs de errores
- Monitoreo de performance

### Semanales
- Actualización de productos
- Revisión de métricas
- Optimización de imágenes

### Mensuales
- Actualización de seguridad
- Limpieza de logs antiguos
- Revisión de costos

## 🛠️ Desarrollo Local

### Setup
```bash
# Clonar repositorio
git clone <repo-url>
cd microsaas-ropa

# Instalar dependencias
npm install

# Configurar variables
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones
# Ejecutar database-schema.sql en Supabase

# Iniciar desarrollo
npm run dev
```

### Scripts Disponibles
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit"
}
```

## 📄 Licencia y Derechos

### Derechos de Autor
- **Desarrollador**: Facundo M. Cercuetti
- **CUIL**: 20-39783111/7
- **Ubicación**: Salta Capital, Argentina
- **Contacto**: facucercuetti420@gmail.com
- **WhatsApp**: +54 9 3875-798949

### Licencia de Software
Este proyecto es propiedad intelectual del desarrollador. Queda prohibida su distribución, modificación o uso comercial sin autorización explícita.

## 🚀 Roadmap Futuro

### Próximas Features
- [ ] App móvil nativa (React Native)
- [ ] Integración con Mercado Pago API
- [ ] Sistema de reviews y ratings
- [ ] Chat de soporte en tiempo real
- [ ] Dashboard de analytics avanzado
- [ ] Multi-tenant (multi-tiendas)
- [ ] PWA con notificaciones push
- [ ] Integración con redes sociales

### Mejoras Técnicas
- [ ] Migración a Next.js 17
- [ ] Implementación de Redis para cache
- [ ] CDN para assets estáticos
- [ ] Testing automatizado con CI/CD
- [ ] Monitoría con Sentry
- [ ] SEO avanzado con structured data

---

## 📞 Soporte y Contacto

Para soporte técnico, consultas o desarrollo de features personalizadas:

- **Email**: facucercuetti420@gmail.com
- **WhatsApp**: +54 9 3875-798949
- **Ubicación**: Salta Capital, Argentina

---

*© 2026 ModaShop Argentina. Todos los derechos reservados.*
# Micro-saas
