import type { ComponentPropsWithRef, ReactNode } from "react";
import { AlertCircleIcon, LockIcon, MailIcon } from "./icons";
import "./ds.css";

/**
 * - `danger`: algo salió mal y el usuario tiene que corregirlo (ej. credenciales incorrectas).
 * - `warning`: algo impide seguir por ahora (ej. ingreso bloqueado).
 * - `accent`: falta un paso del usuario, sin que sea un error (ej. email sin confirmar).
 */
export type AlertTone = "danger" | "warning" | "accent";

const DEFAULT_ICON: Record<AlertTone, ReactNode> = {
  danger: <AlertCircleIcon strokeWidth={2} />,
  warning: <LockIcon strokeWidth={2} />,
  accent: <MailIcon strokeWidth={2} />,
};

interface AlertProps extends Omit<ComponentPropsWithRef<"div">, "title"> {
  tone: AlertTone;
  /** Primera línea, en el color del tono. Dice qué pasó. */
  title: ReactNode;
  /** Descripción: qué hacer ahora. */
  children?: ReactNode;
  /** Reemplaza al ícono por defecto del tono. Tiene que ser decorativo (aria-hidden). */
  icon?: ReactNode;
  /**
   * Acciones (Button / ButtonLink). Se acomodan en fila y pasan abajo si no entran;
   * una sola acción ocupa todo el ancho.
   */
  actions?: ReactNode;
  /** Nota chica debajo de las acciones. */
  footnote?: ReactNode;
}

/**
 * Aviso dentro de una pantalla o formulario. Lleva role="alert": el lector de
 * pantalla lo anuncia en cuanto aparece. tabIndex={-1} permite mover el foco con
 * el `ref` (ej. `alertRef.current?.focus()`) para que quede a la vista y sea el
 * punto de partida del Tab.
 * El tono nunca va solo: el título dice con palabras qué pasó (WCAG 1.4.1).
 */
export function Alert({ tone, title, children, icon, actions, footnote, className, ...rest }: AlertProps) {
  return (
    <div
      role="alert"
      tabIndex={-1}
      className={["ac-alert", `ac-alert--${tone}`, className].filter(Boolean).join(" ")}
      {...rest}
    >
      <div className="ac-alert__body">
        <span className="ac-alert__icon">{icon ?? DEFAULT_ICON[tone]}</span>
        <div className="ac-alert__text">
          <p className="ac-alert__title">{title}</p>
          {children ? <p className="ac-alert__description">{children}</p> : null}
        </div>
      </div>
      {actions ? <div className="ac-alert__actions">{actions}</div> : null}
      {footnote ? <p className="ac-alert__footnote">{footnote}</p> : null}
    </div>
  );
}
