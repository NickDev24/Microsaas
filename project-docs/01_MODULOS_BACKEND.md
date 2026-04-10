# 01 - Módulos Backend (Inventario + Estado + Acción)

## Alcance

Este documento cubre todos los endpoints en `app/api/**/route.ts`.

Total inventariado: **31 endpoints**.

---

## 1) Módulo Auth

### Archivos

- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/auth/refresh/route.ts`
- `app/api/auth/register/route.ts`

### Estado actual

- Login emite cookies `token` y `refreshToken`.
- Registro permite crear usuarios por API.
- `me` consulta datos en `users`.
- `refresh` renueva token por cookie.

### Riesgos detectados

- Registro con `role` ingresado por cliente.
- Falta de política anti-brute-force y rate limiting.
- `refresh` no valida estado activo del usuario en DB.

### Acciones obligatorias

1. Bloquear elevación de rol en registro.
2. Separar registro interno/admin de cualquier endpoint público.
3. Agregar rate limiting por IP/email en login.
4. Revalidar `is_active` y rol en refresh.

---

## 2) Módulo Categories

### Archivos

- `app/api/categories/route.ts`
- `app/api/categories/[id]/route.ts`

### Estado actual

- GET público para lectura.
- CRUD con `supabaseAdmin` para mutaciones.

### Riesgos detectados

- Validación insuficiente de payloads y tipado débil.
- Dependencia de middleware para permisos, sin guard interno adicional.

### Acciones obligatorias

1. Validar payload con schema estricto.
2. Forzar whitelist de campos mutables.
3. Auditar códigos de error consistentes.

---

## 3) Módulo Products

### Archivos

- `app/api/products/route.ts`
- `app/api/products/[id]/route.ts`

### Estado actual

- Soporta filtros (`category_id`, `is_featured`, `q`).
- CRUD de producto e imágenes.
- Disparo de webhook para alta/actualización.

### Riesgos detectados

- `any` en imágenes y objetos mutados.
- Reemplazo completo de imágenes sin transacción.
- No hay validación robusta de estructura de `images`.

### Acciones obligatorias

1. DTO para producto + DTO para imágenes.
2. Transacción para update producto + imágenes.
3. Control de errores de webhook no bloqueante pero trazable.

---

## 4) Módulo Orders

### Archivo

- `app/api/orders/route.ts`

### Estado actual

- GET listado de pedidos.
- POST crea pedido y luego ítems.

### Riesgos detectados

- Uso de `userPayload!` sin garantizar token válido.
- Inserción cabecera/detalle sin transacción.
- Total recibido desde cliente.

### Acciones obligatorias

1. Validar token y rol en handler.
2. Calcular total en servidor (no confiar en cliente).
3. Transacción DB para pedido + items.

---

## 5) Módulo Sales

### Archivo

- `app/api/sales/route.ts`

### Estado actual

- GET de ventas con ítems.
- POST crea venta, detalle y descuenta stock.

### Riesgos detectados

- Sin transacción para venta + items + stock + estado de orden.
- Decremento de stock con RPC sin manejo de rollback.
- Validaciones incompletas.

### Acciones obligatorias

1. Transacción atómica completa.
2. Verificación de stock previo por item.
3. Registro de auditoría de ajustes de inventario.

---

## 6) Módulo Invoices

### Archivo

- `app/api/invoices/route.ts`

### Estado actual

- Genera factura desde venta.

### Riesgos detectados

- Número factura con `Date.now()` (no robusto para concurrencia).
- Reglas fiscales hardcodeadas.

### Acciones obligatorias

1. Correlativo por secuencia/función DB.
2. Config fiscal externa en tabla `system_settings`.

---

## 7) Módulos Promotions / Limited Editions / Seasonal Discounts

### Archivos

- `app/api/promotions/route.ts`
- `app/api/promotions/[id]/route.ts`
- `app/api/limited-editions/route.ts`
- `app/api/limited-editions/[id]/route.ts`
- `app/api/seasonal-discounts/route.ts`
- `app/api/seasonal-discounts/[id]/route.ts`

### Estado actual

- CRUD por módulo + webhook de alta/edición.

### Riesgos detectados

- Reglas de negocio poco validadas (fechas, porcentajes, solapamientos).
- Mutaciones sin contratos tipados fuertes.

### Acciones obligatorias

1. Validar ventanas de fechas y no-solapamiento.
2. Validar rangos de descuento.
3. Reglas de integridad cruzada con productos activos.

---

## 8) Módulo Users / Roles

### Archivos

- `app/api/users/route.ts`
- `app/api/users/[id]/route.ts`
- `app/api/roles/route.ts`

### Estado actual

- Gestión de usuarios y roles operada por API.

### Riesgos detectados

- `update(body)` directo en usuarios/roles.
- Riesgo de modificación de campos críticos.
- Referencias de rol inconsistentes (`role` string vs `role_id`).

### Acciones obligatorias

1. Whitelist estricta de campos editables.
2. Modelo único de roles (solo string o solo FK, no mixto).
3. Logs de auditoría para cambios de permisos.

---

## 9) Módulo Webhooks

### Archivos

- `app/api/webhooks/route.ts`
- `lib/webhook.ts`

### Estado actual

- Gestión de configuración de webhooks.
- Dispatch con firma HMAC + retry.

### Riesgos detectados

- Contrato `webhook_logs` desalineado con SQL documentado.
- Falta de circuit-breaker / dead letter queue.

### Acciones obligatorias

1. Unificar esquema `webhook_logs` (código y SQL).
2. Guardar `attempt`, `event_type`, `response_code`, `error`, `payload` en formato canónico.
3. Añadir política de reintento configurable por endpoint.

---

## 10) Módulo Customers

### Archivo

- `app/api/customers/route.ts`

### Estado actual

- Listado con filtros y estadísticas.
- Creación de cliente.

### Riesgos detectados

- Falta import explícito de `NextRequest`.
- Inserción de `body` sin schema.

### Acciones obligatorias

1. Corregir typing e imports.
2. Validar payload y normalizar datos (email/teléfono).

---

## 11) Módulo Dashboard / Overview / Stock Bajo

### Archivos

- `app/api/dashboard/route.ts`
- `app/api/overview/route.ts`
- `app/api/stock-bajo/route.ts`

### Estado actual

- Métricas agregadas y reportes para admin.

### Riesgos detectados

- Inconsistencia de estados y campos con DB real (`status`, `is_active`, `pending/pendiente`).
- `stock-bajo` tiene lógica de reposición defectuosa.

### Acciones obligatorias

1. Normalizar nombres de campos y enums de estado.
2. Reescribir reposición en lote con transacción correcta.
3. Introducir tests de contrato para métricas.

---

## 12) Módulo Upload

### Archivo

- `app/api/upload/route.ts`

### Estado actual

- Subida a Cloudinary desde multipart.

### Riesgos detectados

- Sin validación de tipo/tamaño de archivo.
- Sin control de abuso/rate limit.

### Acciones obligatorias

1. Limitar MIME y size.
2. Bloquear extensiones no imagen.
3. Auditar intentos fallidos.

---

## 13) Módulo Superadmin Observability

### Archivos

- `app/api/superadmin/api-metrics/route.ts`
- `app/api/superadmin/db-ping/route.ts`
- `app/api/superadmin/system-status/route.ts`
- `app/api/superadmin/webhook-logs/route.ts`

### Estado actual

- Endpoints de salud y métricas.

### Riesgos detectados

- Control de acceso por email hardcodeado/fallback.

### Acciones obligatorias

1. Autorizar por rol real (`super_admin`) y usuario activo.
2. Eliminar fallback de email fijo.
3. Firmar/tracear operaciones administrativas.

---

## Matriz de prioridad backend

- **P0 (inmediato)**: auth/register, superadmin auth, users/roles update(body), secretos.
- **P1 (corto plazo)**: transacciones orders/sales/stock, contratos webhook.
- **P2 (estabilización)**: dashboard/overview consistency, imports/typing, observabilidad robusta.
