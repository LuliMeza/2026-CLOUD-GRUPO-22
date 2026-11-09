import type { ComponentPropsWithRef, ReactNode } from "react";
import { AlertCircleIcon } from "./icons";
import "./ds.css";

export interface TextFieldProps extends Omit<ComponentPropsWithRef<"input">, "id"> {
  /** Obligatorio: lo usan el <label for> y el aria-describedby. */
  id: string;
  /** Etiqueta visible arriba del input (nunca solo placeholder). */
  label: string;
  /** Texto de ayuda debajo; queda vinculado con aria-describedby. */
  helper?: ReactNode;
  /**
   * Mensaje de error. Cuando viene, reemplaza al texto de ayuda, pone el borde en
   * danger y marca el input con aria-invalid. El mensaje queda vinculado con
   * aria-describedby, así el lector de pantalla lo lee al enfocar el campo.
   */
  error?: ReactNode;
  /** Marca el campo como inválido sin mensaje propio (ej. el error se muestra en otro lado). */
  invalid?: boolean;
  /** Contenido extra dentro del borde derecho del input (ej. botón de PasswordField). */
  trailing?: ReactNode;
}

/**
 * Campo de texto del Design System: label arriba, input de 48 px y slot de ayuda o error.
 * Acepta `ref` (React 19), así funciona con `register()` de react-hook-form.
 */
export function TextField({
  id,
  label,
  helper,
  error,
  invalid = false,
  trailing,
  className,
  type = "text",
  ...rest
}: TextFieldProps) {
  const hasError = error != null && error !== false && error !== "";
  const isInvalid = hasError || invalid;
  const helperId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy = hasError ? errorId : helper ? helperId : undefined;

  const inputClasses = [
    "ac-field__input",
    trailing ? "ac-field__input--trailing" : null,
    isInvalid ? "ac-field__input--invalid" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="ac-field">
      <label className="ac-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="ac-field__control">
        <input
          id={id}
          type={type}
          className={inputClasses}
          aria-describedby={describedBy}
          aria-invalid={isInvalid || undefined}
          {...rest}
        />
        {trailing}
      </div>
      {hasError ? (
        <p id={errorId} className="ac-field__error">
          <AlertCircleIcon className="ac-field__error-icon" width={16} height={16} strokeWidth={2} />
          <span>{error}</span>
        </p>
      ) : helper ? (
        <p id={helperId} className="ac-field__helper">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
