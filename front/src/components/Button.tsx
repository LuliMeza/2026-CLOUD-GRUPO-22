import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import "./ds.css";

type ButtonVariant = "primary" | "secondary" | "ghost";
/** `md`: 44 px y texto de 13 px (default). `lg`: 48 px y texto de 15 px (formularios). */
type ButtonSize = "md" | "lg";

function buttonClasses(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return ["ac-btn", `ac-btn--${variant}`, size === "lg" ? "ac-btn--lg" : null, className]
    .filter(Boolean)
    .join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

/** Botón del Design System. Como máximo un `variant="primary"` por pantalla. */
export function Button({ variant = "primary", size = "md", className, children, ...rest }: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} {...rest}>
      {children}
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
