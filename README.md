# 2026-CLOUD-GRUPO-22

> Descripción breve de qué hace este proyecto y para quién.

## Estado

Etapa temprana con el stack tecnológico inicializado y sin módulos funcionales todavía.

## Tecnologías

- Lenguaje: TypeScript.
- Backend: NestJS sobre Node.js.
- Frontend: Next.js con App Router y React; formularios con react-hook-form + zod, íconos con
  lucide-react, animaciones con Motion y mocks de API con msw en desarrollo.
- Persistencia: PostgreSQL con Prisma ORM.
- Gestión de paquetes: npm workspaces.

## Estructura del Repositorio

Ver [index.md](./index.md) para un mapa completo de las carpetas y archivos de este repositorio.

## Primeros pasos

1. Usar Node.js 22.22.3 y npm 10.
2. Ejecutar `npm install` desde la raíz.
3. Copiar `.env.example` como `.env` y adaptar sus valores al entorno local.
4. Iniciar PostgreSQL con `docker compose up -d postgres` cuando no se use otra instalación.
5. Ejecutar `npm run db:generate`.
6. Iniciar backend con `npm run dev:api` y frontend con `npm run dev:web`. Los dos compilan
   antes el paquete compartido `packages/shared`; si lo vas a editar, dejá corriendo
   `npm run dev:shared` en otra terminal.

## Documentación

Lo esencial vive en [`docs/`](./docs/) — estándares bajo `docs/standards/` y tareas (con sus
decisiones) bajo `docs/tasks/`. Seguimos el principio de **lean documentation** de las
metodologías ágiles: la documentación hay que mantenerla y eso cuesta tiempo, así que solo
documentamos lo que realmente necesitamos, cuando lo necesitamos, en vez de adelantar todo de
entrada. Por ahora, seguir la convención definida alcanza.

## Trabajar con Agentes

Este repo define tres agentes por dominio (backend, frontend, testing). Ver
[.agents/OVERVIEW.md](./.agents/OVERVIEW.md) para su alcance y la metodología de delegación de
tareas.

## Contribuir

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para nuestro workflow, convenciones de commit y reglas de documentación por carpeta.

## Equipo

Ver [TEAM_CHARTER.md](./TEAM_CHARTER.md) para roles del equipo, acuerdos de trabajo y proceso de toma de decisiones.

## Licencia

_A definir_
