# 02 - Módulos Frontend (Inventario + Estado + Acción)

## Alcance

Este documento cubre:

- Páginas `app/**/page.tsx` (público + admin).
- Layouts y navegación.
- Componentes `components/admin`, `components/public`, `components/ui`, `components/providers`.

---

## 1) Páginas públicas (storefront)

### Archivos

- `app/page.tsx`
- `app/catalogo/page.tsx`
- `app/producto/[slug]/page.tsx`
- `app/promociones/page.tsx`
- `app/edicion-limitada/page.tsx`
- `app/descuentos/page.tsx`
- `app/novedades/page.tsx`
- `app/ofertas/page.tsx`
- `app/legales/**/page.tsx`

### Estado actual

- UI funcional base y navegación pública.
- Consumo de `/api/products` y `/api/categories`.
- Carrito local + checkout por WhatsApp.

### Riesgos detectados

- Uso intensivo de `any` en varias páginas.
- Mensajes de UX que no reflejan capacidad real (ej. “pago seguro” sin pasarela real).
- Contenido legal con errores de lint (`react/no-unescaped-entities`).

### Acciones obligatorias

1. Tipar respuesta de APIs públicas con `types/index.ts`.
2. Corregir copy comercial para no prometer features no implementadas.
3. Corregir páginas legales y reglas de lint.

---

## 2) Panel Admin - páginas

### Archivos

- `app/admin/login/page.tsx`
- `app/admin/dashboard/page.tsx`
- `app/admin/overview/page.tsx`
- `app/admin/productos/page.tsx`
- `app/admin/categorias/page.tsx`
- `app/admin/pedidos/page.tsx`
- `app/admin/ventas/page.tsx`
- `app/admin/facturacion/page.tsx`
- `app/admin/facturacion/generador/page.tsx`
- `app/admin/promociones/page.tsx`
- `app/admin/edicion-limitada/page.tsx`
- `app/admin/descuentos/page.tsx`
- `app/admin/usuarios/page.tsx`
- `app/admin/roles/page.tsx`
- `app/admin/webhooks/page.tsx`
- `app/admin/stock-bajo/page.tsx`
- `app/admin/configuracion/page.tsx`
- `app/admin/local/page.tsx`
- `app/admin/legales/page.tsx`
- `app/admin/superadmin/page.tsx`

### Estado actual

- Cobertura funcional amplia del panel.
- Integración con endpoints para CRUD y métricas.

### Riesgos detectados

- Alto volumen de `any`, hooks con dependencias faltantes y variables sin uso.
- `app/admin/configuracion/page.tsx` rompe build por error de tipado en nested config.
- Redirecciones por email hardcodeado en login.

### Acciones obligatorias

1. Resolver build blocker en `configuracion/page.tsx`.
2. Reemplazar `any` por interfaces/dtos.
3. Corregir dependencias de `useEffect` y cleanup.
4. Redirección por rol backend, no por email literal.

---

## 3) Layout y navegación admin

### Archivos

- `app/admin/layout.tsx`
- `components/admin/AdminLayout.tsx`
- `components/admin/Sidebar.tsx`
- `components/admin/Topbar.tsx`

### Estado actual

- Layout responsive con sidebar y topbar.

### Riesgos detectados

- Sidebar/topbar con datos hardcodeados de usuario.
- Menú no dinámico por permisos reales.

### Acciones obligatorias

1. Cargar identidad y permisos desde `/api/auth/me`.
2. Render condicional de menú por rol.
3. Evitar exponer módulos no permitidos a `admin_basico`.

---

## 4) Componentes Admin

### Archivos

- `components/admin/Chart.tsx`
- `components/admin/ChartGrid.tsx`
- `components/admin/DataTable.tsx`
- `components/admin/FormModal.tsx`
- `components/admin/ImageUploader.tsx`
- `components/admin/MultiImageUploader.tsx`
- `components/admin/KPICard.tsx`
- `components/admin/StatsCard.tsx`
- `components/admin/Widgets.tsx`

### Estado actual

- Biblioteca útil y reutilizable.

### Riesgos detectados

- `any` en `Chart` y `DataTable`.
- Contratos de props no homogéneos.

### Acciones obligatorias

1. Tipos genéricos reales en tabla/charts.
2. Contratos de props estrictos.
3. Test visual básico de componentes críticos.

---

## 5) Componentes Públicos

### Archivos

- `components/public/Navbar.tsx`
- `components/public/Footer.tsx`
- `components/public/ProductCard.tsx`
- `components/public/Cart.tsx`
- `components/public/BottomNav.tsx`

### Estado actual

- Navegación y carrito operativos en cliente.

### Riesgos detectados

- Número de WhatsApp hardcodeado.
- Carrito sin integración transaccional con pedido real.
- Advertencias por imports no usados.

### Acciones obligatorias

1. Parametrizar teléfono vía `NEXT_PUBLIC_*` o settings.
2. Persistir pedido en backend antes de abrir WhatsApp.
3. Limpiar warnings de código muerto.

---

## 6) Proveedor de tema

### Archivos

- `components/providers/ThemeProvider.tsx`
- `components/providers/useTheme.ts`
- `components/ui/ThemeToggle.tsx`

### Estado actual

- Modo light/dark/system con persistencia en localStorage.

### Riesgos detectados

- `setState` en `useEffect` marcado por regla de rendimiento.

### Acciones obligatorias

1. Reestructurar estado inicial con lazy init.
2. Reducir renders derivados innecesarios.

---

## 7) Componentes UI base

### Archivos

- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/ui/Modal.tsx`
- `components/ui/Select.tsx`
- `components/ui/Spinner.tsx`
- `components/ui/Badge.tsx`
- `components/ui/Toast.tsx`
- `components/ui/PageTransition.tsx`
- `components/ui/AnimatedButton.tsx`
- `components/ui/AnimatedSection.tsx`

### Estado actual

- Base de diseño consolidada.

### Acciones recomendadas

1. Congelar API de componentes para evitar drift.
2. Documentar props y variantes (Storybook o MDX interno).

---

## Matriz de prioridad frontend

- **P0**: login por rol real, fix build `configuracion`, tipos en páginas críticas.
- **P1**: sidebar/topbar por permisos, cart->order persistente.
- **P2**: limpieza de warnings y estandarización de componentes.
