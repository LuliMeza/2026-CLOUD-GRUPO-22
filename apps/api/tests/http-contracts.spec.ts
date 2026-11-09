import { Body, Controller, Post, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ERROR_CATALOG,
  ERROR_CODES,
  PROBLEM_CONTENT_TYPE,
  defineEndpoint,
  loginEndpoint,
  problemSchema,
  type EndpointBody,
  type ErrorCode,
} from "@cloud-grupo-22/shared";
import { z } from "zod";
import { AppError, ContractRoute, HttpModule } from "../src/http/index.js";

/*
 * Prueba el manejo HTTP común contra un servidor real (Nest + Express en un puerto libre):
 * formato Problem Details, status del catálogo y cumplimiento de contratos. Usa un
 * controlador de prueba porque los endpoints de auth todavía no existen; cuando existan,
 * sus tests usan este mismo mecanismo.
 */

// Contrato de prueba con un error declarado y otro que el handler devuelve sin declarar.
const demoEndpoint = defineEndpoint({
  id: "test.demo",
  method: "POST",
  path: "/__test/demo",
  summary: "Endpoint de prueba",
  body: z.object({ name: z.string().min(1, { message: "nameRequired" }), mode: z.string() }),
  successStatus: 201,
  response: z.object({ greeting: z.string() }),
  errors: ["AUTH_EMAIL_TAKEN", "AUTH_LOGIN_LOCKED"],
});

@Controller()
class DemoController {
  @ContractRoute(demoEndpoint)
  demo(@Body() body: EndpointBody<typeof demoEndpoint>) {
    switch (body.mode) {
      case "declared":
        throw new AppError("AUTH_EMAIL_TAKEN");
      case "retry":
        throw new AppError("AUTH_LOGIN_LOCKED", { retryAfterSeconds: 120 });
      case "undeclared":
        throw new AppError("AUTH_OTP_EXPIRED");
      case "crash":
        throw new Error("secreto interno que no tiene que salir");
      case "extra-fields":
        return { greeting: `hola ${body.name}`, passwordHash: "no-debería-salir" };
      case "bad-response":
        return { greeting: 42 };
      default:
        return { greeting: `hola ${body.name}`, echo: body };
    }
  }

  // Ruta sin contrato: tira el código que le pidan, para probar el status de cada uno.
  @Post("/__test/throw")
  throwCode(@Body() body: { code: ErrorCode }) {
    throw new AppError(body.code);
  }

  // Usa el contrato real de login para ver la validación con las claves compartidas.
  @ContractRoute(loginEndpoint)
  login() {
    return { user: { email: "tiago@alu.frlp.utn.edu.ar", role: "alumno" } };
  }
}

let app: INestApplication;
let base: string;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [HttpModule], controllers: [DemoController] }).compile();
  // logger: false porque los INTERNAL_ERROR esperados se registran y acá no hace falta verlos.
  app = moduleRef.createNestApplication({ logger: false });
  await app.listen(0);
  base = await app.getUrl();
});

afterAll(async () => {
  await app.close();
});

async function post(path: string, body: unknown, raw = false) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw ? (body as string) : JSON.stringify(body),
  });
  return { response, json: (await response.json()) as Record<string, unknown> };
}

function expectProblem(response: Response, json: unknown, code: ErrorCode) {
  expect(response.status).toBe(ERROR_CATALOG[code].status);
  expect(response.headers.get("content-type")).toContain(PROBLEM_CONTENT_TYPE);
  const parsed = problemSchema.parse(json);
  expect(parsed.code).toBe(code);
  return parsed;
}

describe("rutas con contrato", () => {
  it("responde con el status de éxito del contrato y el cuerpo validado", async () => {
    const { response, json } = await post("/__test/demo", { name: "Tiago", mode: "ok", sobra: true });
    expect(response.status).toBe(201);
    expect(json).toEqual({ greeting: "hola Tiago" });
  });

  it("valida el cuerpo y devuelve VALIDATION_FAILED con la clave por campo", async () => {
    const { response, json } = await post("/__test/demo", { name: "", mode: "ok" });
    const p = expectProblem(response, json, "VALIDATION_FAILED");
    expect(p.errors).toEqual([{ field: "name", code: "nameRequired" }]);
    expect(p.instance).toBe("/__test/demo");
  });

  it("usa las mismas claves que el front con los esquemas compartidos", async () => {
    const { response, json } = await post("/auth/login", { email: "tiago@alu.frlp", password: "", remember: false });
    const p = expectProblem(response, json, "VALIDATION_FAILED");
    expect(p.errors).toEqual([
      { field: "email", code: "emailIncompleteStudent" },
      { field: "password", code: "passwordRequired" },
    ]);
  });

  it("devuelve un error declarado con su status del catálogo", async () => {
    const { response, json } = await post("/__test/demo", { name: "x", mode: "declared" });
    expectProblem(response, json, "AUTH_EMAIL_TAKEN");
  });

  it("manda Retry-After y retryAfterSeconds cuando hay espera", async () => {
    const { response, json } = await post("/__test/demo", { name: "x", mode: "retry" });
    const p = expectProblem(response, json, "AUTH_LOGIN_LOCKED");
    expect(p.retryAfterSeconds).toBe(120);
    expect(response.headers.get("retry-after")).toBe("120");
  });

  it("convierte un error no declarado en INTERNAL_ERROR", async () => {
    const { response, json } = await post("/__test/demo", { name: "x", mode: "undeclared" });
    expectProblem(response, json, "INTERNAL_ERROR");
  });

  it("no filtra el mensaje de un error no controlado", async () => {
    const { response, json } = await post("/__test/demo", { name: "x", mode: "crash" });
    expectProblem(response, json, "INTERNAL_ERROR");
    expect(JSON.stringify(json)).not.toContain("secreto");
  });

  it("saca de la respuesta los campos que el contrato no declara", async () => {
    const { json } = await post("/__test/demo", { name: "Tiago", mode: "extra-fields" });
    expect(json).toEqual({ greeting: "hola Tiago" });
  });

  it("si la respuesta no cumple el contrato, INTERNAL_ERROR", async () => {
    const { response, json } = await post("/__test/demo", { name: "x", mode: "bad-response" });
    expectProblem(response, json, "INTERNAL_ERROR");
  });
});

describe("errores fuera de las rutas", () => {
  it("ruta inexistente → NOT_FOUND", async () => {
    const { response, json } = await post("/no-existe", {});
    expectProblem(response, json, "NOT_FOUND");
  });

  it("JSON mal formado → VALIDATION_FAILED", async () => {
    const { response, json } = await post("/__test/demo", "{ esto no es json", true);
    expectProblem(response, json, "VALIDATION_FAILED");
  });
});

describe("catálogo completo", () => {
  it.each(ERROR_CODES)("%s sale con su status y en formato Problem Details", async (code) => {
    const { response, json } = await post("/__test/throw", { code });
    const p = expectProblem(response, json, code);
    expect(p.title).toBe(ERROR_CATALOG[code].title);
    expect(p.type).toBe(`urn:aula-clara:error:${code}`);
  });
});
