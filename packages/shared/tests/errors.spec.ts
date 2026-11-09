import { describe, expect, it } from "vitest";
import {
  ERROR_CATALOG,
  ERROR_CODES,
  loginSchema,
  parseProblem,
  problem,
  problemFromZodError,
  problemSchema,
} from "../src/index.js";

describe("catálogo de errores", () => {
  it("cada código es MAYÚSCULAS_CON_GUIONES y tiene status de error, título y descripción", () => {
    for (const code of ERROR_CODES) {
      const def = ERROR_CATALOG[code];
      expect(code).toMatch(/^[A-Z][A-Z0-9_]+$/);
      expect(def.status).toBeGreaterThanOrEqual(400);
      expect(def.status).toBeLessThan(600);
      expect(def.title.length).toBeGreaterThan(0);
      expect(def.description.length).toBeGreaterThan(0);
    }
  });
});

describe("problem()", () => {
  it("arma el Problem desde el catálogo y valida contra el esquema", () => {
    const p = problem("AUTH_OTP_TOO_MANY_ATTEMPTS", { retryAfterSeconds: 60 });
    expect(p).toEqual({
      type: "urn:aula-clara:error:AUTH_OTP_TOO_MANY_ATTEMPTS",
      title: "Demasiados intentos de verificación",
      status: 429,
      code: "AUTH_OTP_TOO_MANY_ATTEMPTS",
      retryAfterSeconds: 60,
    });
    expect(problemSchema.safeParse(p).success).toBe(true);
  });

  it("no agrega extensiones vacías", () => {
    expect(problem("INTERNAL_ERROR", { errors: [] })).not.toHaveProperty("errors");
  });
});

describe("problemFromZodError()", () => {
  it("convierte una validación fallida en VALIDATION_FAILED con un ítem por campo", () => {
    const r = loginSchema.safeParse({ email: "", password: "", remember: false });
    expect(r.success).toBe(false);
    const p = problemFromZodError(r.error!);
    expect(p.status).toBe(400);
    expect(p.code).toBe("VALIDATION_FAILED");
    expect(p.errors).toEqual([
      { field: "email", code: "emailRequired" },
      { field: "password", code: "passwordRequired" },
    ]);
  });
});

describe("parseProblem()", () => {
  it("reconoce un Problem válido", () => {
    expect(parseProblem(problem("AUTH_EMAIL_TAKEN"))?.code).toBe("AUTH_EMAIL_TAKEN");
  });

  it("devuelve null ante un cuerpo que no es Problem o un código fuera del catálogo", () => {
    expect(parseProblem({ message: "Internal Server Error" })).toBeNull();
    expect(parseProblem({ ...problem("AUTH_EMAIL_TAKEN"), code: "NO_EXISTE" })).toBeNull();
    expect(parseProblem(null)).toBeNull();
  });
});
