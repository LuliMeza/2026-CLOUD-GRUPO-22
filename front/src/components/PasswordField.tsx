"use client";

import { useState } from "react";
import { TextField, type TextFieldProps } from "./TextField";
import { EyeIcon, EyeOffIcon } from "./icons";

type PasswordFieldProps = Omit<TextFieldProps, "type" | "trailing">;

/** TextField de contraseña con botón para mostrarla u ocultarla. */
export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          className="ac-field__trailing-btn"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-controls={props.id}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
}
