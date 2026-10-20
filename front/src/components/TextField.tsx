import type { InputHTMLAttributes, ReactNode } from "react";
import "./ds.css";

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  /** Obligatorio: lo usan el <label for> y el aria-describedby. */
  id: string;
  /** Etiqueta visible arriba del input (nunca solo placeholder). */
  label: string;
  /** Texto de ayuda debajo; queda vinculado con aria-describedby. */
  helper?: ReactNode;
  /** Hook para el estado de error (todavía sin estilos propios). */
  invalid?: boolean;
  /** Contenido extra dentro del borde derecho del input (ej. botón de PasswordField). */
  trailing?: ReactNode;
}

/** Campo de texto del Design System: label arriba, input de 48 px y slot de ayuda. */
export function TextField({
  id,
  label,
  helper,
  invalid = false,
  trailing,
  className,
  type = "text",
  ...rest
}: TextFieldProps) {
  const helperId = `${id}-help`;
  const inputClasses = ["ac-field__input", trailing ? "ac-field__input--trailing" : null, className]
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
          aria-describedby={helper ? helperId : undefined}
          aria-invalid={invalid || undefined}
          {...rest}
        />
        {trailing}
      </div>
      {helper ? (
        <p id={helperId} className="ac-field__helper">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
