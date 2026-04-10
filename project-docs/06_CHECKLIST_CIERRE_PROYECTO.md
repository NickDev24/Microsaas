# 06 - Checklist de Cierre de Proyecto

## A) Seguridad

- [ ] Secrets rotados (Supabase, Cloudinary, JWT, webhook).
- [ ] `.env` excluido por `.gitignore`.
- [ ] Sin hardcodes de emails privilegiados.
- [ ] Registro no permite roles privilegiados.
- [ ] Endpoints superadmin protegidos por rol real.
- [ ] Rate limiting activo en login/auth sensible.

## B) Datos y esquema

- [ ] Esquema SQL canónico definido.
- [ ] Migraciones versionadas y reproducibles.
- [ ] Enums de estado unificados API/DB.
- [ ] Contrato `webhook_logs` alineado con código.
- [ ] Validación de integridad post-migración ejecutada.

## C) Backend/API

- [ ] Validación schema en todos los endpoints mutativos.
- [ ] Sin `update(body)` directo en entidades críticas.
- [ ] Transacciones en `orders/sales/stock`.
- [ ] Respuestas de error estandarizadas.
- [ ] Observabilidad desacoplada del middleware-proxy.

## D) Frontend/Admin

- [ ] Redirección login por rol backend.
- [ ] Sidebar/Topbar dinámicos por permisos.
- [ ] Build blocker de `configuracion/page.tsx` resuelto.
- [ ] Warnings críticos de hooks resueltos.
- [ ] Flujo carrito -> pedido -> WhatsApp trazable.

## E) Calidad

- [ ] `npm run lint` en verde.
- [ ] `npm run type-check` en verde.
- [ ] `npm run test:run` en verde.
- [ ] `npm run build` en verde.
- [ ] Cobertura mínima en flujos críticos.

## F) Documentación

- [ ] README alineado al estado real.
- [ ] Roles documentados correctamente (`admin_basico`, `super_admin`).
- [ ] Variables de entorno reales en `.env.example` (sin secretos).
- [ ] Changelog operativo actualizado hasta release.

## G) Release

- [ ] Riesgos residuales documentados.
- [ ] Plan de rollback validado.
- [ ] Tag de release candidate creado.
- [ ] Verificación manual de rutas críticas completada.

---

## Criterio de aprobación final

Proyecto se considera cerrado cuando:

1. Secciones A-F >= 95% completadas.
2. Ningún ítem crítico de seguridad queda pendiente.
3. Build y tests en verde en entorno limpio.
