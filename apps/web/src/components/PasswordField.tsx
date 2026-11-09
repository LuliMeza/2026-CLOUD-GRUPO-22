"use client";

import { useState } from "react";
import { TextField, type TextFieldProps } from "./TextField";
import { EyeIcon, EyeOffIcon } from "./icons";

interface PasswordFieldProps extends Omit<TextFieldProps, "type" | "trailing"> {
  /**
   * Visibilidad controlada desde afuera. Sirve cuando un mismo botón muestra varias
   * contraseñas (ej. "Contraseña" + "Repetí la contraseña"): el otro campo es un
   * TextField con `type={visible ? "text" : "password"}`. Sin esta prop, el campo
   * maneja su propio estado.
   */
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  /** Nombres accesibles del botón. Default: "Mostrar contraseña" / "Ocultar contraseña". */
  toggleLabels?: { show: string; hide: string };
  /** ids de otros campos que el botón también muestra u oculta (para aria-controls). */
  controls?: string[];
}

/** TextField de contraseña con botón para mostrarla u ocultarla. */
export function PasswordField({
  visible: visibleProp,
  onVisibleChange,
  toggleLabels = { show: "Mostrar contraseña", hide: "Ocultar contraseña" },
  controls = [],
  ...props
}: PasswordFieldProps) {
  const [visibleState, setVisibleState] = useState(false);
  const visible = visibleProp ?? visibleState;

  function toggle() {
    const next = !visible;
    if (visibleProp === undefined) setVisibleState(next);
    onVisibleChange?.(next);
  }

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          className="ac-field__trailing-btn"
          aria-label={visible ? toggleLabels.hide : toggleLabels.show}
          aria-controls={[props.id, ...controls].join(" ")}
          onClick={toggle}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
}
