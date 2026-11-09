import { AUTH_ENDPOINTS } from "./auth.js";
import type { EndpointContract } from "./define.js";

/**
 * Todos los contratos de la API. Al sumar un módulo (materias, comisiones…), se agregan
 * acá sus endpoints: de esta lista salen la tabla de errores generada y los tests que
 * revisan que el catálogo y los contratos sean coherentes.
 */
export const ALL_ENDPOINTS: readonly EndpointContract[] = [...AUTH_ENDPOINTS];
