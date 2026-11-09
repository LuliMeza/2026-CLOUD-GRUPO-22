# Frontend

Aplicación web escrita en TypeScript con Next.js y React. Usa App Router, Server Components por
defecto y el runtime de Node.js.

## Estructura

- `src/app/`: rutas, layouts y estados del App Router.
- `src/components/`: componentes reutilizables cuando sean necesarios.
- `src/app/_auth/`: estructura compartida de las pantallas de autenticación (`AuthShell` con
  `AuthHeader`/`AuthFooter`, `AuthAltAction`, `auth.css` y las rutas en `routes.ts`). `AuthShell`
  anima el cambio de contenido de la tarjeta (`contentKey`) y el layout centrado (`centered`)
  con Motion. El guion bajo hace que Next no la tome como ruta.
- `src/styles/motion.ts`: curva y duraciones de las animaciones (Motion).
- `src/services/`: acceso a la API. `api.ts` es el **cliente único** (`callEndpoint(contrato,
  cuerpo)`): cuerpo y respuesta tipados por el contrato de `@cloud-grupo-22/shared`, errores como
  `code` del catálogo (o `NETWORK_ERROR` si no hubo respuesta). Cada módulo expone sus llamadas
  (ej. `auth.ts`); `form-errors.ts` pasa los errores por campo del back al formulario.
- `src/hooks/`: hooks reutilizables por módulo.
- `src/types/`: contratos TypeScript del frontend.
- `src/validations/`: textos de los errores de validación de cada formulario (las claves y los
  esquemas están en `@cloud-grupo-22/shared`).
- `src/messages/api-errors.tsx`: **texto de cada error de la API** (tono, título, descripción
  larga y corta). Tipado contra el catálogo: un código nuevo sin texto no compila. Las pantallas
  lo muestran con `ApiErrorAlert` (en la misma carpeta) y suman sus acciones.
- `src/mocks/`: API simulada con msw, solo en desarrollo. Cada handler sale de un contrato
  (`mockEndpoint`): valida el cuerpo como el back y solo puede responder errores declarados.
  Qué email o código dispara cada caso: comentario de `handlers.ts`.
- `tests/`: pruebas de integración y end-to-end de los flujos funcionales.

## Contratos iniciales

- `/`: pantalla inicial para verificar el arranque de Next.js.
- `/login`: login con sus estados (validación, ingresando, credenciales incorrectas, email sin
  confirmar, ingreso bloqueado). Llama a `POST {NEXT_PUBLIC_API_URL}/auth/login`, que el back
  todavía no expone — ver TASK-006 y TASK-012.
- `/registro`: Crear cuenta en dos pasos en la misma página: 1) `POST /auth/register`;
  2) confirmar el email con el código (`POST /auth/verify-email`, `POST /auth/resend-code`).
  `/registro?paso=2&email=…` abre directo el paso 2 — ver TASK-013.
- `NEXT_PUBLIC_API_URL`: URL pública del backend.
- `NEXT_PUBLIC_API_MOCKING=enabled` (en `apps/web/.env.local`): activa los mocks de msw.

## Probar sin backend (mocks)

Con `NEXT_PUBLIC_API_MOCKING=enabled`. La lista completa está en el comentario de
`src/mocks/handlers.ts`; la parte antes de `@` sirve con cualquier dominio.

| Pantalla | Dato | Resultado |
|---|---|---|
| Login | contraseña `aulaclara` | Ingresa |
| Login | `sin-verificar@…` / `bloqueado@…` / `caido@…` | Email sin confirmar / ingreso bloqueado / error del servidor |
| Crear cuenta | `existe@…` / `dominio@…` / `caido@…` | Email ya registrado / dominio rechazado por el back / error del servidor |
| Paso 2 (código) | `123456` | Código correcto |
| Paso 2 (código) | `000000` | Código vencido |
| Paso 2 (código) | cualquier otro | Incorrecto; al 5.º intento, bloqueado (10 min) |
| Paso 2 | email `bloqueado@…` | Bloqueado sin espera conocida |
| Paso 2 | email `espera@…` + "Reenviar código" | Reenviar demasiado pronto (45 s) |

Paso 2 directo: `/registro?paso=2&email=tiago.solis@alu.frlp.utn.edu.ar`.

## Librerías

Formularios con react-hook-form + zod, íconos con lucide-react (siempre vía
`src/components/icons.tsx`), animaciones con Motion (`motion/react`, solo en componentes de
cliente; reglas en `docs/standards/frontend-design-system.md`) y mocks con msw. Cómo y por qué:
[CONTRIBUTING.md](../CONTRIBUTING.md#estándares) y TASK-012/013 (sección "Decisiones").

## Comandos

- `npm run dev:web`: inicia Next.js en desarrollo desde la raíz.
- `npm run build --workspace=@cloud-grupo-22/web`: genera el build de producción.
- `npm run start --workspace=@cloud-grupo-22/web`: sirve el build de producción.

Todavía no existen módulos funcionales. Cada módulo debe documentar vistas, componentes,
services, hooks, permisos y validaciones.
