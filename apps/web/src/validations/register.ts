import { STUDENT_EMAIL_DOMAIN, type RegisterIssue } from "@cloud-grupo-22/shared";

/*
 * Textos de los errores de validación de Crear cuenta. El esquema vive en
 * @cloud-grupo-22/shared y devuelve claves (RegisterIssue); acá está el texto de cada una.
 * Los marcados "PENDIENTE" no están en el diseño (ver TASK-013).
 */
export const REGISTER_MESSAGES = {
  // PENDIENTE de diseño
  emailRequired: "Ingresá tu email.",
  emailNotStudent: `Solo podés registrarte con tu email de alumno, el que termina en @${STUDENT_EMAIL_DOMAIN}.`,
  // PENDIENTE de diseño
  passwordRequired: "Elegí una contraseña.",
  // PENDIENTE de diseño
  passwordMismatch: "Las contraseñas no coinciden.",
} as const satisfies Record<RegisterIssue, string>;

/** Versión corta (mobile) de los textos que la tienen en el diseño. */
export const REGISTER_MESSAGES_SHORT: Partial<Record<RegisterIssue, string>> = {
  emailNotStudent: `Solo podés registrarte con tu email de alumno (@${STUDENT_EMAIL_DOMAIN}).`,
};
