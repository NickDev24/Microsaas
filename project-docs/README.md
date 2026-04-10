# Documentación Operativa del Proyecto

Este paquete de documentación fue creado para ejecutar el cierre del proyecto con control total de cambios, módulos y prioridades.

## Objetivo

- Tener trazabilidad completa por módulo.
- Reducir retrabajo al centralizar decisiones técnicas.
- Ejecutar el cierre en fases rápidas y verificables.

## Estructura

1. `project-docs/01_MODULOS_BACKEND.md`
   - Inventario de endpoints por dominio.
   - Riesgos, deuda técnica y acciones por módulo.

2. `project-docs/02_MODULOS_FRONTEND.md`
   - Inventario de páginas y componentes.
   - Estado funcional, problemas actuales y remediación.

3. `project-docs/03_ARQUITECTURA_DATOS_Y_CONFIG.md`
   - Auth, middleware, webhooks, SQL, env, dependencias.
   - Alineación requerida entre código y base de datos.

4. `project-docs/04_PLAN_EJECUCION_14_DIAS.md`
   - Plan estratégico modular con orden de implementación.
   - Entregables diarios y criterios de Done.

5. `project-docs/05_CHANGELOG_OPERATIVO.md`
   - Registro de cambios ejecutados.
   - Bitácora de decisiones y rollback plan.

6. `project-docs/06_CHECKLIST_CIERRE_PROYECTO.md`
   - Checklist final de seguridad, calidad, performance y despliegue.

## Cómo usar esta documentación

1. Leer primero `04_PLAN_EJECUCION_14_DIAS.md`.
2. Ejecutar cambios por bloques (seguridad -> datos -> API -> frontend -> QA).
3. Registrar cada cambio en `05_CHANGELOG_OPERATIVO.md`.
4. Validar cada fase con `06_CHECKLIST_CIERRE_PROYECTO.md`.

## Reglas de operación

- Ningún cambio sin ticket de módulo y registro en changelog.
- Ningún endpoint mutativo sin validación de schema.
- Ningún merge sin `lint + type-check + tests + build`.
- Ninguna credencial en repo ni en documentación pública.

## Estado inicial documentado

- Proyecto con alta deuda técnica y seguridad crítica detectada.
- 218 issues de lint reportados y build con error de TypeScript.
- Desalineación entre documentación, esquema SQL y comportamiento real.
