# 07 - Inventario Completo de Módulos y Archivos

## 1) App Router - páginas públicas

- `app/page.tsx`
- `app/catalogo/page.tsx`
- `app/producto/[slug]/page.tsx`
- `app/promociones/page.tsx`
- `app/descuentos/page.tsx`
- `app/edicion-limitada/page.tsx`
- `app/novedades/page.tsx`
- `app/ofertas/page.tsx`
- `app/legales/politica-de-devoluciones/page.tsx`
- `app/legales/politica-de-envios/page.tsx`
- `app/legales/politica-de-privacidad/page.tsx`
- `app/legales/terminos-y-condiciones/page.tsx`

## 2) App Router - admin

- `app/admin/layout.tsx`
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
- `app/admin/descuentos/page.tsx`
- `app/admin/edicion-limitada/page.tsx`
- `app/admin/usuarios/page.tsx`
- `app/admin/roles/page.tsx`
- `app/admin/webhooks/page.tsx`
- `app/admin/stock-bajo/page.tsx`
- `app/admin/configuracion/page.tsx`
- `app/admin/local/page.tsx`
- `app/admin/legales/page.tsx`
- `app/admin/superadmin/page.tsx`

## 3) API Routes

### Auth

- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/auth/refresh/route.ts`
- `app/api/auth/register/route.ts`

### Catálogo y operaciones

- `app/api/products/route.ts`
- `app/api/products/[id]/route.ts`
- `app/api/categories/route.ts`
- `app/api/categories/[id]/route.ts`
- `app/api/promotions/route.ts`
- `app/api/promotions/[id]/route.ts`
- `app/api/limited-editions/route.ts`
- `app/api/limited-editions/[id]/route.ts`
- `app/api/seasonal-discounts/route.ts`
- `app/api/seasonal-discounts/[id]/route.ts`

### Comercial

- `app/api/orders/route.ts`
- `app/api/sales/route.ts`
- `app/api/invoices/route.ts`
- `app/api/customers/route.ts`

### Admin/monitor

- `app/api/dashboard/route.ts`
- `app/api/overview/route.ts`
- `app/api/stock-bajo/route.ts`
- `app/api/users/route.ts`
- `app/api/users/[id]/route.ts`
- `app/api/roles/route.ts`
- `app/api/webhooks/route.ts`
- `app/api/upload/route.ts`

### Superadmin

- `app/api/superadmin/api-metrics/route.ts`
- `app/api/superadmin/db-ping/route.ts`
- `app/api/superadmin/system-status/route.ts`
- `app/api/superadmin/webhook-logs/route.ts`

## 4) Components - admin

- `components/admin/AdminLayout.tsx`
- `components/admin/Sidebar.tsx`
- `components/admin/Topbar.tsx`
- `components/admin/KPICard.tsx`
- `components/admin/StatsCard.tsx`
- `components/admin/Widgets.tsx`
- `components/admin/Chart.tsx`
- `components/admin/ChartGrid.tsx`
- `components/admin/DataTable.tsx`
- `components/admin/FormModal.tsx`
- `components/admin/ImageUploader.tsx`
- `components/admin/MultiImageUploader.tsx`

## 5) Components - public

- `components/public/Navbar.tsx`
- `components/public/Footer.tsx`
- `components/public/ProductCard.tsx`
- `components/public/Cart.tsx`
- `components/public/BottomNav.tsx`

## 6) Components - ui/providers

- `components/providers/ThemeProvider.tsx`
- `components/providers/useTheme.ts`
- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/ui/Select.tsx`
- `components/ui/Modal.tsx`
- `components/ui/Spinner.tsx`
- `components/ui/Badge.tsx`
- `components/ui/Toast.tsx`
- `components/ui/PageTransition.tsx`
- `components/ui/ThemeToggle.tsx`
- `components/ui/AnimatedButton.tsx`
- `components/ui/AnimatedSection.tsx`

## 7) Librerías

- `lib/auth.ts`
- `lib/jwt.ts`
- `lib/supabase.ts`
- `lib/validators.ts`
- `lib/webhook.ts`
- `lib/cloudinary.ts`
- `lib/constants.ts`
- `lib/store.ts`

## 8) Tipos

- `types/index.ts`

## 9) Middleware

- `middleware.ts`

## 10) Testing

- `__tests__/auth.test.ts`
- `vitest.config.ts`

## 11) SQL y observabilidad

- `database-schema.sql`
- `database-schema-completo.sql`
- `database-schema-v2.sql`
- `supabase-schema.sql`
- `observability-support.sql`

## 12) Configuración del proyecto

- `package.json`
- `tsconfig.json`
- `eslint.config.mjs`
- `next.config.ts`
- `.env.example`
- `.env` (solo local, no versionable)

---

## Estado de documentación por módulo

- Backend/API: documentado en `01_MODULOS_BACKEND.md`.
- Frontend/UI: documentado en `02_MODULOS_FRONTEND.md`.
- Arquitectura/Config/DB: documentado en `03_ARQUITECTURA_DATOS_Y_CONFIG.md`.
- Ejecución y control: `04`, `05`, `06`.
