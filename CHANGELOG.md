# Historial de Cambios

## [Sin publicar]

### Agregado

- Monorepo npm con Node.js 22.22.3 y TypeScript 6.
- Backend NestJS con Prisma ORM, PostgreSQL, endpoint de salud y prueba automatizada.
- Frontend Next.js con App Router y pantalla inicial.
- PostgreSQL local mediante Docker Compose con volumen y healthcheck.
- Flujo SDD, tareas documentadas y reglas operativas en `AGENTS.md`.
- Pantalla de login (`/login`) con sus estados: validación, ingresando, credenciales incorrectas,
  email sin confirmar e ingreso bloqueado; el campo pasa a ser el email institucional
  (TASK-006, TASK-011, TASK-012).
- Crear cuenta en dos pasos en `/registro`: alta con email de alumno y confirmación del email con
  el código de 6 dígitos, con sus seis estados y la animación del paso 2 con Motion (TASK-013).
- Paquete `packages/shared` con los esquemas de zod, el catálogo de errores, el formato Problem
  Details (RFC 9457) y los contratos de los endpoints de auth, usado por el front y el back; tabla
  generada en `docs/api/catalogo-de-errores.md` (TASK-014).
- Front: cliente HTTP único sobre los contratos, textos de error tipados por código y mocks de la
  API con msw para desarrollo (TASK-014).
- Back: errores con `AppError` y respuesta Problem Details, y validación del cuerpo y la respuesta
  según el contrato con `@ContractRoute` (TASK-014).
- Design System: `Alert`, `Spinner`, `StepIndicator`, `PendingText`, `ResponsiveText`, estado de
  error de los campos e íconos sobre lucide-react (TASK-012, TASK-013).

### Cambiado

- Las decisiones se registran en la tarea, en `CONTRIBUTING.md` (reglas) y en este archivo; se
  retiraron los documentos TDD (TASK-014).
- Rebranding de entorno y Docker local a Grupo 22: base de datos local `cloud_grupo_22` y neutralización de referencias residuales en documentación de arquitectura.

### Seguridad

- Prisma usa el adapter JavaScript `pg` sin motor binario nativo.
- `deepmerge-ts` se fija en 8.0.2 mediante `overrides`.
