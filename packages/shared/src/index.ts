/**
 * @cloud-grupo-22/shared — contratos compartidos entre front y back.
 *
 * - schemas: esquemas de zod de los pedidos; cada regla devuelve una clave, no un texto.
 * - errors: catálogo de errores y formato de error (Problem Details, RFC 9457).
 * - contracts: contratos de endpoints (qué reciben, qué devuelven, qué errores pueden dar).
 */
export * from "./schemas/auth.js";
export * from "./errors/catalog.js";
export * from "./errors/problem.js";
export * from "./contracts/define.js";
export * from "./contracts/auth.js";
export * from "./contracts/registry.js";
export * from "./docs/api-doc.js";
