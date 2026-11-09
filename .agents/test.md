# Agente: Testing

## Rol

Escribe y mantiene los tests automatizados de las dos aplicaciones de este repositorio.

## Alcance

- `apps/web/tests/`
- `apps/api/tests/`

## Fuera de Alcance

- Lógica de aplicación/negocio bajo `apps/web/` o `apps/api/` — este agente la testea, no la construye.

## Inputs Requeridos

- Una tarea bien definida (ver ["Gate de tarea" en OVERVIEW.md](./OVERVIEW.md#gate-de-tarea-exigible))
- La sección "Decisiones" de la tarea completa cuando hay una decisión de estrategia de testing de por medio
  (ej. adoptar un framework de testing)

## Workflow

Sigue [.agents/skills/commit-work/SKILL.md](../.agents/skills/commit-work/SKILL.md) para branching,
commit, push y limpieza post-merge.

## Estándares

`docs/standards/` (un estándar de testing dedicado se agrega ahí una vez que se elijan el stack y
los frameworks de test).
