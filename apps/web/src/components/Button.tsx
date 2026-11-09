import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { Spinner } from "./Spinner";
import "./ds.css";

/**
 * - `primary`: la acción principal. Como máximo uno por pantalla.
 * - `secondary`: superficie con borde.
 * - `ghost`: sin fondo ni borde.
 * - `accent`: acción principal dentro de un aviso de tono accent (ej. Alert "sin confirmar").
 * - `outline`: transparente con borde; para acciones secundarias sobre un fondo teñido.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "accent" | "outline";
/** `md`: 44 px y texto de 13 px (default). `lg`: 48 px y texto de 15 px (formularios). */
export type ButtonSize = "md" | "lg";

function buttonClasses(variant: ButtonVariant, size: ButtonSize, className?: string, loading = false) {
  return [
    "ac-btn",
    `ac-btn--${variant}`,
    size === "lg" ? "ac-btn--lg" : null,
    loading ? "ac-btn--loading" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Acción en curso: deshabilita el botón, muestra un spinner y reemplaza el texto
   * por `loadingLabel`, anunciado con role="status".
   */
  loading?: boolean;
  /** Texto mientras `loading` (ej. "Ingresando…"). Default: el mismo `children`. */
  loadingLabel?: ReactNode;
  children: ReactNode;
}

/** Botón del Design System. Como máximo un `variant="primary"` por pantalla. */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={buttonClasses(variant, size, className, loading)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <>
          <Spinner />
          <span role="status">{loadingLabel ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

/** Link con aspecto de botón: navega (es un <a>), no ejecuta una acción. */
export function ButtonLink({
  href,
  variant = "secondary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
