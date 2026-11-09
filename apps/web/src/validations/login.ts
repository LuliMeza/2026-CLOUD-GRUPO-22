import { STUDENT_EMAIL_DOMAIN, type LoginIssue } from "@cloud-grupo-22/shared";

/*
 * Textos de los errores de validación del login. El esquema vive en
 * @cloud-grupo-22/shared (lo usa también el back) y devuelve claves (LoginIssue);
 * acá está el texto de cada una. `satisfies Record<LoginIssue, …>` hace que una clave
 * nueva en el esquema sin texto acá no compile.
 * Los marcados "PENDIENTE" no están en el diseño (ver TASK-012).
 */
export const LOGIN_MESSAGES = {
  // PENDIENTE de diseño: el diseño no muestra el email vacío.
  emailRequired: "Ingresá tu email.",
  emailIncompleteStudent: `El email parece incompleto. Revisá que termine en @${STUDENT_EMAIL_DOMAIN}.`,
  // PENDIENTE de diseño: email con formato inválido que no es de alumno.
  emailInvalid: "El email parece incompleto. Revisá que esté bien escrito.",
  passwordRequired: "Ingresá tu contraseña.",
} as const satisfies Record<LoginIssue, string>;

/** Versión corta (mobile) de los textos que la tienen en el diseño. */
export const LOGIN_MESSAGES_SHORT: Partial<Record<LoginIssue, string>> = {
  emailIncompleteStudent: `El email parece incompleto. Tiene que terminar en @${STUDENT_EMAIL_DOMAIN}.`,
};
