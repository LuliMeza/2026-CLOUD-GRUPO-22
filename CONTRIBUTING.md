# Contribuir

## Workflow

1. Crear una rama desde `desarrollo` usando `tipo/descripcion-corta` (ej. `feat/login-form`, `fix/cors-error`).
2. Commitear usando [Conventional Commits](https://www.conventionalcommits.org/): `tipo(scope): descripción` (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`, ...).
3. Abrir un pull request contra `desarrollo`. Mantener los PR chicos y acotados a un solo cambio.
4. Se requiere al menos una aprobación de revisión antes de mergear.
5. Una vez mergeado, borrar la rama de la feature.

Detalle completo (modelo de branching, formato de commit): [docs/standards/git-workflow.md](docs/standards/git-workflow.md).
El mismo flujo como skill ejecutable por agentes: [.agents/skills/commit-work/SKILL.md](.agents/skills/commit-work/SKILL.md).

## Estándares

Los estándares y convenciones de código en detalle viven en `docs/standards/`. Este archivo solo
enuncia las reglas que aplican a todo el repo; cualquier cosa que requiera más profundidad
(convenciones de nombres, estrategia de testing, detalles de git workflow, guías de estilo por
stack, etc.) tiene su propio archivo bajo `docs/standards/` y se linkea desde acá a medida que se
escribe.

Reglas vigentes (una línea cada una; el detalle en el archivo linkeado):

- **Git**: [docs/standards/git-workflow.md](docs/standards/git-workflow.md).
- **Interfaz**: Design System, tokens y WCAG 2.1 AA en
  [docs/standards/frontend-design-system.md](docs/standards/frontend-design-system.md).
- **Formularios**: react-hook-form + zod. El `message` de cada regla del esquema es una clave; la
  vista elige el texto (TASK-012).
- **Íconos**: lucide-react, siempre a través de `apps/web/src/components/icons.tsx` (TASK-012).
- **Animaciones**: Motion (`motion/react`), con movimiento reducido respetado — ver la sección
  "Animaciones" de frontend-design-system.md (TASK-013).
- **API simulada en desarrollo**: msw, activada con `NEXT_PUBLIC_API_MOCKING=enabled` (TASK-012).
- **Contratos front/back**: esquemas, catálogo de errores y contratos de endpoints en
  `packages/shared` ([OVERVIEW](packages/shared/OVERVIEW.md)). Todo error de la API sale del
  catálogo con formato Problem Details; la tabla para revisarlos es
  [docs/api/catalogo-de-errores.md](docs/api/catalogo-de-errores.md), generada (no se edita a mano).

## Decisiones: dónde se registra cada cosa

Cada documento cumple un objetivo distinto, así que una misma decisión deja una huella distinta
en cada uno:

| Qué | Dónde | Cuándo |
|---|---|---|
| **Por qué**: qué se eligió, qué se descartó y por qué | Sección "Decisiones" de la tarea en `docs/tasks/` | Antes de implementar (gate de tarea) |
| **La regla que queda vigente** | El estándar en `docs/standards/` + una línea en "Estándares" de este archivo | Al implementarla |
| **El hecho**: qué cambió | Una línea en `CHANGELOG.md` con link a la tarea | Al cerrar la tarea |

No se escribe el razonamiento en el CHANGELOG (es un historial, no un lugar de discusión) ni el
historial en este archivo (acá solo va lo que rige hoy). Si una decisión se revierte, se actualiza
la regla vigente y la tarea nueva explica el cambio.

## Reglas de Documentación

- **Un solo README, un solo index.** `README.md` e `index.md` existen únicamente en la raíz del
  repositorio. Ninguna otra carpeta puede tener un archivo llamado `README.md` o `index.md`.
- **Las explicaciones a nivel de carpeta usan `OVERVIEW.md`.** Si el contenido de una carpeta no
  se explica solo, agregar un `OVERVIEW.md` adentro describiendo su propósito y estructura. Nunca
  duplicar `README.md` o `index.md` para esto.

## Agentes, Skills y Reglas

Este repositorio soporta desarrollo multiagente:

- **Los agentes** se definen como perfiles `.md` bajo `.agents/`, un archivo por agente,
  describiendo su rol, alcance y responsabilidades.
- **Las skills** viven bajo `.agents/skills/`. Una skill solo puede agregarse si cumple las tres
  condiciones:
  1. **Justificada** — el archivo de la skill indica por qué hace falta (qué problema resuelve
     que no esté ya cubierto).
  2. **Usada** — al menos un perfil de agente bajo `.agents/` la referencia.
  3. **Portable** — está escrita para poder usarse con agentes de Claude, Codex y Gemini (sin
     sintaxis específica de una herramienta, salvo que sea explícita e inevitable).
- **Las reglas** bajo `rules/` definen restricciones que los agentes deben seguir al operar en
  este repo (ej. límites de alcance, criterios de escalamiento).

## Variables de Entorno

Nunca commitear secretos reales en `.env`. Agregar las variables nuevas a `.env.example` con
valores de ejemplo cada vez que `.env` cambie.
