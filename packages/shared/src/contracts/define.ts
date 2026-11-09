import type { z } from "zod";
import { COMMON_ERRORS, type ErrorCode } from "../errors/catalog.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Contrato de un endpoint: qué recibe, qué devuelve si sale bien y qué errores del
 * catálogo puede devolver. Lo usan:
 * - el back, para validar el cuerpo y no devolver un error que no está declarado;
 * - el front, para tipar el cliente HTTP y saber qué casos tiene que manejar;
 * - los mocks y los tests, para no inventar respuestas;
 * - la tabla generada docs/api/catalogo-de-errores.md.
 */
export interface EndpointContract<
  TBody extends z.ZodType = z.ZodType,
  TResponse extends z.ZodType = z.ZodType,
  TErrors extends readonly ErrorCode[] = readonly ErrorCode[],
> {
  /** Identificador estable, ej. `auth.login`. */
  id: string;
  method: HttpMethod;
  /** Ruta relativa a la URL de la API, ej. `/auth/login`. */
  path: string;
  /** Qué hace, en una línea. */
  summary: string;
  body: TBody;
  /** Status HTTP de la respuesta correcta. */
  successStatus: number;
  response: TResponse;
  /** Errores del catálogo que puede devolver, incluidos los comunes (VALIDATION_FAILED, INTERNAL_ERROR). */
  errors: readonly [...typeof COMMON_ERRORS, ...TErrors];
}

/**
 * Define un contrato. Los errores comunes se agregan solos, así cada contrato lista solo
 * lo propio del endpoint.
 */
export function defineEndpoint<
  TBody extends z.ZodType,
  TResponse extends z.ZodType,
  const TErrors extends readonly ErrorCode[],
>(definition: Omit<EndpointContract<TBody, TResponse, TErrors>, "errors"> & { errors: TErrors }) {
  return {
    ...definition,
    errors: [...COMMON_ERRORS, ...definition.errors] as const,
  } as EndpointContract<TBody, TResponse, TErrors>;
}

/** Cuerpo que acepta el endpoint. */
export type EndpointBody<C extends EndpointContract> = z.input<C["body"]>;
/** Respuesta correcta del endpoint. */
export type EndpointResponse<C extends EndpointContract> = z.output<C["response"]>;
/** Códigos de error que puede devolver el endpoint. */
export type EndpointErrorCode<C extends EndpointContract> = C["errors"][number];
