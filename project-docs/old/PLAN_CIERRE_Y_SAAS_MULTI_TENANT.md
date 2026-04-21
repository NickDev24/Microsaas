# Plan de Cierre, Limpieza y SaaS Multi-Tenant (alquiler tipo “local”) — ModaShop / microsaas-ropa

## Objetivo

Entregar **1 proyecto limpio, seguro, reproducible y listo para alquilar o vender**, donde:

- **super_admin** (propietario de la plataforma) tiene control total sobre:
  - Tenants (tiendas)
  - Observabilidad, salud del sistema, logs
  - Configuración global de plataforma
  - Módulos/APIs del sistema
- **admin del tenant** (inquilino/comprador) administra **solo la parte comercial** de su tienda:
  - Productos, categorías, promociones
  - Pedidos, ventas, facturación
  - Configuración comercial de su local (WhatsApp, datos del local, legales de tienda, etc.)
- Checkout: **se mantiene WhatsApp**, pero debe existir **pedido persistido** en DB antes de abrir WhatsApp.
- Deploy: **local + túnel cloudflared**.

---

## Alcance (qué se considera “terminado”)

### Criterio de Aprobación Final (Release Candidate)

El proyecto se considera cerrado cuando:

- `npm run lint` en verde
- `npm run type-check` en verde
- `npm run test:run` en verde
- `npm run build` en verde
- No hay hardcodes de credenciales/usuarios privilegiados
- Auth y RBAC correctos (plataforma vs tenant)
- Multi-tenant aislado (RLS + `tenant_id` + validación server-side)
- 1 solo archivo SQL canónico aplicable en Supabase

---

## Protocolo Anti-Roturas (OBLIGATORIO)

**Regla**: Antes de aplicar cambios en código/SQL, se debe completar este protocolo.

1) **Definir el cambio**
   - Módulo impactado
   - Qué comportamiento cambia
   - Riesgo (qué se rompe si falla)

2) **Inventario de impacto**
   - Listar archivos a tocar
   - Listar call sites/consumidores (páginas, componentes, endpoints, libs)

3) **Lectura obligatoria**
   - Leer los archivos involucrados
   - Leer contratos de tipos (`types/index.ts`)
   - Leer SQL relevante (tablas/constraints/policies)

4) **Invariantes y contratos**
   - Inputs/outputs del handler
   - Roles necesarios
   - `tenant_id` requerido
   - Errores esperados y formato de respuesta

5) **Ejecución segura**
   - Implementar el cambio mínimo
   - Ajustar tests
   - Pasar gates (type-check/test/build)

---

## Decisión Arquitectónica (multi-tenant)

Estrategia objetivo: **Tenant por fila**

- `tenant_id` en tablas comerciales
- RLS en Supabase con aislamiento por `tenant_id`
- Ruteo recomendado (path-based para cloudflared):
  - Storefront: `/t/{tenantSlug}`
  - Admin tenant: `/t/{tenantSlug}/admin`
  - Superadmin: `/admin/superadmin`

---

## Fases del Plan (no desviarse)

### Fase 0 — Seguridad + base productizable (P0, bloqueante)

**Objetivo**: el repo debe ser publicable/vendible sin exposición de secretos ni bypasses.

Entregables:

- **Rotación obligatoria** de credenciales (fuera del repo):
  - Supabase `service_role` y `anon`
  - Cloudinary
  - `JWT_SECRET` y `JWT_REFRESH_SECRET`
  - `WEBHOOK_SECRET_TOKEN`
- `.env.example` sin secretos y sin passwords reales
- Eliminar flujo operativo basado en `ADMIN_*_PASSWORD` dentro de `.env`
- `/api/auth/refresh` revalida usuario en DB:
  - `is_active = true`
  - rol actual (no confiar en claim antiguo)
- Confirmar que superadmin sea **solo por rol real** (sin hardcodes de email)

DoD:

- Refresh no emite token si usuario inactivo
- No existe elevación de privilegios por `.env` o email literal
- Gates: `type-check`, `test:run`, `build`

---

### Fase 1 — Modelo multi-tenant (P0/P1)

**Objetivo**: permitir múltiples tiendas en una misma plataforma, con aislamiento fuerte.

Entregables (mínimo viable):

- Tablas nuevas:
  - `tenants` (tiendas)
  - `tenant_users` (asociación user<->tenant + rol dentro de la tienda)
- Agregar `tenant_id` en tablas comerciales:
  - `categories`, `products`, `product_images`
  - `customers`, `orders`, `order_items`
  - `sales`, `sale_items`
  - `promotions`, `promotion_products`
  - `limited_editions`, `seasonal_discounts`, `seasonal_discount_categories`
  - `webhooks`, `webhook_logs`
  - `system_settings` (por tenant o separar en `tenant_settings`)
- Separación de roles:
  - **Plataforma**: `super_admin`
  - **Tenant**: `tenant_admin` / `tenant_staff` (en `tenant_users`)

DoD:

- Un tenant no ve datos de otro (RLS + queries)
- Admin de tenant no puede acceder endpoints superadmin

---

### Fase 2 — SQL canónico único (P0)

**Objetivo**: dejar **un solo SQL** listo para pegar en Supabase SQL Editor.

Acciones:

- Consolidar `observability-support.sql` dentro del SQL canónico.
- Alinear nombres/tipos de columnas con el código.
- Eliminar SQLs redundantes.

DoD:

- 1 archivo SQL canónico
- “Instalación desde cero” funciona (tablas + índices + triggers + RLS)

---

### Fase 3 — Backend confiable (P1)

**Objetivo**: consistencia de datos y seguridad en mutaciones.

Acciones:

- Transacciones en:
  - `orders` (header + items + total calculado server-side)
  - `sales` (sale + items + stock + estado order)
  - `products` + imágenes
- Validación estricta de payloads en endpoints mutativos
- Contrato de `webhook_logs` canónico y consistente
- Tests mínimos:
  - auth/rbac
  - integridad orders/sales

DoD:

- sin estados parciales
- tests mínimos en verde

---

### Fase 4 — Frontend/Admin listo para alquilar (P1/P2)

**Objetivo**: experiencia multi-tenant coherente y control por permisos.

Acciones:

- Login y navegación por rol real y pertenencia al tenant
- Configuración comercial por tenant (WhatsApp/local/legal)
- Carrito → persistir `order` → abrir WhatsApp con `order_number`

DoD:

- Flujo trazable completo: catálogo → carrito → order → WhatsApp

---

## Orden de ejecución

1) Fase 0
2) Fase 1
3) Fase 2
4) Fase 3
5) Fase 4

---

## Registro operativo

Cada cambio debe registrarse con:

- Módulo impactado
- Archivos tocados
- Riesgo mitigado
- Validación ejecutada (comandos)
- Resultado y rollback
