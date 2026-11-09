import {
  parseProblem,
  problem,
  type EndpointBody,
  type EndpointContract,
  type EndpointErrorCode,
  type EndpointResponse,
  type Problem,
} from "@cloud-grupo-22/shared";

/**
 * Cliente HTTP único: todo pedido a la API pasa por `callEndpoint(contrato, cuerpo)`.
 *
 * - El cuerpo y la respuesta salen tipados del contrato de @cloud-grupo-22/shared.
 * - Un error de la API llega como Problem Details; se devuelve su `code`, que solo puede
 *   ser uno de los declarados en el contrato. Si el back manda algo fuera de contrato (otro
 *   código, un HTML de un proxy, un JSON que no es Problem), se trata como INTERNAL_ERROR y
 *   se avisa en la consola de desarrollo.
 * - Sin respuesta (sin red, CORS, servidor caído) devuelve NETWORK_ERROR, que no es del
 *   catálogo porque no lo manda el back.
 */

/** Errores que arma el cliente, no el back. */
export const CLIENT_ERROR_CODES = ["NETWORK_ERROR"] as const;
export type ClientErrorCode = (typeof CLIENT_ERROR_CODES)[number];

export type ApiResult<C extends EndpointContract> =
  | { ok: true; data: EndpointResponse<C> }
  | { ok: false; code: EndpointErrorCode<C> | ClientErrorCode; problem: Problem | null };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const isDev = process.env.NODE_ENV !== "production";

function outOfContract<C extends EndpointContract>(contract: C, reason: string, detail?: unknown): ApiResult<C> {
  if (isDev) console.error(`[api] ${contract.id}: respuesta fuera de contrato (${reason})`, detail);
  return { ok: false, code: "INTERNAL_ERROR", problem: problem("INTERNAL_ERROR") };
}

export async function callEndpoint<C extends EndpointContract>(contract: C, body: EndpointBody<C>): Promise<ApiResult<C>> {
  // Mocks solo si se pidieron explícitamente (NEXT_PUBLIC_API_MOCKING=enabled). Sin la
  // variable, el chunk de msw queda en el build pero nunca se descarga.
  if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
    const { enableMocking } = await import("@/mocks");
    await enableMocking();
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${contract.path}`, {
      method: contract.method,
      headers: { "Content-Type": "application/json", Accept: "application/json, application/problem+json" },
      credentials: "include",
      body: contract.method === "GET" ? undefined : JSON.stringify(body),
    });
  } catch {
    return { ok: false, code: "NETWORK_ERROR", problem: null };
  }

  const json: unknown = await response.json().catch(() => null);

  if (response.ok) {
    const parsed = contract.response.safeParse(json);
    if (!parsed.success) return outOfContract(contract, "respuesta correcta con otra forma", parsed.error.issues);
    return { ok: true, data: parsed.data as EndpointResponse<C> };
  }

  const p = parseProblem(json);
  if (!p) return outOfContract(contract, `status ${response.status} sin Problem Details`, json);
  if (!(contract.errors as readonly string[]).includes(p.code)) {
    return outOfContract(contract, `código ${p.code} no declarado en el contrato`, p);
  }
  return { ok: false, code: p.code as EndpointErrorCode<C>, problem: p };
}
