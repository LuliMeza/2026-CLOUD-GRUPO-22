# @cloud-grupo-22/shared

Contratos compartidos entre `apps/web/` y `apps/api/`: lo que los dos lados tienen que entender igual.

## Qué hay

- `src/schemas/`: esquemas de zod de los pedidos (login, crear cuenta, confirmar el email,
  reenviar el código). Cada regla devuelve una **clave** estable (`LOGIN_ISSUES`,
  `REGISTER_ISSUES`, `VERIFY_EMAIL_ISSUES`), no un texto: el front tiene el texto de cada clave y
  el back la devuelve tal cual en los errores por campo.
- `src/errors/catalog.ts`: **catálogo de errores**. Cada código con su status HTTP, un título
  técnico y cuándo se devuelve. Es la única lista de errores posibles de la API.
- `src/errors/problem.ts`: formato de error **Problem Details (RFC 9457)** con `code`, `errors`
  por campo y `retryAfterSeconds`; `problem(code)` lo arma desde el catálogo,
  `problemFromZodError()` convierte una validación fallida y `parseProblem()` lo lee en el cliente.
- `src/contracts/`: **contratos de endpoints** con `defineEndpoint` (método, ruta, cuerpo,
  respuesta y errores posibles; `VALIDATION_FAILED` e `INTERNAL_ERROR` se suman solos).
  `registry.ts` junta todos (`ALL_ENDPOINTS`).
- `src/docs/api-doc.ts` + `scripts/generate-api-doc.mjs`: generan
  [docs/api/catalogo-de-errores.md](../../docs/api/catalogo-de-errores.md). Un test falla si la tabla
  quedó desactualizada.

No van acá: textos para el usuario (son del front; un código o una clave nueva sin texto rompe el
build del front), acceso a la base o código de Nest (son del
back), ni nada que dependa del navegador o de Node.

## Cómo sumar un error o un endpoint

1. Error nuevo: agregarlo a `ERROR_CATALOG` (código en MAYÚSCULAS, status, título, cuándo).
2. Listarlo en el contrato del endpoint que lo devuelve (`errors: [...]`).
3. `npm run docs:api --workspace=@cloud-grupo-22/shared` y commitear la tabla.
4. Darle texto en `apps/web/src/messages/api-errors.tsx` (el front no compila sin él).
5. Endpoint nuevo: `defineEndpoint({...})` en `src/contracts/<módulo>.ts` y sumarlo a
   `ALL_ENDPOINTS`.

## Cómo se usa

- Es un npm workspace. Front y back lo declaran como dependencia
  (`"@cloud-grupo-22/shared": "0.1.0"`) e importan de `@cloud-grupo-22/shared`, nunca con rutas
  relativas a esta carpeta.
- Se compila a ESM en `dist/` con `tsc` (`npm run build:shared` desde la raíz). Los `predev`,
  `prebuild` y `pretest` de front y back lo compilan solos antes de arrancar.
- Mientras se edita este paquete con el front o el back levantados: `npm run dev:shared` en otra
  terminal (compila en modo watch). Next toma los cambios solo; el back con `start:dev` hay que
  reiniciarlo.
- Imports internos con extensión `.js` (`./schemas/auth.js`): el paquete es ESM con resolución
  NodeNext, igual que el back.

## Comandos (desde la raíz)

- `npm run build:shared`: compila.
- `npm run dev:shared`: compila en modo watch.
- `npm test --workspace=@cloud-grupo-22/shared`: tests (Vitest).
- `npm run typecheck --workspace=@cloud-grupo-22/shared`: tipos de `src` (sin APIs de Node) y de los tests.
- `npm run docs:api --workspace=@cloud-grupo-22/shared`: regenera la tabla de errores y contratos.
- `npm install <paquete> --workspace=@cloud-grupo-22/shared`: suma una dependencia al paquete.
