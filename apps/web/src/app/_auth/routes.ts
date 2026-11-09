// Rutas de las pantallas de autenticación.
// TODO(rutas): recuperar contraseña todavía no existe (TASK-008).
export const LOGIN_HREF = "/login";
export const REGISTER_HREF = "/registro";
export const FORGOT_PASSWORD_HREF = "/recuperar-contrasena";
// TODO(rutas): destino después de ingresar (depende del rol: alumno / jefe / admin).
export const AFTER_LOGIN_HREF = "/";

/** Parámetros de /registro para abrir directo el paso 2 (confirmar el email). */
export const REGISTER_STEP_PARAM = "paso";
export const REGISTER_EMAIL_PARAM = "email";
export const REGISTER_RESEND_PARAM = "reenviar";

/**
 * Paso 2 del registro (confirmar el email con el código) para `email`. No es una página aparte:
 * es /registro con la tarjeta ya en el paso 2.
 * `resend`: pide un código nuevo al llegar (botón "Reenviar código" del login).
 */
export function verifyEmailHref(email: string, { resend = false }: { resend?: boolean } = {}): string {
  const params = new URLSearchParams({ [REGISTER_STEP_PARAM]: "2", [REGISTER_EMAIL_PARAM]: email });
  if (resend) params.set(REGISTER_RESEND_PARAM, "1");
  return `${REGISTER_HREF}?${params.toString()}`;
}
