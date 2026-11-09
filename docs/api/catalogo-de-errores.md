# Catálogo de errores y contratos de la API

<!-- GENERADO desde packages/shared (catálogo y contratos). No editar a mano:
     npm run docs:api --workspace=@cloud-grupo-22/shared -->

Toda respuesta de error usa Problem Details (RFC 9457), `Content-Type: application/problem+json`:

```json
{ "type": "urn:aula-clara:error:AUTH_OTP_EXPIRED", "title": "Código vencido", "status": 410,
  "code": "AUTH_OTP_EXPIRED", "errors": [{ "field": "code", "code": "codeFormat" }], "retryAfterSeconds": 60 }
```

`errors` va solo en `VALIDATION_FAILED` (un ítem por campo, con la clave de la regla que falló) y
`retryAfterSeconds` solo en los 429 cuando se conoce la espera. El cliente decide según `code`.

## Errores

| Código | HTTP | Título | Cuándo | Endpoints |
|---|---|---|---|---|
| `VALIDATION_FAILED` | 400 | Datos inválidos | El cuerpo del pedido no cumple el esquema del contrato. `errors` trae un ítem por campo con la clave de la regla que falló (ej. `email` / `emailRequired`). | `POST /auth/login`, `POST /auth/register`, `POST /auth/verify-email`, `POST /auth/resend-code` |
| `INTERNAL_ERROR` | 500 | Error interno | Falla no prevista del servidor, o una respuesta que no cumple su contrato (un error no declarado, una respuesta con otra forma). El cliente muestra un aviso genérico y permite reintentar. | `POST /auth/login`, `POST /auth/register`, `POST /auth/verify-email`, `POST /auth/resend-code` |
| `NOT_FOUND` | 404 | Ruta inexistente | No hay ningún endpoint con ese método y esa ruta. No lo declara ningún contrato: puede salir de cualquier pedido. | cualquier pedido |
| `AUTH_INVALID_CREDENTIALS` | 401 | Credenciales incorrectas | El email no existe o la contraseña no coincide. No se distingue cuál de los dos, por seguridad. | `POST /auth/login` |
| `AUTH_EMAIL_NOT_VERIFIED` | 403 | Email sin confirmar | La cuenta existe pero todavía no confirmó su email con el código (HU-01, escenario 4). | `POST /auth/login` |
| `AUTH_LOGIN_LOCKED` | 429 | Ingreso bloqueado | Demasiados intentos fallidos seguidos. Trae `retryAfterSeconds` (y el header `Retry-After`) cuando se conoce la espera. La regla está pendiente (TASK-007). | `POST /auth/login` |
| `AUTH_EMAIL_DOMAIN_NOT_ALLOWED` | 400 | Dominio de email no permitido | El alta solo admite emails @alu.frlp.utn.edu.ar (HU-01, escenario 3). El front muestra el mismo error del campo email. | `POST /auth/register` |
| `AUTH_EMAIL_TAKEN` | 409 | Email ya registrado | Ya existe una cuenta con ese email. | `POST /auth/register` |
| `AUTH_OTP_INVALID` | 400 | Código incorrecto | El código no coincide con el último enviado. Cuenta como intento fallido. | `POST /auth/verify-email` |
| `AUTH_OTP_EXPIRED` | 410 | Código vencido | El código superó su vigencia (pendiente de definir, TASK-007). Hay que pedir uno nuevo. | `POST /auth/verify-email` |
| `AUTH_OTP_TOO_MANY_ATTEMPTS` | 429 | Demasiados intentos de verificación | Se superaron los intentos con un código incorrecto (5 según TASK-004). Trae `retryAfterSeconds` cuando se conoce la espera. | `POST /auth/verify-email` |
| `AUTH_OTP_RESEND_TOO_SOON` | 429 | Reenvío demasiado seguido | Se pidió otro código antes de que termine la espera. Trae `retryAfterSeconds` cuando se conoce la espera. | `POST /auth/resend-code` |

## Endpoints

### `POST /auth/login`

Ingresa con email y contraseña; deja la sesión en una cookie. (`auth.login`)

- **Cuerpo:** `email` (string), `password` (string), `remember` (boolean)
- **Respuesta 200:** `user` (object)

| Error | HTTP |
|---|---|
| `VALIDATION_FAILED` | 400 |
| `INTERNAL_ERROR` | 500 |
| `AUTH_INVALID_CREDENTIALS` | 401 |
| `AUTH_EMAIL_NOT_VERIFIED` | 403 |
| `AUTH_LOGIN_LOCKED` | 429 |

### `POST /auth/register`

Crea la cuenta de un alumno (paso 1 de 2) y le manda el código al email. (`auth.register`)

- **Cuerpo:** `email` (string), `password` (string)
- **Respuesta 201:** `email` (email)

| Error | HTTP |
|---|---|
| `VALIDATION_FAILED` | 400 |
| `INTERNAL_ERROR` | 500 |
| `AUTH_EMAIL_DOMAIN_NOT_ALLOWED` | 400 |
| `AUTH_EMAIL_TAKEN` | 409 |

### `POST /auth/verify-email`

Confirma el email con el código (paso 2 de 2); deja la sesión en una cookie. (`auth.verifyEmail`)

- **Cuerpo:** `email` (string), `code` (string)
- **Respuesta 200:** `user` (object)

| Error | HTTP |
|---|---|
| `VALIDATION_FAILED` | 400 |
| `INTERNAL_ERROR` | 500 |
| `AUTH_OTP_INVALID` | 400 |
| `AUTH_OTP_EXPIRED` | 410 |
| `AUTH_OTP_TOO_MANY_ATTEMPTS` | 429 |

### `POST /auth/resend-code`

Manda un código nuevo e invalida el anterior. Responde igual exista o no la cuenta, para no revelar qué emails están registrados. (`auth.resendCode`)

- **Cuerpo:** `email` (string)
- **Respuesta 202:** `retryAfterSeconds?` (integer)

| Error | HTTP |
|---|---|
| `VALIDATION_FAILED` | 400 |
| `INTERNAL_ERROR` | 500 |
| `AUTH_OTP_RESEND_TOO_SOON` | 429 |

