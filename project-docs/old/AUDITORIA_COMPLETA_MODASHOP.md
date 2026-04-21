# Auditoría Completa del Proyecto ModaShop (ModaShop Argentina)

Fecha: 2026-04-10  
Scope: Revisión estática del repositorio (código, configuración, documentación y schemas SQL)  
Stack declarado: Next.js 16 (App Router) + TypeScript 5 + Supabase (PostgreSQL) + Cloudinary + Vitest + Zustand

---

## 0) Resumen Ejecutivo (estado real)

El repositorio contiene una base funcional (panel admin, API routes, auth JWT con refresh, subida Cloudinary, webhooks outbound, validación de payloads y tests unitarios mínimos). Sin embargo, **NO está en estado “auditado y seguro”** como declara la documentación.

### Principales riesgos que impiden producción/venta hoy

- **CRÍTICO**: Endpoints marcados como públicos en `middleware.ts` permiten **GET sin token**, pero los handlers usan `supabaseAdmin` (service role) → bypass RLS y exposición de datos.
- **CRÍTICO**: `app/api/dashboard/route.ts` y `app/api/overview/route.ts` no aplican auth en el handler (dependen 100% del middleware).
- **CRÍTICO**: Existe **multiplicidad de schemas SQL** (4 fuentes) con **modelos incompatibles** de tablas/campos y roles; el código asume campos que no existen en todos los schemas (`products.status` vs `products.is_active`, `customers.name` vs `first_name/last_name`, etc.).
- **ALTO**: Sistema de roles inconsistente entre README/DB docs/SQL y el código.
- **ALTO**: `.env` existe en la raíz del repo y **no hay `.gitignore`** en la raíz.

---

## 1) Inventario de módulos auditados

### Backend/API
- `app/api/auth/*`
- `app/api/products/*`
- `app/api/categories/*`
- `app/api/orders/*`
- `app/api/sales/*`
- `app/api/invoices/*`
- `app/api/customers/*`
- `app/api/promotions/*`
- `app/api/limited-editions/*`
- `app/api/seasonal-discounts/*`
- `app/api/roles/*`
- `app/api/users/*`
- `app/api/upload/*`
- `app/api/webhooks/*` (CRUD de configuración)
- `app/api/stock-bajo/*`
- `app/api/dashboard/*`
- `app/api/overview/*`
- `app/api/superadmin/*`

### Core libs
- `lib/supabase.ts`, `lib/jwt.ts`, `lib/auth.ts`, `lib/api-auth.ts`, `lib/validators.ts`, `lib/webhook.ts`, `lib/cloudinary.ts`, `lib/store.ts`, `lib/constants.ts`

### Middleware
- `middleware.ts`

### UI
- `components/public/*`, `components/admin/*`, `components/ui/*` (parcial), `components/providers/*`
- `app/admin/*` (login + layout revisados; páginas admin pendientes de revisión profunda en esta auditoría)

### Testing
- `vitest.config.ts`
- `__tests__/auth.test.ts`

### Docs/SQL
- `README.md`, `DATABASE_DOCUMENTATION.md`
- `database-schema.sql`, `database-schema-completo.sql`, `database-schema-v2.sql`, `supabase-schema.sql`

---

## 2) Hallazgos por severidad

### CRÍTICO (P0)

#### C-01: Endpoints públicos con `supabaseAdmin` (bypass RLS)
**Evidencia**
- `middleware.ts` incluye en `publicApiPrefixes`:
  - `/api/promotions`
  - `/api/limited-editions`
  - `/api/seasonal-discounts`
- En esos handlers, `GET` usa `supabaseAdmin`:
  - `app/api/promotions/route.ts` (GET)
  - `app/api/limited-editions/route.ts` (GET)
  - `app/api/seasonal-discounts/route.ts` (GET)

**Impacto**
- Un request público (sin token) puede leer datos retornados desde service role, ignorando RLS.

**Recomendación**
- Separar endpoints públicos/admin o hacer que los públicos usen `supabase` (anon) con RLS.
- Quitar esos prefijos de `publicApiPrefixes` si deben ser admin-only.

---

#### C-02: `dashboard`/`overview` sin auth en handler
**Evidencia**
- `app/api/dashboard/route.ts`: no usa `authorizeRoles`.
- `app/api/overview/route.ts`: no usa `authorizeRoles`.

**Impacto**
- Seguridad depende únicamente del middleware. Cualquier bypass/regresión en middleware expone métricas sensibles.

**Recomendación**
- Agregar auth a nivel handler (`authorizeRoles(['super_admin','admin_basico'])`).

---

#### C-03: Incompatibilidad grave de schema/código (campos distintos)
**Evidencia (ejemplos)**
- Código usa `products.status = 'active'`:
  - `app/api/dashboard/route.ts`
  - `app/api/overview/route.ts`
  - `app/api/stock-bajo/route.ts`
- Pero `database-schema.sql` define `products.is_active` (no `status`).
- `customers` inconsistente:
  - `app/api/customers/route.ts` filtra por columnas `name`, `dni`.
  - `database-schema-v2.sql` usa `first_name/last_name/document_number`.

**Impacto**
- Endpoints fallan o devuelven data vacía según el schema real aplicado.

**Recomendación**
- Elegir 1 schema authoritative y alinear todo el código.

---

#### C-04: Repo hygiene y gestión de secretos: `.env` presente y sin `.gitignore`
**Evidencia**
- `/.env` existe en la raíz.
- `.gitignore` no existe en la raíz (no encontrado en `find_by_name`).

**Impacto**
- Alto riesgo de commit accidental de secretos.

**Recomendación**
- Agregar `.gitignore` estándar.
- Remover `.env` del tracking (y rotar claves si estuvieron expuestas).

---

### ALTO (P1)

#### H-01: bcrypt rounds inconsistente
**Evidencia**
- `lib/auth.ts`: `SALT_ROUNDS = 12`.
- `app/api/auth/register/route.ts`: usa `bcrypt.genSalt(10)`.

**Impacto**
- Contraseñas creadas vía API con costo menor.

**Recomendación**
- Usar `hashPassword()` centralizado y 12 rounds en todos los flujos.

---

#### H-02: Roles inconsistentes (string role vs tabla roles vs docs)
**Evidencia**
- `types/index.ts`: `UserRole = 'admin_basico'|'super_admin'|'customer'`.
- `middleware.ts`: roles admin permitidos `admin_basico`/`super_admin`.
- `database-schema.sql`: CHECK `('admin','manager','customer')`.
- `database-schema-completo.sql`: tabla `roles` + `users.role_id`.
- `DATABASE_DOCUMENTATION.md` declara rol `admin`.
- `README.md` mezcla `admin_basico/super_admin` y `admin/manager/employee`.

**Impacto**
- Permisos y login pueden fallar según el rol real almacenado.

**Recomendación**
- Unificar modelo de roles y actualizar schema + código + docs.

---

#### H-03: Endpoint `/api/roles` tiene bug de conteo de usuarios por rol
**Evidencia**
- `app/api/roles/route.ts` hace `.eq('role', role.id)` para contar usuarios.

**Impacto**
- Métricas erróneas.

**Recomendación**
- Decidir si `users.role` guarda nombre del rol o `role_id` y corregir query.

---

#### H-04: `app/api/stock-bajo/route.ts` usa filtro columna-vs-columna inválido
**Evidencia**
- `.lte('stock', 'low_stock_threshold')`.

**Impacto**
- Resultado incorrecto o vacío.

**Recomendación**
- Implementar vista SQL (ej. `low_stock_products`) o RPC / query con filtro correcto.

---

#### H-05: Integridad de datos: totals y transacciones
**Evidencia**
- `app/api/orders/route.ts`: guarda `total` del body.
- `orders`/`sales` crean items sin transacción.

**Impacto**
- Datos inconsistentes ante fallos parciales o manipulación.

**Recomendación**
- Recalcular totals en server.
- Usar funciones SQL o patrón de transacción (RPC en Supabase) para inserts atómicos.

---

### MEDIO (P2)

#### M-01: Root layout incluye `Footer` también en admin
**Evidencia**
- `app/layout.tsx` renderiza `<Footer />` para todo el sitio.

**Impacto**
- UX inconsistente en `/admin/*`.

**Recomendación**
- Separar layout o condicionar por ruta.

---

#### M-02: Links a rutas inexistentes
**Evidencia**
- `components/public/Footer.tsx` enlaza `/envios`, `/devoluciones`, `/tallas`, `/faq`.

**Impacto**
- 404.

**Recomendación**
- Crear rutas o ajustar enlaces.

---

#### M-03: UI admin no muestra sesión/usuario real
**Evidencia**
- `components/admin/Sidebar.tsx` y `Topbar.tsx`: texto estático “Usuario autenticado”.

**Impacto**
- UX y depuración peores.

**Recomendación**
- Consumir `/api/auth/me`.

---

### BAJO (P3)

#### L-01: Metadata default
**Evidencia**
- `app/layout.tsx`: `metadata.title = "Create Next App"`.

**Impacto**
- SEO/branding.

---

## 3) Auditoría por módulos/archivos (detalle)

> Nota: Se listan archivos clave y su estado. Cuando aplica, se indica “riesgo” y “acción”.

### 3.1 `middleware.ts`
- **Qué hace**: protege `/admin/*` y `/api/*`; valida JWT (Edge con `jose`), logging hacia tablas `security_events` y `api_request_logs`, y permite GET públicos por prefijo.
- **Riesgos**:
  - Lista de públicos incluye endpoints que en backend usan `supabaseAdmin`.
  - Duplicación de auth con `authorizeRoles` en handlers.
- **Acción**:
  - Revisar `publicApiPrefixes`.
  - Mantener middleware como capa extra, no como única barrera.

### 3.2 Auth
- `app/api/auth/login/route.ts`: valida credenciales contra tabla `users`, setea cookies httpOnly, genera access+refresh.
- `app/api/auth/refresh/route.ts`: renueva access desde refresh.
- `app/api/auth/logout/route.ts`: limpia cookies.
- `app/api/auth/me/route.ts`: devuelve info del usuario.
- `app/api/auth/register/route.ts`: crea usuario, pero hashea con 10 rounds.

### 3.3 Supabase client
- `lib/supabase.ts`: expone `supabase` (anon) y `supabaseAdmin` (service role). No valida env vars al inicio (usa `!`).

### 3.4 Validadores
- `lib/validators.ts`: validación custom por payload.
- Riesgo: falta de validación fuerte de UUID y consistencia de tipos; se recomienda Zod para robustez.

### 3.5 Webhooks
- `lib/webhook.ts`: outbound con HMAC + retries + log.
- Riesgo: desalineación posible con schema de `webhook_logs` según archivo SQL aplicado.

### 3.6 Cloudinary
- `lib/cloudinary.ts`: upload stream + delete.
- `app/api/upload/route.ts`: valida MIME + size; no whitelist del `folder`.

### 3.7 Store
- `lib/store.ts`: Zustand persist para carrito; no guarda tokens.

### 3.8 API business endpoints
- `products`, `categories`, `orders`, `sales`, `invoices`, `customers`, `roles`, `users`, `webhooks`, `stock-bajo`, `dashboard`, `overview`.
- Riesgos principales:
  - Public GET + `supabaseAdmin`
  - Inconsistencias schema
  - Falta de transacciones
  - Query inválida en `stock-bajo`

### 3.9 UI público
- `components/public/Cart.tsx`: WhatsApp phone hardcodeado.
- `Footer.tsx`: links posiblemente inexistentes.

### 3.10 Testing
- `vitest.config.ts`: correcto; tests solo de `lib/auth`.

---

## 4) Recomendaciones de “fuente de verdad” (decisiones necesarias)

### 4.1 Schema authoritative
- Seleccionar 1: recomendado `database-schema-v2.sql` como base por estar más alineado con roles `admin_basico/super_admin` y tablas de observabilidad.

### 4.2 Modelo de roles
- Opción A: `users.role` string con CHECK/ENUM (simple, suficiente)
- Opción B: `roles` table + `users.role_id` (más flexible, mayor complejidad)

### 4.3 Endpoints públicos
- Definir explícitamente “qué puede ver un usuario anónimo”:
  - productos activos, categorías activas, imágenes.
  - promociones/descuentos: decidir si son públicas.

---

## 5) Entregables recomendados (para venta del proyecto)

- `project-docs/AUDITORIA_COMPLETA_MODASHOP.md` (este archivo)
- `project-docs/PLAN_ACCION_MODASHOP.md`
- 1 schema definitivo (`database-schema-authoritative.sql` o renombrar v2)
- Scripts reproducibles:
  - `npm run type-check`, `npm test`, `npm run lint`, `npm run build`

---

## 6) Cierre

Este reporte documenta el estado actual observable en el repo. Para completar la auditoría “100%” orientada a entrega/venta falta corroborar:
- El estado real de la base en Supabase (tablas, RLS policies, columnas).
- Historial git respecto a `.env` (si se commiteó).
- Auditoría de vulnerabilidades (`npm audit`).

---
