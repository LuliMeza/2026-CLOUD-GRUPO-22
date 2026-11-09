import { z } from "zod";
import { ERROR_CATALOG, ERROR_CODES, type ErrorCode } from "./catalog.js";

/**
 * Formato de toda respuesta de error de la API: Problem Details (RFC 9457), con
 * `Content-Type: application/problem+json`. Sobre los campos del estándar suma tres
 * extensiones:
 * - `code`: el código del catálogo (lo que el cliente usa para decidir).
 * - `errors`: errores por campo, solo en VALIDATION_FAILED (y en los que el back quiera
 *   señalar un campo puntual).
 * - `retryAfterSeconds`: espera en segundos, en los errores 429 cuando se conoce.
 */
export const PROBLEM_CONTENT_TYPE = "application/problem+json";

/** URI del tipo de error. Es un identificador (URN), no una página. */
export const problemType = (code: ErrorCode) => `urn:aula-clara:error:${code}`;

export const fieldErrorSchema = z.object({
  /** Ruta del campo con puntos, ej. `email` o `items.0.name`. */
  field: z.string(),
  /** Clave de la regla que falló (ej. `emailRequired`). La traduce el cliente. */
  code: z.string(),
});
export type FieldError = z.infer<typeof fieldErrorSchema>;

export const problemSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int().min(400).max(599),
  detail: z.string().optional(),
  instance: z.string().optional(),
  code: z.enum(ERROR_CODES),
  errors: z.array(fieldErrorSchema).optional(),
  retryAfterSeconds: z.number().int().positive().optional(),
});
export type Problem = z.infer<typeof problemSchema>;

export interface ProblemExtras {
  detail?: string;
  instance?: string;
  errors?: FieldError[];
  retryAfterSeconds?: number;
}

/** Arma el Problem de un código: status, título y tipo salen del catálogo. */
export function problem(code: ErrorCode, extras: ProblemExtras = {}): Problem {
  const def = ERROR_CATALOG[code];
  const out: Problem = { type: problemType(code), title: def.title, status: def.status, code };
  if (extras.detail !== undefined) out.detail = extras.detail;
  if (extras.instance !== undefined) out.instance = extras.instance;
  if (extras.errors !== undefined && extras.errors.length > 0) out.errors = extras.errors;
  if (extras.retryAfterSeconds !== undefined) out.retryAfterSeconds = extras.retryAfterSeconds;
  return out;
}

/** Convierte un error de validación de zod en VALIDATION_FAILED, con un ítem por campo. */
export function problemFromZodError(error: z.ZodError): Problem {
  const errors = error.issues.map((issue) => ({
    field: issue.path.map(String).join("."),
    code: issue.message,
  }));
  return problem("VALIDATION_FAILED", { errors });
}

/** Lee un cuerpo de respuesta como Problem; devuelve null si no tiene ese formato. */
export function parseProblem(body: unknown): Problem | null {
  const result = problemSchema.safeParse(body);
  return result.success ? result.data : null;
}
