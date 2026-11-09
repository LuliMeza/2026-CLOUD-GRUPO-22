import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, expectTypeOf, it } from "vitest";
import {
  ALL_ENDPOINTS,
  COMMON_ERRORS,
  ERROR_CATALOG,
  ERROR_CODES,
  GLOBAL_ERRORS,
  LOGIN_ISSUES,
  REGISTER_ISSUES,
  VERIFY_EMAIL_ISSUES,
  loginEndpoint,
  problemFromZodError,
  registerEndpoint,
  renderApiDoc,
  resendCodeEndpoint,
  verifyEmailEndpoint,
  type EndpointBody,
  type EndpointErrorCode,
  type EndpointResponse,
} from "../src/index.js";

describe("contratos", () => {
  it("cada endpoint tiene id y método + ruta únicos", () => {
    const ids = ALL_ENDPOINTS.map((e) => e.id);
    const routes = ALL_ENDPOINTS.map((e) => `${e.method} ${e.path}`);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it("solo declara errores del catálogo, sin repetir, e incluye los comunes", () => {
    for (const e of ALL_ENDPOINTS) {
      for (const code of e.errors) expect(ERROR_CATALOG).toHaveProperty(code);
      expect(new Set(e.errors).size).toBe(e.errors.length);
      for (const common of COMMON_ERRORS) expect(e.errors).toContain(common);
      expect(e.successStatus).toBeGreaterThanOrEqual(200);
      expect(e.successStatus).toBeLessThan(300);
    }
  });

  it("no hay códigos en el catálogo que ningún endpoint use (salvo los globales)", () => {
    const used = new Set<string>([...ALL_ENDPOINTS.flatMap((e) => [...e.errors]), ...GLOBAL_ERRORS]);
    expect(ERROR_CODES.filter((code) => !used.has(code))).toEqual([]);
  });

  it("la validación de cada cuerpo solo produce claves declaradas", () => {
    const cases = [
      [loginEndpoint, { email: "", password: "", remember: false }, LOGIN_ISSUES],
      [registerEndpoint, { email: "lucas@gmail.com", password: "" }, REGISTER_ISSUES],
      [verifyEmailEndpoint, { email: "x", code: "12a" }, VERIFY_EMAIL_ISSUES],
      [resendCodeEndpoint, { email: "" }, VERIFY_EMAIL_ISSUES],
    ] as const;
    for (const [endpoint, body, keys] of cases) {
      const r = endpoint.body.safeParse(body);
      expect(r.success, endpoint.id).toBe(false);
      for (const fe of problemFromZodError(r.error!).errors ?? []) expect(keys as readonly string[]).toContain(fe.code);
    }
  });

  it("el código del paso 2 son 6 dígitos", () => {
    const ok = verifyEmailEndpoint.body.safeParse({ email: "tiago@alu.frlp.utn.edu.ar", code: "482913" });
    const bad = verifyEmailEndpoint.body.safeParse({ email: "tiago@alu.frlp.utn.edu.ar", code: "48291" });
    expect(ok.success).toBe(true);
    expect(bad.error?.issues.map((i) => i.message)).toEqual(["codeFormat"]);
  });

  it("los tipos salen del contrato", () => {
    expectTypeOf<EndpointErrorCode<typeof verifyEmailEndpoint>>().toEqualTypeOf<
      "VALIDATION_FAILED" | "INTERNAL_ERROR" | "AUTH_OTP_INVALID" | "AUTH_OTP_EXPIRED" | "AUTH_OTP_TOO_MANY_ATTEMPTS"
    >();
    expectTypeOf<EndpointBody<typeof registerEndpoint>>().toEqualTypeOf<{ email: string; password: string }>();
    expectTypeOf<EndpointResponse<typeof loginEndpoint>["user"]["role"]>().toEqualTypeOf<"alumno" | "jefe" | "admin">();
  });
});

describe("docs/api/catalogo-de-errores.md", () => {
  it("está al día con el catálogo y los contratos", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const committed = readFileSync(resolve(here, "../../../docs/api/catalogo-de-errores.md"), "utf8");
    expect(committed, "regenerar con: npm run docs:api --workspace=@cloud-grupo-22/shared").toBe(
      renderApiDoc(ALL_ENDPOINTS) + "\n",
    );
  });
});
