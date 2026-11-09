import type { ReactNode } from "react";
import type { AlertTone } from "@/components";
import { PendingText } from "@/components";
import type { ErrorCode } from "@cloud-grupo-22/shared";
import type { ClientErrorCode } from "@/services/api";

/**
 * Textos de los errores de la API: uno por código del catálogo (@cloud-grupo-22/shared)
 * más los del cliente (NETWORK_ERROR). `satisfies Record<…>` hace que un código nuevo
 * en el catálogo sin texto acá rompa el build del front.
 *
 * Es el texto por defecto de cada error. Una pantalla puede cambiar el título si el
 * contexto lo pide (ej. "No pudimos ingresar") y suma sus acciones propias.
 * Los marcados "PENDIENTE" no están en el diseño.
 */

/** Datos del caso que algunos textos necesitan. */
export interface ErrorContext {
  email?: string;
  retryAfterSeconds?: number;
}

type Text = ReactNode | ((ctx: ErrorContext) => ReactNode);

export interface ErrorCopy {
  tone: AlertTone;
  title: string;
  /** Descripción (desktop y tablet). */
  description?: Text;
  /** Versión corta para mobile, si el diseño la tiene. */
  descriptionShort?: Text;
  /** Nota chica debajo de las acciones. */
  footnote?: Text;
  footnoteShort?: Text;
}

/** "5 minutos", "30 segundos", "1 hora". */
export function formatWait(seconds: number): string {
  if (seconds < 60) return `${seconds} ${seconds === 1 ? "segundo" : "segundos"}`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
  const hours = Math.ceil(minutes / 60);
  return `${hours} ${hours === 1 ? "hora" : "horas"}`;
}

/** La espera si el back la mandó; si no, el marcador del diseño (regla pendiente, TASK-007). */
function wait(ctx: ErrorContext): ReactNode {
  return ctx.retryAfterSeconds ? formatWait(ctx.retryAfterSeconds) : <PendingText>[tiempo de espera]</PendingText>;
}

export const API_ERROR_MESSAGES = {
  VALIDATION_FAILED: {
    tone: "danger",
    // PENDIENTE de diseño: normalmente no se ve, porque los errores se marcan en cada campo.
    title: "Revisá los datos marcados",
  },
  INTERNAL_ERROR: {
    tone: "danger",
    // PENDIENTE de diseño
    title: "Algo salió mal",
    description: "Intentá de nuevo en unos minutos.",
  },
  NOT_FOUND: {
    tone: "danger",
    // PENDIENTE de diseño: no debería verse (el front solo llama rutas de los contratos).
    title: "No encontramos lo que buscabas",
    description: "Intentá de nuevo en unos minutos.",
  },
  NETWORK_ERROR: {
    tone: "danger",
    // PENDIENTE de diseño
    title: "No pudimos conectarnos",
    description: "Intentá de nuevo en unos minutos.",
  },

  AUTH_INVALID_CREDENTIALS: {
    tone: "danger",
    title: "El email o la contraseña no son correctos",
    description: "Revisalos e intentá nuevamente. Si no te acordás la contraseña, podés restablecerla.",
    descriptionShort: "Revisalos e intentá nuevamente.",
  },
  AUTH_EMAIL_NOT_VERIFIED: {
    tone: "accent",
    title: "Todavía no confirmaste tu email",
    description: ({ email }) =>
      `Te mandamos un código de 6 dígitos a ${email ?? "tu casilla"}. Ingresalo para activar tu cuenta.`,
    descriptionShort: "Te mandamos un código de 6 dígitos a tu casilla. Ingresalo para activar tu cuenta.",
  },
  AUTH_LOGIN_LOCKED: {
    tone: "warning",
    title: "Bloqueamos el ingreso por seguridad",
    description: (ctx) => (
      <>
        Hubo varios intentos fallidos seguidos. Vas a poder intentar de nuevo en {wait(ctx)}, o podés restablecer tu
        contraseña ahora.
      </>
    ),
    descriptionShort: (ctx) => <>Hubo varios intentos fallidos. Podés reintentar en {wait(ctx)} o restablecer tu contraseña ahora.</>,
    footnote: "¿No fuiste vos? Restablecela igual: así nadie más puede entrar.",
    footnoteShort: "¿No fuiste vos? Restablecela igual.",
  },

  AUTH_EMAIL_DOMAIN_NOT_ALLOWED: {
    tone: "danger",
    // Se muestra como error del campo email (REGISTER_MESSAGES.emailNotStudent); este texto
    // queda para cualquier otro lugar donde llegue.
    title: "Solo podés registrarte con tu email de alumno",
    description: "Tiene que terminar en @alu.frlp.utn.edu.ar.",
  },
  AUTH_EMAIL_TAKEN: {
    tone: "danger",
    // PENDIENTE de diseño (TASK-013)
    title: "Ya existe una cuenta con ese email",
    description: "Si es tuya, ingresá con ese email.",
  },

  AUTH_OTP_INVALID: {
    tone: "danger",
    // Se muestra como error del campo del código (diseño: Registro-Paso2-Incorrecto).
    title: "El código no es correcto",
    description: "Revisalo e intentá de nuevo.",
  },
  AUTH_OTP_EXPIRED: {
    tone: "warning",
    title: "El código venció",
    description: () => (
      <>
        Por seguridad, cada código vale por <PendingText>[tiempo de vigencia]</PendingText>. Pedí uno nuevo y te lo
        mandamos a tu email.
      </>
    ),
    descriptionShort: () => (
      <>
        Cada código vale por <PendingText>[tiempo de vigencia]</PendingText>. Pedí uno nuevo.
      </>
    ),
  },
  AUTH_OTP_TOO_MANY_ATTEMPTS: {
    tone: "warning",
    title: "Bloqueamos la verificación por seguridad",
    description: (ctx) => <>Hubo varios intentos con un código incorrecto. Vas a poder pedir un código nuevo en {wait(ctx)}.</>,
    descriptionShort: (ctx) => <>Hubo varios intentos fallidos. Podés pedir un código nuevo en {wait(ctx)}.</>,
  },
  AUTH_OTP_RESEND_TOO_SOON: {
    tone: "warning",
    // PENDIENTE de diseño: el diseño solo muestra el botón deshabilitado con la espera.
    title: "Esperá un momento para pedir otro código",
    description: (ctx) => <>Podés pedir otro en {wait(ctx)}.</>,
  },
} as const satisfies Record<ErrorCode | ClientErrorCode, ErrorCopy>;

export type ApiErrorCode = keyof typeof API_ERROR_MESSAGES;

/** Resuelve un texto que puede depender del caso. */
export function resolveText(text: Text | undefined, ctx: ErrorContext): ReactNode {
  return typeof text === "function" ? text(ctx) : text;
}
