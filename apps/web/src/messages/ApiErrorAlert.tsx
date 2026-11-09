import type { ReactNode, Ref } from "react";
import { Alert, ResponsiveText } from "@/components";
import { API_ERROR_MESSAGES, resolveText, type ApiErrorCode, type ErrorContext } from "./api-errors";

interface ApiErrorAlertProps {
  code: ApiErrorCode;
  /** Datos del caso que usan algunos textos (email, espera). */
  context?: ErrorContext;
  /** Reemplaza el título por defecto cuando la pantalla lo pide (ej. "No pudimos ingresar"). */
  title?: string;
  /** Acciones propias de la pantalla. */
  actions?: ReactNode;
  /** Reemplaza el ícono del tono cuando el diseño pide otro (ej. reloj para "el código venció"). */
  icon?: ReactNode;
  alertRef?: Ref<HTMLDivElement>;
}

/**
 * Aviso de un error de la API con el texto del diccionario (api-errors.tsx): tono, título,
 * descripción y nota, con su versión corta en mobile si existe. Lo usa cualquier pantalla que
 * llame a la API; la pantalla suma sus acciones o cambia el título si el contexto lo pide.
 */
export function ApiErrorAlert({ code, context = {}, title, actions, icon, alertRef }: ApiErrorAlertProps) {
  const copy = API_ERROR_MESSAGES[code];
  const pick = (long: ReactNode, short: ReactNode) => (short ? <ResponsiveText long={long} short={short} /> : long);
  const description = "description" in copy ? resolveText(copy.description, context) : undefined;
  const descriptionShort = "descriptionShort" in copy ? resolveText(copy.descriptionShort, context) : undefined;
  const footnote = "footnote" in copy ? resolveText(copy.footnote, context) : undefined;
  const footnoteShort = "footnoteShort" in copy ? resolveText(copy.footnoteShort, context) : undefined;

  return (
    <Alert
      ref={alertRef}
      tone={copy.tone}
      title={title ?? copy.title}
      icon={icon}
      actions={actions}
      footnote={footnote ? pick(footnote, footnoteShort) : undefined}
    >
      {description ? pick(description, descriptionShort) : undefined}
    </Alert>
  );
}
