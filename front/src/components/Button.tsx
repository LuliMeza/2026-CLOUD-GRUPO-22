import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./ds.css";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

/** Botón del Design System. Como máximo un `variant="primary"` por pantalla. */
export function Button({ variant = "primary", className, children, ...rest }: ButtonProps) {
  const classes = ["ac-btn", `ac-btn--${variant}`, className].filter(Boolean).join(" ");
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
