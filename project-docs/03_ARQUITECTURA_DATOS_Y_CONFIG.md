# 03 - Arquitectura, Datos y Configuración

## 1) Arquitectura real actual

### Stack

- Next.js App Router (`app/`)
- Supabase (cliente anon + cliente service role)
- JWT en cookies HTTP-only
- Webhooks salientes a n8n
- Zustand para carrito

### Patrón actual

- Frontend (público/admin) consume API interna (`/api/*`).
- API usa `supabaseAdmin` en casi todos los endpoints mutativos.
- Middleware central aplica control de sesión/roles y logging de requests.

### Riesgos de arquitectura

1. Middleware actúa como proxy interno para medir latencia/status.
2. Complejidad operativa alta y acoplamiento transversal.
3. Next.js 16 reporta deprecación de `middleware` hacia `proxy`.

### Decisión recomendada

- Mover observabilidad al nivel handler (`withApiTelemetry`).
- Mantener middleware solo para auth y routing policies.

---

## 2) Autenticación y autorización

### Implementación actual

- `lib/jwt.ts` usa `jsonwebtoken`.
- `middleware.ts` verifica con `jose`.
- `app/api/auth/*` gestiona login/logout/me/refresh/register.

### Problemas críticos

- Registro permite `role` enviado por cliente.
- Endpoints superadmin autorizan por email hardcodeado.
- Frontend login redirige por email hardcodeado.

### Modelo objetivo

- Fuente única de verdad: `role` en DB + claim firmado.
- Guard único reusable: `requireAuth`, `requireRole`.
- Sin hardcodes de emails para privilegios.

---

## 3) Datos y modelo SQL

### Archivos SQL detectados

- `database-schema.sql`
- `database-schema-completo.sql`
- `database-schema-v2.sql`
- `supabase-schema.sql`
- `observability-support.sql`

### Estado

- Coexisten esquemas incompatibles (nombres de columnas, enums, relaciones).
- Código API usa un modelo que no coincide plenamente con todos los SQL.

### Riesgo

- Métricas y CRUD fallan por drift de esquema.
- Migraciones manuales sin versión única.

### Plan de normalización

1. Elegir `database-schema-v2.sql` (o uno final) como canónico.
2. Crear carpeta `migrations/` con versión incremental.
3. Añadir matriz de mapeo `campo_api -> campo_db`.
4. Ejecutar script de validación de integridad por entorno.

---

## 4) Configuración y secrets

### Archivos

- `.env`
- `.env.example`
- `.gitignore`

### Hallazgos

- `.gitignore` no incluye `.env`.
- `.env` contiene secretos reales y credenciales sensibles.

### Política obligatoria

1. Rotación inmediata de todos los secretos comprometidos.
2. Versionado solo de `.env.example`.
3. Validación de variables con helper (`env.ts`) al iniciar app.

### Variables críticas a validar en boot

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `WEBHOOK_N8N_URL`
- `WEBHOOK_SECRET_TOKEN`
- `CLOUDINARY_*`

---

## 5) Dependencias

### `package.json` observado

- Dependencias usadas: `next`, `react`, `@supabase/supabase-js`, `bcryptjs`, `jose`, `jsonwebtoken`, `framer-motion`, `zustand`, `cloudinary`.
- Candidatas no usadas (según búsqueda de imports): `axios`, `multer`.

### Plan

1. Remover paquetes no usados.
2. Ejecutar auditoría de seguridad (`npm audit`) en pipeline.
3. Congelar versiones estables para sprint de cierre.

---

## 6) Webhooks a n8n

### Implementación

- `lib/webhook.ts` genera firma HMAC, reintenta y loguea en DB.

### Riesgos

- Contrato de `webhook_logs` inconsistente con SQL en repo.
- Falta de estandarización de campos de auditoría.

### Estandar mínimo sugerido

Tabla `webhook_logs`:

- `id`
- `event_type`
- `entity_type`
- `entity_id`
- `attempt`
- `status` (`success|pending|failed`)
- `response_code`
- `error`
- `payload`
- `response_body`
- `created_at`

---

## 7) Testing y calidad

### Estado

- Solo test utilitario en `__tests__/auth.test.ts`.
- Sin cobertura de rutas API críticas.
- Lint con alto volumen de errores/warnings.

### Estrategia mínima de cierre

1. Tests de auth y RBAC.
2. Tests de `orders/sales/stock` con casos de integridad.
3. Tests de contrato para webhooks.
4. Gate de CI obligatorio: `lint + type-check + test:run + build`.

---

## 8) Convención operativa para cambios

Cada cambio técnico debe registrar:

- Módulo impactado.
- Archivos tocados.
- Riesgo mitigado.
- Validación ejecutada.
- Resultado y rollback.

Plantilla de registro en `05_CHANGELOG_OPERATIVO.md`.
