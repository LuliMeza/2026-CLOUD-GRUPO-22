/**
 * Catálogo de errores de la API: la única lista de errores que el back puede devolver.
 *
 * - La clave es el `code` que viaja en cada respuesta de error. Es estable: el front decide
 *   qué mostrar según el código, nunca según el texto ni solo según el status.
 * - `status` es el código HTTP con que sale.
 * - `title` es un resumen técnico corto (va en la respuesta, sirve para logs y para quien
 *   lee la API). NO es el texto que ve el usuario: ese vive en el front.
 * - `description` explica cuándo se devuelve; aparece en la tabla generada
 *   (docs/api/catalogo-de-errores.md).
 *
 * Para sumar un error: agregarlo acá, listarlo en el contrato del endpoint que lo devuelve
 * (src/contracts) y darle texto en el front (el build del front falla hasta que lo tenga).
 */
export interface ErrorDefinition {
  status: number;
  title: string;
  description: string;
}

export const ERROR_CATALOG = {
  /* ---------------------------- Comunes a todos ---------------------------- */
  VALIDATION_FAILED: {
    status: 400,
    title: "Datos inválidos",
    description:
      "El cuerpo del pedido no cumple el esquema del contrato. `errors` trae un ítem por campo con la clave de la regla que falló (ej. `email` / `emailRequired`).",
  },
  INTERNAL_ERROR: {
    status: 500,
    title: "Error interno",
    description:
      "Falla no prevista del servidor, o una respuesta que no cumple su contrato (un error no declarado, una respuesta con otra forma). El cliente muestra un aviso genérico y permite reintentar.",
  },
  NOT_FOUND: {
    status: 404,
    title: "Ruta inexistente",
    description: "No hay ningún endpoint con ese método y esa ruta. No lo declara ningún contrato: puede salir de cualquier pedido.",
  },

  /* --------------------------------- Login --------------------------------- */
  AUTH_INVALID_CREDENTIALS: {
    status: 401,
    title: "Credenciales incorrectas",
    description: "El email no existe o la contraseña no coincide. No se distingue cuál de los dos, por seguridad.",
  },
  AUTH_EMAIL_NOT_VERIFIED: {
    status: 403,
    title: "Email sin confirmar",
    description: "La cuenta existe pero todavía no confirmó su email con el código (HU-01, escenario 4).",
  },
  AUTH_LOGIN_LOCKED: {
    status: 429,
    title: "Ingreso bloqueado",
    description:
      "Demasiados intentos fallidos seguidos. Trae `retryAfterSeconds` (y el header `Retry-After`) cuando se conoce la espera. La regla está pendiente (TASK-007).",
  },

  /* ------------------------------ Crear cuenta ------------------------------ */
  AUTH_EMAIL_DOMAIN_NOT_ALLOWED: {
    status: 400,
    title: "Dominio de email no permitido",
    description: "El alta solo admite emails @alu.frlp.utn.edu.ar (HU-01, escenario 3). El front muestra el mismo error del campo email.",
  },
  AUTH_EMAIL_TAKEN: {
    status: 409,
    title: "Email ya registrado",
    description: "Ya existe una cuenta con ese email.",
  },

  /* ---------------------- Verificación del email (OTP) ---------------------- */
  AUTH_OTP_INVALID: {
    status: 400,
    title: "Código incorrecto",
    description: "El código no coincide con el último enviado. Cuenta como intento fallido.",
  },
  AUTH_OTP_EXPIRED: {
    status: 410,
    title: "Código vencido",
    description: "El código superó su vigencia (pendiente de definir, TASK-007). Hay que pedir uno nuevo.",
  },
  AUTH_OTP_TOO_MANY_ATTEMPTS: {
    status: 429,
    title: "Demasiados intentos de verificación",
    description: "Se superaron los intentos con un código incorrecto (5 según TASK-004). Trae `retryAfterSeconds` cuando se conoce la espera.",
  },
  AUTH_OTP_RESEND_TOO_SOON: {
    status: 429,
    title: "Reenvío demasiado seguido",
    description: "Se pidió otro código antes de que termine la espera. Trae `retryAfterSeconds` cuando se conoce la espera.",
  },
} as const satisfies Record<string, ErrorDefinition>;

export type ErrorCode = keyof typeof ERROR_CATALOG;

/** Todos los códigos, en el orden del catálogo. */
export const ERROR_CODES = Object.keys(ERROR_CATALOG) as [ErrorCode, ...ErrorCode[]];

/** Errores que cualquier endpoint puede devolver; `defineEndpoint` los suma solo. */
export const COMMON_ERRORS = ["VALIDATION_FAILED", "INTERNAL_ERROR"] as const satisfies readonly ErrorCode[];

/** Errores que no pertenecen a ningún endpoint (salen antes de llegar a uno, ej. ruta inexistente). */
export const GLOBAL_ERRORS = ["NOT_FOUND"] as const satisfies readonly ErrorCode[];
