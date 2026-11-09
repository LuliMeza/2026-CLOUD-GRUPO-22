import { describe, expect, it } from "vitest";
import {
  LOGIN_ISSUES,
  REGISTER_ISSUES,
  loginSchema,
  registerFormSchema,
  registerSchema,
} from "../src/index.js";

/** Claves de error de un resultado de zod, por campo. */
function issues(result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) {
  return (result.error?.issues ?? []).map((i) => `${i.path.join(".")}:${i.message}`);
}

describe("loginSchema", () => {
  it("acepta un login válido", () => {
    expect(loginSchema.safeParse({ email: "tiago@alu.frlp.utn.edu.ar", password: "x", remember: false }).success).toBe(true);
  });

  it("acepta el email de un docente con otro dominio", () => {
    expect(loginSchema.safeParse({ email: "docente@frlp.utn.edu.ar", password: "x", remember: true }).success).toBe(true);
  });

  it("marca el email de alumno incompleto y la contraseña vacía", () => {
    const r = loginSchema.safeParse({ email: "tiago@alu.frlp", password: "", remember: false });
    expect(issues(r)).toEqual(["email:emailIncompleteStudent", "password:passwordRequired"]);
  });

  it("marca el email vacío y el mal escrito", () => {
    expect(issues(loginSchema.safeParse({ email: " ", password: "x", remember: false }))).toEqual(["email:emailRequired"]);
    expect(issues(loginSchema.safeParse({ email: "juan@gmail", password: "x", remember: false }))).toEqual(["email:emailInvalid"]);
  });

  it("solo devuelve claves declaradas en LOGIN_ISSUES", () => {
    const r = loginSchema.safeParse({ email: "", password: "", remember: false });
    for (const i of r.error?.issues ?? []) expect(LOGIN_ISSUES).toContain(i.message);
  });
});

describe("registerSchema / registerFormSchema", () => {
  it("un email vacío informa solo que es obligatorio", () => {
    expect(issues(registerSchema.safeParse({ email: "", password: "x" }))).toEqual(["email:emailRequired"]);
  });

  it("rechaza un email que no es de alumno", () => {
    expect(issues(registerSchema.safeParse({ email: "lucas@gmail.com", password: "x" }))).toEqual(["email:emailNotStudent"]);
  });

  it("el cuerpo del pedido no lleva la confirmación", () => {
    const r = registerSchema.safeParse({ email: "tiago@alu.frlp.utn.edu.ar", password: "x", passwordConfirm: "y" });
    expect(r.success && Object.keys(r.data)).toEqual(["email", "password"]);
  });

  it("el formulario exige que las contraseñas coincidan", () => {
    const r = registerFormSchema.safeParse({ email: "tiago@alu.frlp.utn.edu.ar", password: "abc", passwordConfirm: "abd" });
    expect(issues(r)).toEqual(["passwordConfirm:passwordMismatch"]);
    for (const i of r.error?.issues ?? []) expect(REGISTER_ISSUES).toContain(i.message);
  });
});
