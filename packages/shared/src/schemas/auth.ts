import { z } from "zod";

/*
 * Esquemas de autenticación compartidos por el front (formularios) y el back (validación
 * del cuerpo de cada pedido).
 *
 * Convención: el `message` de cada regla NO es un texto para el usuario, es una clave
 * estable (ver *_ISSUES). El front traduce la clave a un texto (con voseo, versión larga
 * y corta); el back la devuelve tal cual en los errores por campo. Así un cambio de texto
 * nunca toca este paquete, y una clave nueva obliga a los dos lados a manejarla.
 */

/** Dominio de los emails de alumnos (HU-01). Docentes y autoridades usan el que les asigna un administrador. */
export const STUDENT_EMAIL_DOMAIN = "alu.frlp.utn.edu.ar";

function isEmail(value: string): boolean {
  return z.email().safeParse(value).success;
}

/**
 * Un email que parece de alumno (dominio que empieza con "alu.frlp") pero no termina en
 * el dominio completo, ej. "nombre@alu.frlp". A un docente con otro dominio no se le pide
 * @alu…, porque no aplica.
 */
export function isIncompleteStudentEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return domain.startsWith("alu.frlp") && domain !== STUDENT_EMAIL_DOMAIN;
}

/** El alta es solo para alumnos (HU-01): email válido y del dominio de alumnos. */
export function isStudentEmail(email: string): boolean {
  return isEmail(email) && email.toLowerCase().endsWith(`@${STUDENT_EMAIL_DOMAIN}`);
}

/* --------------------------------- Login --------------------------------- */

/** Claves que puede devolver la validación del login. */
export const LOGIN_ISSUES = ["emailRequired", "emailIncompleteStudent", "emailInvalid", "passwordRequired"] as const;
export type LoginIssue = (typeof LOGIN_ISSUES)[number];

const issue = <T extends string>(key: T) => ({ message: key });
/** Igual que `issue`, pero corta las reglas siguientes del campo: un campo vacío informa solo "requerido". */
const required = <T extends string>(key: T) => ({ message: key, abort: true });

/** Cuerpo de `POST /auth/login` y formulario de login (son lo mismo). */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, required<LoginIssue>("emailRequired"))
    .superRefine((email, ctx) => {
      if (isIncompleteStudentEmail(email)) {
        ctx.addIssue({ code: "custom", ...issue<LoginIssue>("emailIncompleteStudent") });
      } else if (!isEmail(email)) {
        ctx.addIssue({ code: "custom", ...issue<LoginIssue>("emailInvalid") });
      }
    }),
  password: z.string().min(1, issue<LoginIssue>("passwordRequired")),
  remember: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;

/* ------------------------------ Crear cuenta ------------------------------ */

/** Claves que puede devolver la validación de Crear cuenta. */
export const REGISTER_ISSUES = ["emailRequired", "emailNotStudent", "passwordRequired", "passwordMismatch"] as const;
export type RegisterIssue = (typeof REGISTER_ISSUES)[number];

/**
 * Cuerpo de `POST /auth/register`. La política de contraseña todavía no está definida.
 * TODO(TASK-007): sumar la política de contraseña cuando esté definida.
 */
export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, required<RegisterIssue>("emailRequired"))
    .refine(isStudentEmail, issue<RegisterIssue>("emailNotStudent")),
  password: z.string().min(1, issue<RegisterIssue>("passwordRequired")),
});

export type RegisterValues = z.infer<typeof registerSchema>;

/**
 * Formulario de Crear cuenta: el cuerpo más "Repetí la contraseña", que solo existe en el
 * cliente (no viaja al back).
 */
export const registerFormSchema = registerSchema
  .extend({ passwordConfirm: z.string() })
  .refine((v) => v.password === v.passwordConfirm, {
    ...issue<RegisterIssue>("passwordMismatch"),
    path: ["passwordConfirm"],
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

/* ----------------------- Verificación del email (OTP) ----------------------- */

/** Largo del código que se manda por email (TASK-004: Email OTP de 6 dígitos). */
export const OTP_LENGTH = 6;

/** Claves que puede devolver la validación del paso 2 (confirmar el email). */
export const VERIFY_EMAIL_ISSUES = ["emailRequired", "emailInvalid", "codeRequired", "codeFormat"] as const;
export type VerifyEmailIssue = (typeof VERIFY_EMAIL_ISSUES)[number];

const emailField = z
  .string()
  .trim()
  .min(1, required<VerifyEmailIssue>("emailRequired"))
  .refine(isEmail, issue<VerifyEmailIssue>("emailInvalid"));

/** Cuerpo de `POST /auth/verify-email` y formulario del paso 2 (el email viene del paso 1). */
export const verifyEmailSchema = z.object({
  email: emailField,
  code: z
    .string()
    .trim()
    .min(1, required<VerifyEmailIssue>("codeRequired"))
    .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), issue<VerifyEmailIssue>("codeFormat")),
});

export type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;

/** Cuerpo de `POST /auth/resend-code`. */
export const resendCodeSchema = z.object({ email: emailField });

export type ResendCodeValues = z.infer<typeof resendCodeSchema>;
