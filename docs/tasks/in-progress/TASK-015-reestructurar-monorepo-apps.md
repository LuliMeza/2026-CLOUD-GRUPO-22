# TASK-015: Reestructurar el monorepo en `apps/` y `packages/`

Estado: En progreso (carpetas movidas y referencias actualizadas; falta verificar en la máquina
del desarrollador y actualizar Vercel/Render)
Fecha: 2026-11-09
Depende de: [TASK-014](../finished/TASK-014-contratos-compartidos-y-catalogo-de-errores.md)
(bloque 7 de su plan; terminada).

## 1. Contexto y Objetivo

Llevar el repo a la estructura estándar de un monorepo con contratos compartidos:

```text
.
├── apps
│   ├── api      ← hoy back/  (NestJS)
│   └── web      ← hoy front/ (Next.js)
└── packages
    └── shared   ← creado en TASK-014
        └── src
```

Se hace aparte de las features para que el cambio de carpetas se revise solo.

## 2. Alcance

- `git mv back apps/api` y `git mv front apps/web`; nombres de paquete `@cloud-grupo-22/api` y
  `@cloud-grupo-22/web`.
- `workspaces` de la raíz: `["packages/*", "apps/*"]` (shared primero: npm corre los scripts en ese
  orden) y scripts de la raíz (`dev:back`, `dev:front`, `build`, `db:*`).
- Vercel y Render: carpeta raíz de cada servicio.
- Docker Compose, `.dockerignore`, `.gitignore` (rutas generadas como `back/src/generated/prisma/`,
  `front/src/app/tokens.generated.css`).
- Documentación: AGENTS.md, CLAUDE.md, README, index.md, CONTRIBUTING, `.agents/*.md` (alcance de
  cada agente), OVERVIEW de cada carpeta y rutas citadas en tareas abiertas.

## 3. Decisiones

- **Nombres de paquete y scripts siguen a las carpetas**: `@cloud-grupo-22/api` y
  `@cloud-grupo-22/web`; los scripts de la raíz pasan a `dev:api` y `dev:web` (antes `dev:back` y
  `dev:front`). Los scripts de la raíz llaman a cada workspace por nombre, no por carpeta, así una
  mudanza futura solo toca `workspaces`.
- **Los agentes conservan su nombre** (`back`, `front`, `test`): son roles, no carpetas. Cambia
  su alcance (`apps/api/`, `apps/web/`).
- **El `.env` de la raíz se sigue leyendo**: `apps/api/src/main.ts` y `apps/api/prisma.config.ts`
  buscaban `../.env`; ahora `../../.env` (el cwd de un script de workspace es la carpeta del
  workspace). Es el único cambio fuera de rutas y nombres. El front sigue leyendo solo su
  `apps/web/.env.local` (Next no mira la raíz).
- **`package-lock.json`**: se renombraron las claves de los workspaces en vez de regenerarlo, para
  que no cambie ninguna versión de dependencia; `npm install` lo deja igual.
- **El health sigue respondiendo `"service": "back"`**: cambiarlo es un cambio de comportamiento
  (fuera de alcance).
- **Tareas cerradas (`finished/`) y CHANGELOG no se tocan**: cuentan lo que pasó con las rutas de
  ese momento.

## 4. Exclusiones

- Cambios de código o de comportamiento.

## 5. Criterios de Aceptación

- [ ] `npm install`, `npm run build`, `npm test` y `npm run dev:*` funcionan desde la raíz.
- [ ] Vercel y Render despliegan desde las carpetas nuevas.
- [x] No quedan rutas viejas (`back/`, `front/`) en documentación vigente ni en configuración
      (excepto tareas terminadas y notas históricas de TASK-014, a propósito).

## 6. Resultado

Verificado en una copia del repo (2026-11-09): `npm install` enlaza `@cloud-grupo-22/api` y
`@cloud-grupo-22/web` desde `apps/`; tests de shared (22) y del api (26) ok; `tsc` y `nest build`
del api ok; `next build` del web ok; Prisma lee el `.env` de la raíz desde `apps/api`.
`prisma generate` no se pudo correr en ese entorno (sin acceso a los binarios de Prisma), igual que
antes de la mudanza.

En el repo (2026-11-09): carpetas movidas con `Move-Item` (así viajan también `node_modules`,
`.env.local` y el cliente de Prisma generado, que no están versionados), se borraron los tres
archivos de reemplazo que ya no se importaban (`_auth/Copy.tsx`, `_auth/ApiErrorAlert.tsx` y
`login/routes.ts`) y se escribieron las referencias nuevas.

Pendiente:

- En la máquina del desarrollador: `npm install`, `npm run build`, `npm test`, `npm run dev:api`,
  `npm run dev:web` y `npm run db:generate`.
- Perfiles locales de `.claude/agents/` (no versionados): cambiar `back/` → `apps/api/` y
  `front/` → `apps/web/` a mano.
- Configuración de Vercel y Render:

| Servicio | Antes | Ahora |
|---|---|---|
| Vercel · Root Directory | `front` | `apps/web` |
| Render · Root Directory | vacío (raíz) o `back` | vacío (raíz), para que `npm ci` instale los workspaces |
| Render · Build Command | `npm ci && npm run build -w back` | `npm ci && npm run build -w @cloud-grupo-22/api` |
| Render · Start Command | `npm run start -w back` | `npm run start -w @cloud-grupo-22/api` |

Vercel con Root Directory en `apps/web` instala desde la raíz del monorepo solo (detecta el
`package-lock.json` de arriba); si falla, activar "Include files outside the root directory".
