# Agente: Frontend

## Rol

Implementa y mantiene la aplicación frontend bajo `front/`.

## Alcance

- `front/` (código de la aplicación)

## Fuera de Alcance

- Código de `back/`
- Escribir tests (a cargo del agente de Testing — ver [test.md](./test.md))

## Inputs Requeridos

- Una tarea bien definida (ver ["Gate de tarea" en OVERVIEW.md](./OVERVIEW.md#gate-de-tarea-exigible))
- Un TDD linkeado bajo `docs/tdd/` cuando la tarea involucra una decisión de diseño o arquitectura

## Workflow

Sigue [.agents/skills/commit-work/SKILL.md](../.agents/skills/commit-work/SKILL.md) para branching,
commit, push y limpieza post-merge.

## Estándares

`docs/standards/`:

- [`git-workflow.md`](../docs/standards/git-workflow.md) — control de versiones (compartido con
  el resto del repo).
- [`frontend-design-system.md`](../docs/standards/frontend-design-system.md) — el sistema de
  diseño "Aula Clara UTN" (tokens, componentes, cómo sincronizarlos) y los criterios WCAG 2.1 AA.
  Exigible: ninguna tarea de `front/` que toque UI se da por terminada sin pasar ese checklist.
