import { delay, http, HttpResponse } from "msw";
import {
  loginEndpoint,
  PROBLEM_CONTENT_TYPE,
  problem,
  problemFromZodError,
  registerEndpoint,
  resendCodeEndpoint,
  verifyEmailEndpoint,
  type EndpointBody,
  type EndpointContract,
  type EndpointErrorCode,
  type EndpointResponse,
  type Problem,
  type ProblemExtras,
} from "@cloud-grupo-22/shared";

/**
 * API simulada, SOLO para desarrollo (NEXT_PUBLIC_API_MOCKING=enabled).
 *
 * Cada handler sale de un contrato de @cloud-grupo-22/shared: misma ruta, valida el cuerpo
 * con el mismo esquema (y responde VALIDATION_FAILED como el back), y solo puede responder
 * con la forma de respuesta del contrato o con uno de sus errores declarados — un código que
 * no está en el contrato no compila.
 *
 * Qué email o código dispara cada caso (la parte antes de @ sirve con cualquier dominio):
 *
 * LOGIN
 *   sin-verificar@…  → AUTH_EMAIL_NOT_VERIFIED
 *   bloqueado@…      → AUTH_LOGIN_LOCKED
 *   caido@…          → INTERNAL_ERROR
 *   otro             → ok con la contraseña "aulaclara"; si no, AUTH_INVALID_CREDENTIALS
 *
 * CREAR CUENTA (el cliente ya rechaza emails que no son @alu.frlp.utn.edu.ar)
 *   existe@…         → AUTH_EMAIL_TAKEN
 *   dominio@…        → AUTH_EMAIL_DOMAIN_NOT_ALLOWED (el back rechaza el dominio)
 *   caido@…          → INTERNAL_ERROR
 *   otro             → 201
 *
 * CONFIRMAR EMAIL (paso 2 del registro: /registro?paso=2&email=…)
 *   código 123456    → ok
 *   código 000000    → AUTH_OTP_EXPIRED
 *   bloqueado@…      → AUTH_OTP_TOO_MANY_ATTEMPTS sin espera (el diseño muestra [tiempo de espera])
 *   otro código      → AUTH_OTP_INVALID; al 5.º intento, AUTH_OTP_TOO_MANY_ATTEMPTS con 10 min de espera
 *
 * REENVIAR CÓDIGO
 *   espera@…         → AUTH_OTP_RESEND_TOO_SOON (con espera de 45 s)
 *   otro             → 202, se puede pedir otro en 60 s
 *
 * La demora deja ver los estados de carga.
 */
export const MOCK_PASSWORD = "aulaclara";
export const MOCK_OTP_OK = "123456";
export const MOCK_OTP_EXPIRED = "000000";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type MockReply<C extends EndpointContract> =
  | { ok: true; data: EndpointResponse<C> }
  | { ok: false; code: EndpointErrorCode<C>; extras?: ProblemExtras };

const ok = <C extends EndpointContract>(data: EndpointResponse<C>): MockReply<C> => ({ ok: true, data });

function problemResponse(p: Problem) {
  const headers: Record<string, string> = { "Content-Type": PROBLEM_CONTENT_TYPE };
  if (p.retryAfterSeconds) headers["Retry-After"] = String(p.retryAfterSeconds);
  return HttpResponse.json(p, { status: p.status, headers });
}

const METHODS = { GET: http.get, POST: http.post, PUT: http.put, PATCH: http.patch, DELETE: http.delete };

/** Handler de msw armado desde un contrato. */
function mockEndpoint<C extends EndpointContract>(
  contract: C,
  resolve: (body: EndpointBody<C>) => MockReply<C>,
) {
  return METHODS[contract.method](`${API_URL}${contract.path}`, async ({ request }) => {
    await delay(1200);
    const raw: unknown = await request.json().catch(() => ({}));
    const parsed = contract.body.safeParse(raw);
    if (!parsed.success) return problemResponse(problemFromZodError(parsed.error));

    const reply = resolve(parsed.data as EndpointBody<C>);
    if (reply.ok) return HttpResponse.json(contract.response.parse(reply.data) as Record<string, unknown>, { status: contract.successStatus });
    return problemResponse(problem(reply.code, reply.extras));
  });
}

const userOf = (email: string) => email.split("@")[0]?.toLowerCase() ?? "";

/** Intentos fallidos de código por email (en memoria, se reinicia al recargar). */
const otpAttempts = new Map<string, number>();
const OTP_MAX_ATTEMPTS = 5;

export const handlers = [
  mockEndpoint(loginEndpoint, ({ email, password }) => {
    switch (userOf(email)) {
      case "sin-verificar":
        return { ok: false, code: "AUTH_EMAIL_NOT_VERIFIED" };
      case "bloqueado":
        return { ok: false, code: "AUTH_LOGIN_LOCKED" };
      case "caido":
        return { ok: false, code: "INTERNAL_ERROR" };
    }
    if (password !== MOCK_PASSWORD) return { ok: false, code: "AUTH_INVALID_CREDENTIALS" };
    return ok({ user: { email, role: "alumno" } });
  }),

  mockEndpoint(registerEndpoint, ({ email }) => {
    switch (userOf(email)) {
      case "existe":
        return { ok: false, code: "AUTH_EMAIL_TAKEN" };
      case "dominio":
        return { ok: false, code: "AUTH_EMAIL_DOMAIN_NOT_ALLOWED" };
      case "caido":
        return { ok: false, code: "INTERNAL_ERROR" };
    }
    return ok({ email });
  }),

  mockEndpoint(verifyEmailEndpoint, ({ email, code }) => {
    if (userOf(email) === "bloqueado") return { ok: false, code: "AUTH_OTP_TOO_MANY_ATTEMPTS" };
    if (code === MOCK_OTP_EXPIRED) return { ok: false, code: "AUTH_OTP_EXPIRED" };
    if (code === MOCK_OTP_OK) {
      otpAttempts.delete(email);
      return ok({ user: { email, role: "alumno" } });
    }
    const attempts = (otpAttempts.get(email) ?? 0) + 1;
    otpAttempts.set(email, attempts);
    return attempts >= OTP_MAX_ATTEMPTS
      ? { ok: false, code: "AUTH_OTP_TOO_MANY_ATTEMPTS", extras: { retryAfterSeconds: 600 } }
      : { ok: false, code: "AUTH_OTP_INVALID" };
  }),

  mockEndpoint(resendCodeEndpoint, ({ email }) => {
    if (userOf(email) === "espera") return { ok: false, code: "AUTH_OTP_RESEND_TOO_SOON", extras: { retryAfterSeconds: 45 } };
    otpAttempts.delete(email);
    return ok({ retryAfterSeconds: 60 });
  }),
];
