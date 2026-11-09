import { z } from "zod";
import { ERROR_CATALOG, ERROR_CODES, GLOBAL_ERRORS, type ErrorCode } from "../errors/catalog.js";
import type { EndpointContract } from "../contracts/define.js";

/**
 * Arma docs/api/catalogo-de-errores.md a partir del catálogo y los contratos.
 * El archivo se genera con `npm run docs:api --workspace=@cloud-grupo-22/shared` y un test
 * falla si quedó desactualizado: la documentación no se edita a mano.
 */

const esc = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");

/** Campos de primer nivel de un esquema, con su tipo y si son opcionales. */
function fields(schema: z.ZodType): string {
  const json = z.toJSONSchema(schema, { io: "input", unrepresentable: "any" }) as {
    properties?: Record<string, { type?: string; format?: string }>;
    required?: string[];
  };
  const props = Object.entries(json.properties ?? {});
  if (props.length === 0) return "—";
  return props
    .map(([name, p]) => {
      const type = p.format ?? p.type ?? "objeto";
      const optional = json.required?.includes(name) ? "" : "?";
      return `\`${name}${optional}\` (${type})`;
    })
    .join(", ");
}

export function renderApiDoc(endpoints: readonly EndpointContract[]): string {
  const usedBy = new Map<ErrorCode, string[]>();
  for (const code of GLOBAL_ERRORS) usedBy.set(code, ["cualquier pedido"]);
  for (const e of endpoints) {
    for (const code of e.errors) {
      usedBy.set(code, [...(usedBy.get(code) ?? []), `\`${e.method} ${e.path}\``]);
    }
  }

  const lines: string[] = [
    "# Catálogo de errores y contratos de la API",
    "",
    "<!-- GENERADO desde packages/shared (catálogo y contratos). No editar a mano:",
    "     npm run docs:api --workspace=@cloud-grupo-22/shared -->",
    "",
    "Toda respuesta de error usa Problem Details (RFC 9457), `Content-Type: application/problem+json`:",
    "",
    "```json",
    '{ "type": "urn:aula-clara:error:AUTH_OTP_EXPIRED", "title": "Código vencido", "status": 410,',
    '  "code": "AUTH_OTP_EXPIRED", "errors": [{ "field": "code", "code": "codeFormat" }], "retryAfterSeconds": 60 }',
    "```",
    "",
    "`errors` va solo en `VALIDATION_FAILED` (un ítem por campo, con la clave de la regla que falló) y",
    "`retryAfterSeconds` solo en los 429 cuando se conoce la espera. El cliente decide según `code`.",
    "",
    "## Errores",
    "",
    "| Código | HTTP | Título | Cuándo | Endpoints |",
    "|---|---|---|---|---|",
  ];
  for (const code of ERROR_CODES) {
    const def = ERROR_CATALOG[code];
    const where = usedBy.get(code)?.join(", ") ?? "—";
    lines.push(`| \`${code}\` | ${def.status} | ${esc(def.title)} | ${esc(def.description)} | ${where} |`);
  }

  lines.push("", "## Endpoints", "");
  for (const e of endpoints) {
    lines.push(
      `### \`${e.method} ${e.path}\``,
      "",
      `${esc(e.summary)} (\`${e.id}\`)`,
      "",
      `- **Cuerpo:** ${fields(e.body)}`,
      `- **Respuesta ${e.successStatus}:** ${fields(e.response)}`,
      "",
      "| Error | HTTP |",
      "|---|---|",
      ...e.errors.map((code) => `| \`${code}\` | ${ERROR_CATALOG[code].status} |`),
      "",
    );
  }
  return lines.join("\n");
}
