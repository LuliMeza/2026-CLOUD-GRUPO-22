import { OTP_LENGTH, type VerifyEmailIssue } from "@cloud-grupo-22/shared";
import { API_ERROR_MESSAGES } from "@/messages/api-errors";

/*
 * Textos de los errores del campo "Código de verificación" (paso 2 del registro). El esquema
 * vive en @cloud-grupo-22/shared y devuelve claves (VerifyEmailIssue); acá está el texto de cada
 * una. `codeInvalid` no es del esquema: es AUTH_OTP_INVALID de la API, que el diseño muestra en
 * el campo (Registro-Paso2-Incorrecto).
 * Los marcados "PENDIENTE" no están en el diseño (ver TASK-013).
 */
const otpInvalid = API_ERROR_MESSAGES.AUTH_OTP_INVALID;

export type VerifyCodeIssue = VerifyEmailIssue | "codeInvalid";

export const VERIFY_EMAIL_MESSAGES = {
  // El email no es un campo del paso 2 (viene del paso 1); estos no deberían verse.
  emailRequired: "Falta el email. Volvé al paso 1.",
  emailInvalid: "El email no es válido. Volvé al paso 1.",
  // PENDIENTE de diseño
  codeRequired: "Ingresá el código que te mandamos.",
  // PENDIENTE de diseño
  codeFormat: `El código tiene ${OTP_LENGTH} números.`,
  codeInvalid: `${otpInvalid.title}. ${otpInvalid.description}`,
} as const satisfies Record<VerifyCodeIssue, string>;
