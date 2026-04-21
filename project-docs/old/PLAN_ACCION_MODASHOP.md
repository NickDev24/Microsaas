# Plan de Acción Profesional (ModaShop) — De “estado actual” a “listo para vender”

Fecha: 2026-04-10  
Objetivo: llevar el proyecto a un estado **100% limpio, funcional, consistente, seguro y entregable** para venta/transferencia a una empresa administradora.

---

## 0) Principios de ejecución (reglas de oro)

- **Una sola fuente de verdad** para:
  - schema SQL
  - modelo de roles
  - campos de estados (`status` vs `is_active`)
- **Defensa en profundidad**:
  - auth en middleware + auth en handler
  - RLS real para lectura pública
  - service role key solo en server y solo cuando sea necesario
- **Reproducibilidad**:
  - levantar en local siguiendo README
  - scripts: lint/type-check/test/build
  - migración DB 100% documentada
- **Criterios de “Done”** por fase:
  - tests pasan
  - type-check pasa
  - lint pasa
  - build pasa
  - no hay endpoints públicos con service role

---

## 1) Roadmap por fases (prioridad + entregables)

### Fase 1 — Seguridad inmediata (P0) “Stop the bleeding” (1–2 días)

#### 1.1 Bloquear exposición por endpoints públicos con `supabaseAdmin`
**Acciones**
- Revisar `middleware.ts` → `publicApiPrefixes`.
- Elegir una política:
  - Opción A: sacar `/api/promotions`, `/api/limited-editions`, `/api/seasonal-discounts` de públicos.
  - Opción B: mantenerlos públicos pero **cambiar GET a `supabase` (anon)** y asegurar RLS.

**Criterio Done**
- Ninguna ruta accesible sin token usa `supabaseAdmin`.

---

#### 1.2 Auth obligatoria en handlers de métricas
**Acciones**
- `app/api/dashboard/route.ts` y `app/api/overview/route.ts`:
  - agregar `authorizeRoles(['super_admin','admin_basico'])`.

**Criterio Done**
- Sin cookie token → status 401/403.

---

#### 1.3 Unificar hashing bcrypt
**Acciones**
- `app/api/auth/register/route.ts` debe usar `hashPassword()` desde `lib/auth.ts`.
- Eliminar duplicación (no usar `bcrypt.genSalt(10)` en register).

**Criterio Done**
- Todo password creado en backend usa 12 rounds.

---

#### 1.4 Repo hygiene / secretos
**Acciones**
- Crear `.gitignore` estándar.
- Asegurar que `.env` no se comitea.
- Revisar historial git para `.env` (si existió, rotar):
  - Supabase anon/service keys
  - JWT secrets
  - Cloudinary API secret
  - Webhook secret

**Criterio Done**
- `.env` ignorado.
- `.env.example` sin valores reales.

---

### Fase 2 — Unificación de schema + alineación de código (P0/P1) (2–5 días)

#### 2.1 Elegir schema authoritative
**Decisión requerida**
- Seleccionar 1 archivo como base.

**Recomendación**
- Usar `database-schema-v2.sql` como base y renombrarlo a `database-schema.sql` (o crear uno nuevo definitivo).

**Criterio Done**
- Solo hay 1 schema “oficial” en repo.
- Los otros quedan archivados o eliminados (según política de repo).

---

#### 2.2 Normalizar entidades y campos
**Objetivo**: evitar que endpoints asuman columnas inexistentes.

**Acciones**
- `products`: elegir
  - Modelo A: `is_active:boolean` (+ opcional `is_featured`)
  - Modelo B: `status:'active'|'draft'|'archived'`

Recomendación: si ya existe `is_active` en código, usar `is_active` y eliminar `status` de queries.

- `customers`: elegir
  - Modelo A: `name`, `dni` (simple)
  - Modelo B: `first_name`, `last_name`, `document_number` (más normalizado)

**Criterio Done**
- Todos los handlers compilan y consultan columnas reales.

---

#### 2.3 Roles: definir y aplicar 1 modelo
**Decisión requerida**
- Opción A: `users.role` string (simple)
- Opción B: `roles` table + `users.role_id`

**Recomendación**
- Para un micro-saas simple, Opción A.

**Acciones**
- Alinear:
  - `types/index.ts`
  - `middleware.ts`
  - `lib/api-auth.ts`
  - `/api/auth/login`
  - policies RLS (si se usan)

**Criterio Done**
- Login + middleware + authorizeRoles usan el mismo set de roles.

---

### Fase 3 — Robustez funcional (P1) (3–7 días)

#### 3.1 Integridad: totals y cálculos server-side
**Acciones**
- `orders` y `sales`:
  - recalcular total a partir de items (precio * cantidad) en el server.
  - validar stock real antes de confirmar.

**Criterio Done**
- No se persiste `total` confiando en cliente.

---

#### 3.2 Operaciones atómicas (transacciones)
**Acciones**
- Implementar RPC SQL (o function) para crear:
  - order + order_items
  - sale + sale_items + decrement_stock

**Criterio Done**
- No hay estados parciales por fallos intermedios.

---

#### 3.3 Corregir `/api/stock-bajo`
**Acciones**
- Reemplazar `.lte('stock','low_stock_threshold')` por:
  - una VIEW (`low_stock_products`), o
  - una RPC que devuelva productos low stock.
- Quitar N+1 queries (agregar query agregada/joins/vistas).

**Criterio Done**
- Respuesta correcta + performance estable.

---

#### 3.4 Webhooks: contrato claro
**Acciones**
- Definir si existen:
  - webhooks outbound a n8n (sí)
  - webhooks inbound (si no, eliminar verify incoming)
- Alinear columnas de `webhook_logs` con el código.

**Criterio Done**
- Se puede rastrear ejecución y reintentos sin errores de schema.

---

### Fase 4 — Calidad, testing, documentación y entrega (P1/P2) (3–10 días)

#### 4.1 Tests
**Acciones**
- Agregar tests de:
  - `validators`
  - auth handlers (login/register/refresh) con mocks
  - smoke tests de endpoints admin críticos

**Criterio Done**
- Coverage mínimo acordado (ej. 60%).

---

#### 4.2 Lint/Typecheck/Build (pipeline)
**Acciones**
- Asegurar que:
  - `npm run lint`
  - `npm run type-check`
  - `npm test`
  - `npm run build`
  pasen en limpio.

**Criterio Done**
- CI listo (aunque sea mínimo) o checklist manual repetible.

---

#### 4.3 Documentación real (no aspiracional)
**Acciones**
- Actualizar:
  - `README.md`
  - `DATABASE_DOCUMENTATION.md`

con:
- roles reales
- tablas reales
- endpoints reales
- variables env reales
- procedimiento de deploy

**Criterio Done**
- No hay contradicciones con el código.

---

## 2) Checklist de entrega para venta (Definition of Done final)

### Seguridad
- [ ] No hay `.env` commiteado.
- [ ] `.gitignore` presente.
- [ ] Secrets rotados si hubo exposición.
- [ ] Ningún endpoint público usa `supabaseAdmin`.
- [ ] Auth en handlers críticos (dashboard/overview y cualquier admin).

### Base de Datos
- [ ] 1 schema authoritative.
- [ ] Migración documentada.
- [ ] RLS aplicado donde corresponde.
- [ ] Índices críticos presentes.

### Backend
- [ ] Validación consistente.
- [ ] Totales calculados server-side.
- [ ] Operaciones atómicas para inserts complejos.

### Frontend/Admin
- [ ] Rutas sin 404 (links reales).
- [ ] Admin muestra usuario/rol real.

### Calidad
- [ ] `lint` OK.
- [ ] `type-check` OK.
- [ ] `test` OK.
- [ ] `build` OK.

### Documentación
- [ ] README real.
- [ ] DB docs real.
- [ ] “Runbook” de operación (backup/rotación/monitoreo).

---

## 3) Próximos pasos recomendados (orden exacto)

1) Implementar P0 Seguridad (Fase 1.1–1.4)
2) Elegir schema final + alinear campos (Fase 2)
3) Corregir integridad/transacciones + stock-bajo (Fase 3)
4) Completar tests + docs (Fase 4)

---
