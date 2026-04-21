# 04 - Plan de Ejecución (14 días)

## Objetivo del sprint

Cerrar el proyecto con prioridad en:

1. Seguridad crítica.
2. Consistencia de datos.
3. Estabilidad de build y calidad.
4. Cierre funcional admin + storefront.

---

## Principios

- Orden de ejecución: **Seguridad -> Datos -> API -> Frontend -> QA -> Release**.
- Ningún cambio sin trazabilidad en `05_CHANGELOG_OPERATIVO.md`.
- Entregable diario verificable por comandos objetivos.

---

## Semana 1

### Día 1 - Contención inmediata

- Rotar secretos expuestos (Supabase, Cloudinary, JWT, Webhook).
- Corregir `.gitignore` para excluir `.env*`.
- Desactivar elevación de rol en registro.

**Validación**

- Login funciona con credenciales válidas.
- Registro no acepta roles privilegiados.

### Día 2 - RBAC unificado

- Eliminar hardcodes de email en superadmin endpoints.
- Crear guards reutilizables por rol.
- Alinear claims JWT con roles reales.

**Validación**

- `admin_basico` no accede a endpoints superadmin.
- `super_admin` conserva acceso completo.

### Día 3 - Build blocker + tipos base

- Resolver error TypeScript de `app/admin/configuracion/page.tsx`.
- Eliminar `any` críticos en auth, dashboard, config.

**Validación**

- `npm run type-check` sin errores bloqueantes.

### Día 4 - Contratos API (fase 1)

- Implementar validación schema para:
  - auth/register
  - users
  - roles
  - webhooks
- Whitelist de campos mutables.

**Validación**

- Payload inválido responde 400 con detalle claro.

### Día 5 - Transacciones Orders/Sales

- Reescribir flujo atómico de:
  - creación pedido + ítems
  - creación venta + ítems + stock + estado de orden

**Validación**

- No quedan registros parciales ante error intermedio.

### Día 6 - Stock y facturación

- Corregir lógica defectuosa en `stock-bajo`.
- Ajustar facturación para numeración robusta.

**Validación**

- Reposición aplica correctamente por lote.
- Factura no colisiona en concurrencia.

### Día 7 - Corte técnico S1

- Ejecutar `lint`, `type-check`, `test:run`, `build`.
- Consolidar cambios de Semana 1 en changelog.

---

## Semana 2

### Día 8 - Esquema SQL canónico

- Elegir esquema final.
- Crear plan de migración incremental.
- Alinear nombres de campos con APIs.

### Día 9 - Dashboard/Overview consistency

- Unificar enums de estado (`pendiente/entregado/...`).
- Corregir queries de métricas contra el esquema real.

### Día 10 - Webhooks robustos

- Unificar contrato `webhook_logs`.
- Estandarizar logging de intentos y errores.

### Día 11 - Frontend por permisos reales

- Sidebar/topbar dinámicos por rol.
- Login redirige por rol backend, no por email hardcodeado.

### Día 12 - Storefront y checkout

- Persistir pedido en backend antes de WhatsApp.
- Parametrizar teléfono y textos operativos.

### Día 13 - Testing crítico

- Tests auth + RBAC + orders/sales + webhooks.
- Agregar test de regresión para build blocker.

### Día 14 - Cierre y release candidate

- Checklist final completo.
- Documento de riesgos residuales.
- Candidate de release estable.

---

## Criterio de Done global

- `npm run lint` en verde.
- `npm run type-check` en verde.
- `npm run test:run` en verde.
- `npm run build` en verde.
- Checklist `06_CHECKLIST_CIERRE_PROYECTO.md` con mínimo 95%.

---

## Gestión de riesgos durante ejecución

- Si falla seguridad P0, se detiene avance funcional.
- Si hay drift de esquema, se detiene trabajo frontend dependiente.
- Si reaparecen hardcodes de privilegio, bloqueo de merge.
