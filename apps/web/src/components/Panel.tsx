import type { HTMLAttributes, ReactNode } from "react";
import "./ds.css";

/**
 * - `default`: superficie sólida (surface-200), borde, sombra chica.
 * - `glass`: vidrio esmerilado sobre una imagen (--glass-*), sombra media.
 * - `glass-touch`: glass por debajo de 1024 px y default desde 1024 px
 *   (tablet/mobile con la ilustración de fondo, desktop con columna propia).
 */
export type PanelVariant = "default" | "glass" | "glass-touch";

/**
 * Intensidad del vidrio (solo para `glass` y `glass-touch`):
 * - `light`: deja ver la ilustración (--glass-bg, 2 px de blur). Default.
 * - `strong`: casi opaco (--glass-bg-strong, 4 px de blur), para formularios largos
 *   donde el texto secundario tiene que leerse en ink-muted.
 */
export type PanelGlass = "light" | "strong";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: PanelVariant;
  glass?: PanelGlass;
  children: ReactNode;
}

/** Contenedor genérico tipo tarjeta. Para la ficha de materia está `Card`. */
export function Panel({ variant = "default", glass = "light", className, children, ...rest }: PanelProps) {
  const classes = [
    "ac-panel",
    variant !== "default" ? `ac-panel--${variant}` : null,
    variant !== "default" && glass === "strong" ? "ac-panel--glass-strong" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
