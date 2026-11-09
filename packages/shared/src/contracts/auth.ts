import { z } from "zod";
import {
  loginSchema,
  registerSchema,
  resendCodeSchema,
  verifyEmailSchema,
} from "../schemas/auth.js";
import { defineEndpoint } from "./define.js";

/*
 * Contratos de autenticación (HU-01 y HU-02). Las rutas y las respuestas correctas son
 * una propuesta del front: el back los implementa contra este archivo (TASK-014, bloque 5)
 * y, si algo cambia, se cambia acá primero.
 *
 * Contexto (TASK-004): contraseña propia, sin SSO; el email se confirma con un código de
 * 6 dígitos (Email OTP de Neon Auth). La sesión queda en una cookie que pone el back.
 */

/** Roles de la aplicación (TASK-004). */
export const USER_ROLES = ["alumno", "jefe", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const sessionUserSchema = z.object({
  email: z.email(),
  role: z.enum(USER_ROLES),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const loginEndpoint = defineEndpoint({
  id: "auth.login",
  method: "POST",
  path: "/auth/login",
  summary: "Ingresa con email y contraseña; deja la sesión en una cookie.",
  body: loginSchema,
  successStatus: 200,
  response: z.object({ user: sessionUserSchema }),
  errors: ["AUTH_INVALID_CREDENTIALS", "AUTH_EMAIL_NOT_VERIFIED", "AUTH_LOGIN_LOCKED"],
});

export const registerEndpoint = defineEndpoint({
  id: "auth.register",
  method: "POST",
  path: "/auth/register",
  summary: "Crea la cuenta de un alumno (paso 1 de 2) y le manda el código al email.",
  body: registerSchema,
  successStatus: 201,
  response: z.object({ email: z.email() }),
  errors: ["AUTH_EMAIL_DOMAIN_NOT_ALLOWED", "AUTH_EMAIL_TAKEN"],
});

export const verifyEmailEndpoint = defineEndpoint({
  id: "auth.verifyEmail",
  method: "POST",
  path: "/auth/verify-email",
  summary: "Confirma el email con el código (paso 2 de 2); deja la sesión en una cookie.",
  body: verifyEmailSchema,
  successStatus: 200,
  response: z.object({ user: sessionUserSchema }),
  errors: ["AUTH_OTP_INVALID", "AUTH_OTP_EXPIRED", "AUTH_OTP_TOO_MANY_ATTEMPTS"],
});

export const resendCodeEndpoint = defineEndpoint({
  id: "auth.resendCode",
  method: "POST",
  path: "/auth/resend-code",
  summary:
    "Manda un código nuevo e invalida el anterior. Responde igual exista o no la cuenta, para no revelar qué emails están registrados.",
  body: resendCodeSchema,
  successStatus: 202,
  response: z.object({
    /** Segundos hasta que se pueda pedir otro, si la regla está definida (TASK-007). */
    retryAfterSeconds: z.number().int().positive().optional(),
  }),
  errors: ["AUTH_OTP_RESEND_TOO_SOON"],
});

/** Todos los contratos de auth, en el orden del flujo. */
export const AUTH_ENDPOINTS = [loginEndpoint, registerEndpoint, verifyEmailEndpoint, resendCodeEndpoint] as const;
