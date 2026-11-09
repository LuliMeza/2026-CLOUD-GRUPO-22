import { ERROR_CATALOG, type ErrorCode, type ProblemExtras } from "@cloud-grupo-22/shared";

/**
 * Error de dominio de la API. Se lanza con un código del catálogo de @cloud-grupo-22/shared:
 *
 *   throw new AppError("AUTH_EMAIL_TAKEN");
 *   throw new AppError("AUTH_LOGIN_LOCKED", { retryAfterSeconds: 300 });
 *
 * El status HTTP, el título y el formato de la respuesta (Problem Details) los pone
 * ProblemDetailsFilter a partir del catálogo; el código no decide nada de eso. Si la ruta
 * tiene contrato (@ContractRoute) y el código no está declarado en él, sale INTERNAL_ERROR.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly extras: ProblemExtras;

  constructor(code: ErrorCode, extras: ProblemExtras = {}) {
    super(`${code}: ${ERROR_CATALOG[code].title}`);
    this.name = "AppError";
    this.code = code;
    this.extras = extras;
  }
}
