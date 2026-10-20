import type { HTMLAttributes, ReactNode } from "react";
import "./ds.css";

/**
 * - `default`: superficie sólida (surface-200), borde, sombra chica.
 * - `glass`: vidrio esmerilado sobre una imagen (--glass-*), sombra media.
 * - `glass-touch`: glass por debajo de 1024 px y default desde 1024 px
 *   (tablet/mobile con la ilustración de fondo, desktop con columna propia).
 */
export type PanelVariant = "default" | "glass" | "glass-touch";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: PanelVariant;
  children: ReactNode;
}

/** Contenedor genérico tipo tarjeta. Para la ficha de materia está `Card`. */
export function Panel({ variant = "default", className, children, ...rest }: PanelProps) {
  const classes = ["ac-panel", variant !== "default" ? `ac-panel--${variant}` : null, className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
