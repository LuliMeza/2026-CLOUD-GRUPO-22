import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema, STUDENT_EMAIL_DOMAIN } from "@cloud-grupo-22/shared";

// Comprueba que el back resuelve el paquete compartido (npm workspaces + ESM) y usa los
// mismos esquemas que el front. Los contratos completos llegan en TASK-014, bloques 3 y 5.
describe("@cloud-grupo-22/shared desde el back", () => {
  it("expone los esquemas de auth", () => {
    expect(STUDENT_EMAIL_DOMAIN).toBe("alu.frlp.utn.edu.ar");
    expect(loginSchema.safeParse({ email: "tiago@alu.frlp.utn.edu.ar", password: "x", remember: false }).success).toBe(true);
  });

  it("rechaza con la misma clave que ve el front", () => {
    const r = registerSchema.safeParse({ email: "lucas@gmail.com", password: "x" });
    expect(r.error?.issues.map((i) => i.message)).toEqual(["emailNotStudent"]);
  });
});
