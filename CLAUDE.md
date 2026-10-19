# CLAUDE.md

Monorepo npm workspaces: NestJS (back/) + Next.js/React (front/) + PostgreSQL vía Prisma.
Stack completo, metodología, roles y áreas sensibles: ver [AGENTS.md](./AGENTS.md) y
[.agents/OVERVIEW.md](./.agents/OVERVIEW.md).

## Verificación
- Backend: `npm test --workspace=back` (Vitest).
- Frontend: sin test runner propio todavía — verificar a mano con `npm run dev:front`.
  No agregues tests de front sin que una tarea lo pida.
- Build completo: `npm run build`.

## Reglas que valen siempre
- Gate de tarea: no se implementa sin una tarea en `docs/tasks/`, y sin el TDD en
  `docs/tdd/` correspondiente si hay una decisión de diseño no trivial.
- Áreas sensibles (layout global, router principal, auth, hooks compartidos, estilos
  base, componentes reutilizables globales): no se tocan sin autorización explícita.
- Commits, branching, push, PR y merge: seguir
  [.agents/skills/commit-work/SKILL.md](./.agents/skills/commit-work/SKILL.md) al pie
  de la letra. Nunca push directo a rama protegida ni PR sin instrucción tuya explícita.
- Nueva dependencia o tecnología: solo si una tarea la justifica.
- Al cerrar una tarea, registrarla en `CHANGELOG.md`.

## Flujo de trabajo
1. `/planificar` la tarea (si no existe en `docs/tasks/`, crearla primero con el
   formato de `docs/tasks/OVERVIEW.md`).
2. Revisar el plan generado en `.claude/planes/` (descartable, no se versiona).
3. `/clear` y `/delegar` al agente de dominio (`back`, `front`, `test`; `po` es de uso
   personal para Trello).
4. Lo que quede fuera de alcance va a `docs/tasks/pendient/` como tarea nueva, no se
   improvisa dentro de la actual.

## Agentes del proyecto
`.agents/{OVERVIEW,back,front,test}.md` es la fuente de verdad versionada; `.agents/skills/`
hostea skills portables (ej. `commit-work`). `.claude/agents/*.md` es el wiring local de
Claude Code (gitignored) que delega a esos perfiles — no se duplican ni se reescriben a
mano. `po` vive solo en `.claude/agents/po.md`, de uso personal.

## Cómo comunicarse
Español rioplatense, directo, explicando el por qué técnico de cada decisión. Antes de
una acción destructiva o externa (push, PR, migración), explicar qué se va a hacer y
esperar aprobación.
