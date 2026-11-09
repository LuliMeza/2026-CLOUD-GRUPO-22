# TASK-014: Contratos compartidos front/back y catálogo de errores (`packages/shared`)

Estado: Terminada (2026-11-09). El bloque 7 sigue en [TASK-015](../pending/TASK-015-reestructurar-monorepo-apps.md).
Fecha: 2026-11-08
Contexto de producto: HU-01 y [TASK-004](../finished/TASK-004-investigar-autenticacion-institucional.md).
Relacionadas: TASK-007, TASK-012, TASK-013, TASK-015.

## 1. Contexto y Objetivo

Hoy cada lado define por su cuenta qué devuelve la API: el front mapea status HTTP a estados a mano
(`front/src/services/auth.ts`), los mocks inventan sus propios códigos y el back no tiene ninguno.
No hay un lugar donde revisar qué puede responder cada endpoint.

Objetivo: un paquete `packages/shared` (npm workspace) que sea la única fuente de:

- **Catálogo de errores**: cada código posible, su status HTTP y una descripción técnica.
- **Formato de error**: Problem Details (RFC 9457) con `code` del catálogo y errores por campo.
- **Contratos de endpoints**: método, ruta, esquema del cuerpo, esquema de la respuesta y la lista
  de errores que puede devolver.
- **Librerías compartidas**: zod y los esquemas que usan los dos lados (login, registro, código).

El front y el back importan de ahí; los textos que ve el usuario quedan en el front.

## 2. Bloques

Cada bloque se construye, se verifica y recién ahí se pasa al siguiente.

| # | Bloque | Verificación | Estado |
|---|---|---|---|
| 1 | Documentación: se retiran los TDD; las decisiones van a la tarea, la regla a `docs/standards/` + CONTRIBUTING, el hecho al CHANGELOG. Tareas TASK-014 y TASK-015. | Sin referencias activas a `docs/tdd/` | Hecho |
| 2 | `packages/shared` en npm workspaces: paquete ESM compilado con `tsc`, consumido por `front` y `back`; zod pasa a vivir ahí. | `npm install`, build de shared, `tsc` de front y back, test del back y `next build` | Hecho |
| 3 | Catálogo de errores + Problem Details + `defineEndpoint` + contratos de auth (login, registro, verificar código, reenviar código), con tests del paquete. | Tests de shared; tabla de errores generada desde el catálogo | Hecho |
| 4 | Front sobre los contratos: un cliente HTTP, diccionario de textos tipado por código, mocks de msw armados desde el catálogo; login y registro migrados. | Mismos estados y capturas idénticas a TASK-012/013 | Hecho |
| 5 | Back: `AppError(code)`, filtro global que responde Problem Details, validación del cuerpo con los esquemas de zod. | Tests del back por cada error del contrato | Hecho |
| 6 | Paso 2 del registro con Motion (TASK-013) usando los contratos de verificar y reenviar. | Estados del canvas en 3 anchos | Hecho |
| 7 | Renombre a `apps/api` y `apps/web` (TASK-015). | Builds y despliegues | Sigue en TASK-015 |

Las notas de los bloques 1 a 6 usan las rutas de ese momento (`back/`, `front/`); desde el bloque 7
son `apps/api/` y `apps/web/`.

## 3. Decisiones

- **Sin TDD (2026-11-08)**: el documento de diseño técnico dejó de usarse. El razonamiento de cada
  decisión vive en la tarea; ver la tabla "Decisiones: dónde se registra cada cosa" de
  CONTRIBUTING.md.
- **npm workspaces, no pnpm**: el repo ya usa npm workspaces con un único `package-lock.json`.
  Diferencias que importan respecto de pnpm:
  - La dependencia interna se declara con la versión del paquete (`"@cloud-grupo-22/shared": "0.1.0"`
    o `"*"`). npm no entiende el protocolo `workspace:*` de pnpm.
  - npm enlaza el paquete con un symlink en `node_modules/@cloud-grupo-22/shared` y sube
    (hoistea) las dependencias a la raíz. No es estricto como pnpm: un paquete puede importar algo
    que no declaró y funcionar por accidente. Cada `package.json` declara lo que usa.
  - `npm run build --workspaces` corre en el **orden del array `workspaces`**, no por grafo de
    dependencias: `packages/*` va primero.
  - Comandos: `npm install` siempre desde la raíz; `npm run <script> -w @cloud-grupo-22/shared`
    para un paquete; `npm install zod -w @cloud-grupo-22/shared` para sumarle una dependencia.
- **Formato del paquete**: ESM compilado con `tsc` a `dist/` (con `.d.ts`). El back ya es ESM
  (`"type": "module"`, NodeNext) y lo importa directo; Next lo consume con `transpilePackages`.
- **Textos al usuario en el front, no en shared**: el back manda un código estable; el front tiene
  el texto (voseo, versión corta y larga). Un diccionario `satisfies Record<ErrorCode, …>` hace que
  un código nuevo sin texto no compile.
- **Formato de error**: Problem Details (RFC 9457), el estándar de la industria, con `code` y
  `errors` (por campo) como extensiones.

### Bloque 2: cómo quedó

- `packages/shared` (`@cloud-grupo-22/shared`): ESM, `tsc` a `dist/` con `.d.ts`. Exporta los
  esquemas de login y crear cuenta (movidos desde `front/src/validations/`) con sus claves
  tipadas (`LOGIN_ISSUES`, `REGISTER_ISSUES`). `registerSchema` es el cuerpo del pedido;
  `registerFormSchema` le suma "Repetí la contraseña", que no viaja al back.
- `front/src/validations/*.ts` quedan solo con los textos de cada clave, tipados con
  `satisfies Record<…Issue, string>`.
- Raíz: `workspaces: ["packages/*", "back", "front"]` y scripts `build:shared` / `dev:shared`.
  Front y back compilan shared en sus `predev`/`prebuild` (y el back en `prestart:dev`/`pretest`),
  así funciona igual en local, en Vercel y en Render sin pasos extra. Los scripts llaman al
  paquete por nombre (`--workspace=@cloud-grupo-22/shared`) porque una ruta relativa
  (`--workspace=front`) solo funciona desde la raíz.
- Ajuste de comportamiento: un email vacío ahora informa solo "requerido" (antes zod sumaba
  también "inválido"; en pantalla no se veía porque se muestra el primero, pero el back lo habría
  devuelto doble). Lo encontró un test del paquete.

Verificado (2026-11-08), desde una instalación limpia con `npm ci`:

- Un solo `zod` en el árbol (`npm ls zod`), compartido por front, shared y `@hookform/resolvers`.
- Tests de shared: 9 ok. Tests del back: 3 ok (incluye `tests/shared.spec.ts`, que importa el
  paquete). `nest build` ok y el back resuelve el paquete en tiempo de ejecución.
- Front: `tsc` ok; `npm run build -w front` sin `dist/` previo compila shared y después Next.
- Login y crear cuenta: mismos textos y estados que antes en el recorrido con navegador.

Pendiente de revisar en los despliegues: Vercel tiene que instalar desde la raíz del repo
(proyecto con carpeta raíz `front` e "Include files outside the root directory" activado) y
Render tiene que correr el build del back desde la raíz (`npm ci && npm run build -w back`).

### Bloque 3: cómo quedó

- **Catálogo** (`src/errors/catalog.ts`): `VALIDATION_FAILED` (400), `INTERNAL_ERROR` (500),
  `AUTH_INVALID_CREDENTIALS` (401), `AUTH_EMAIL_NOT_VERIFIED` (403), `AUTH_LOGIN_LOCKED` (429),
  `AUTH_EMAIL_DOMAIN_NOT_ALLOWED` (400), `AUTH_EMAIL_TAKEN` (409), `AUTH_OTP_INVALID` (400),
  `AUTH_OTP_EXPIRED` (410), `AUTH_OTP_TOO_MANY_ATTEMPTS` (429), `AUTH_OTP_RESEND_TOO_SOON` (429).
- **Problem Details** (`src/errors/problem.ts`) con extensiones `code`, `errors` (por campo, con
  la clave de la regla) y `retryAfterSeconds`.
- **Contratos de auth** (`src/contracts/auth.ts`): `POST /auth/login`, `/auth/register`,
  `/auth/verify-email` y `/auth/resend-code`, con esquemas nuevos para el paso 2
  (`verifyEmailSchema`, `resendCodeSchema`, código de 6 dígitos).
- **Tabla generada**: [docs/api/catalogo-de-errores.md](../../api/catalogo-de-errores.md).

Decisiones del bloque:

- **Rutas y respuestas correctas propuestas por el front**: el back no tiene auth todavía. Se
  implementan contra este contrato (bloque 5) y, si cambian, se cambian acá primero.
- **`type` como URN** (`urn:aula-clara:error:<CODE>`): RFC 9457 pide una URI que identifique el
  tipo; no hace falta que sea una página, y así no se inventa un dominio.
- **Los errores comunes se suman solos** en `defineEndpoint`: cada contrato lista solo lo propio
  y la tabla igual los muestra todos.
- **Reenviar código responde 202 exista o no la cuenta**: no revela qué emails están registrados.
- **Login y confirmar el email devuelven el usuario** (`{ user: { email, role } }`, roles
  alumno / jefe / admin de TASK-004) y la sesión va en una cookie que pone el back.
- **La documentación de la API se genera** desde el catálogo y los contratos, y un test verifica
  que el archivo commiteado esté al día. Descartado: escribirla a mano (se desincroniza) u
  OpenAPI completo por ahora (más aparato del que necesita el proyecto hoy; zod 4 puede generar
  JSON Schema si se suma después).
- **`src` sin tipos de Node**: el paquete corre en el navegador y en el back, así que `src` se
  chequea sin `@types/node`; solo los tests los usan (`tests/tsconfig.json`).
- `"sideEffects": false` para que el front no incluya en su bundle lo que no importa (por ejemplo
  el generador de la tabla).

Verificado (2026-11-08): tipos de shared ok; tests de shared 22 ok (catálogo, Problem Details,
contratos, tipos derivados y tabla al día); tests del back 3 ok; `tsc` del front ok; `next build` ok.

### Bloque 4: cómo quedó

- `front/src/services/api.ts`: `callEndpoint(contrato, cuerpo)` devuelve
  `{ ok: true, data }` o `{ ok: false, code, problem }`. `code` solo puede ser un error declarado
  en el contrato o `NETWORK_ERROR`. Una respuesta fuera de contrato (código no declarado, cuerpo
  que no es Problem, respuesta correcta con otra forma) se trata como `INTERNAL_ERROR` y se avisa
  en la consola de desarrollo.
- `front/src/services/auth.ts`: `login`, `register`, `verifyEmail` y `resendCode` sobre ese cliente.
- `front/src/messages/api-errors.tsx`: texto por código (tono, título, descripción larga/corta,
  nota), tipado con `satisfies Record<ErrorCode | ClientErrorCode, …>`. Los textos con espera usan
  `retryAfterSeconds` si el back la manda y el marcador `[tiempo de espera]` si no.
- `front/src/messages/ApiErrorAlert.tsx`: el aviso de un error con esos textos; la pantalla
  agrega acciones o cambia el título ("No pudimos ingresar").
- `front/src/services/form-errors.ts`: los errores por campo de `VALIDATION_FAILED` se marcan en
  el formulario con la misma clave que la validación local, así se ven igual.
- `front/src/mocks/handlers.ts`: `mockEndpoint(contrato, resolver)`; mocks nuevos para confirmar
  el email y reenviar el código (los usa el bloque 6).
- Login y crear cuenta usan todo lo anterior; ya no tienen mapeos de status propios.

Decisiones del bloque:

- **`NETWORK_ERROR` no es del catálogo**: el catálogo es lo que manda el back; "no hubo
  respuesta" lo detecta el cliente. Tiene texto propio en el mismo diccionario.
- **Texto por defecto + título por pantalla**: el diccionario tiene un texto por código y la
  pantalla puede cambiar el título cuando el contexto lo pide, en vez de repetir textos.
- **`ApiErrorAlert` en `src/messages/`, junto al diccionario**: lo va a usar toda pantalla que
  llame a la API, así que se ubicó en un lugar compartido desde ahora (primero estuvo en
  `app/_auth/`). No va en `components/` porque esa carpeta es el Design System y no conoce la API.
  El texto largo/corto que usa pasó al Design System como `ResponsiveText` (antes `Copy`, en
  `app/_auth/`), con sus clases en `ds.css`. Capturas antes y después: 28 de 28 idénticas.
- Textos nuevos que no están en el diseño (PENDIENTE): "Revisá los datos marcados", "Algo salió
  mal", "No pudimos conectarnos" / "Intentá de nuevo en unos minutos." y "Esperá un momento para
  pedir otro código". Login y crear cuenta siguen mostrando "No pudimos ingresar" y "No pudimos
  crear tu cuenta".

Verificado (2026-11-08):

- `tsc` del front ok (también con `--noUnusedLocals`) y `next build` ok.
- Garantías de tipos, probadas rompiéndolas a propósito: un código nuevo en el catálogo sin texto
  hace fallar `api-errors.tsx`; un mock que devuelve un código no declarado en su contrato no
  compila.
- Recorrido con navegador y mocks: los 8 estados del login y los 8 de crear cuenta dan los mismos
  textos y foco que antes, y las capturas son idénticas píxel a píxel (las únicas diferencias
  fueron cuadros tomados en medio de una transición del botón o del spinner; repetidas con espera,
  coinciden).

### Bloque 5: cómo quedó

- `back/src/http/`: `AppError(code, extras)`, `ProblemDetailsFilter` (filtro global),
  `ContractRoute(contrato)` + `ContractInterceptor` y `HttpModule` (importado en `AppModule`).
- Catálogo: se sumó `NOT_FOUND` (404, ruta inexistente) como **error global** (`GLOBAL_ERRORS`):
  no lo declara ningún contrato porque sale antes de llegar a un endpoint. Tiene texto en el front
  y aparece en la tabla generada como "cualquier pedido".
- `zod` como devDependency del back, solo para los tests (el código del back usa los esquemas a
  través de `@cloud-grupo-22/shared`).

Decisiones del bloque:

- **Interceptor + decorador en vez de un pipe de validación**: un pipe solo ve el cuerpo; el
  interceptor ve el contrato completo, así también valida la respuesta y frena errores no
  declarados. Un solo decorador (`@ContractRoute`) evita repetir método, ruta y status.
- **La respuesta se recorta a lo que declara el contrato**: si un handler devuelve un campo de
  más (ej. un hash), no sale.
- **Error fuera de contrato = INTERNAL_ERROR** en los dos lados (back y cliente del front): un
  código que el front no espera no tiene pantalla que lo maneje, así que se trata como falla.
- **Otros 4xx de Nest/Express** (JSON mal formado, cuerpo demasiado grande) salen como
  `VALIDATION_FAILED` con `detail`, para que toda respuesta de error tenga un código del catálogo.

Verificado (2026-11-09): tests del back 26 ok, contra un servidor Nest real en un puerto libre:
status de éxito del contrato, `VALIDATION_FAILED` con claves por campo (también con el contrato
real de login), error declarado, `Retry-After`, error no declarado → `INTERNAL_ERROR`, excepción
no controlada sin filtrar el mensaje, recorte de campos de más, respuesta con otra forma,
`NOT_FOUND`, JSON mal formado y **cada código del catálogo** con su status y formato.
`nest build` y tipos del back ok; tests de shared 22 ok; `tsc` del front ok.

Pendiente fuera del bloque: `main.ts` usa `app.enableCors()` sin `credentials`. El front manda
`credentials: "include"` para la cookie de sesión, y con CORS abierto (`*`) el navegador no
acepta respuestas con credenciales. Hay que configurar el origen del front (ej.
`FRONTEND_URL`) y `credentials: true` cuando se implemente la sesión.

### Bloque 6: cómo quedó

Detalle de pantalla y estados en [TASK-013](../finished/TASK-013-implementar-pantalla-crear-cuenta.md#paso-2-confirmar-el-email).
Lo que importa para los contratos: el paso 2 usa `verifyEmail` y `resendCode` de
`services/auth.ts` sin código propio de HTTP; cada error declarado en los contratos
(`AUTH_OTP_INVALID`, `AUTH_OTP_EXPIRED`, `AUTH_OTP_TOO_MANY_ATTEMPTS`,
`AUTH_OTP_RESEND_TOO_SOON`) tiene su estado, y la espera sale de `retryAfterSeconds` del contrato.
Los mocks de verificar y reenviar ahora mandan esa espera (10 min al bloquear, 60 s al reenviar).

Verificado (2026-11-09): `tsc` y `next build` del front; login y registro paso 1 idénticos píxel a
píxel a las capturas previas (3 anchos × 2 temas) y el aviso "sin confirmar" del login igual que
en TASK-012.

## 4. Exclusiones

- Mover `back/` y `front/` a `apps/` (TASK-015).
- Implementar los endpoints de auth del back (solo su contrato y el manejo de errores).

## 5. Criterios de Aceptación

- [x] `npm install` desde la raíz deja `@cloud-grupo-22/shared` enlazado y los builds de front y
      back lo usan sin rutas relativas entre paquetes.
- [x] Cada endpoint de auth declara sus errores posibles y se puede leer en un solo archivo.
- [x] Un código de error nuevo sin texto en el front rompe el build.
- [x] Los mocks no pueden devolver un código que no está en el catálogo.
- [x] Login y registro se ven y se comportan igual que antes de la migración.

## 6. Resultado

Terminada el 2026-11-09. Bloques 1 a 6 hechos y verificados (ver "cómo quedó" de cada bloque);
el bloque 7 (mudanza a `apps/`) se sigue en TASK-015.
