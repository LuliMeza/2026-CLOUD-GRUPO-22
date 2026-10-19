# TASK-005: Rebranding Mecánico Grupo 01 a Grupo 22

Estado: Finalizada
Fecha: 2026-10-18
TDD relacionado: No requiere (rebranding mecánico de configuración y metadata sin impacto en diseño técnico)

## 1. Contexto y Objetivo

El proyecto fue forkeado originalmente desde `2026-UTN-GRUPO-01` (Metodologías Ágiles) para continuarse de forma independiente en la materia Desarrollo Cloud como **Grupo 22** (`2026-cloud-grupo-22`).
En pasos previos (commit `64cc262`), se migraron los nombres de paquetes de los workspaces a `@cloud-grupo-22/front` y `@cloud-grupo-22/back`, y los títulos del frontend y README.

El objetivo de esta tarea es completar el reemplazo mecánico de las referencias residuales en variables de entorno, configuración de Docker Compose local y documentación de arquitectura, ratificando el esquema de nombres y garantizando que no queden referencias desactualizadas sin romper la compatibilidad de builds ni tests.

## 2. Alcance completado

- Ratificación formal del esquema de nombres de paquetes `@cloud-grupo-22/*` y monorepo `2026-cloud-grupo-22`.
- Actualización de `.env.example`: reemplazo de `utn_grupo_01` por `cloud_grupo_22` en `POSTGRES_DB` y `DATABASE_URL`.
- Actualización de `docker-compose.yml`: cambio del fallback de base de datos a `cloud_grupo_22` en variables de entorno y healthcheck de PostgreSQL.
- Actualización de `docs/architecture/DEFINICION-ARQUITECTURA.md`: neutralización de la referencia residual al repositorio del fork original para desvincular la URL vieja.
- Preservación de la tarea histórica finalizada `docs/tasks/finished/TASK-002-refinar-tablero-trello-gemelo-digital.md` como registro inmutable de auditoría.
- Registro del cambio en `CHANGELOG.md` bajo `[Sin publicar]`.

## 3. Exclusiones

- No modificar la lógica de negocio ni componentes de frontend/backend fuera de los textos de configuración y metadatos acordados.
- No alterar registros de auditoría de tareas pasadas finalizadas (`TASK-002`).

## 4. Criterios de Aceptación

- [x] `.env.example` y `docker-compose.yml` apuntan consistentemente a la base de datos `cloud_grupo_22`.
- [x] No existen referencias activas residuales a `grupo-01`, `grupo_01` o `utn_grupo_01` en código, scripts o variables de entorno.
- [x] `npm run build` compila limpiamente (workspaces backend y frontend).
- [x] `npm run test` ejecuta y pasa todos los tests unitarios.

## 5. Validaciones

- [x] `npm test` exitoso en todos los workspaces (1 test unitario de backend pasando en Vitest).
- [x] `npm run build` exitoso (Prisma generate + NestJS build en back, Turbopack estático en front).
- [x] Auditoría `git grep` verificada: cero coincidencias en código activo, única mención preservada en auditoría pasada de `TASK-002`.

## 6. Resultado

Se completó el rebranding mecánico hacia Grupo 22 en todos los puntos residuales del repositorio sin provocar regresiones ni roturas en los workspaces. La configuración local de base de datos apunta a `cloud_grupo_22`, la documentación de arquitectura fue desvinculada de la URL previa, y el cambio quedó registrado en el historial de cambios.
