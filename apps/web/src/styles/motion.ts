/**
 * Valores de animación compartidos (Motion). Misma curva en toda la app; duraciones cortas.
 * Reglas de uso: docs/standards/frontend-design-system.md, "Animaciones (Motion)".
 * Las transiciones de CSS que acompañan a una animación de Motion usan los mismos valores
 * (ej. --auth-move-duration y --auth-ease en app/_auth/auth.css): si cambian acá, cambian allá.
 */

/** Curva de salida suave: arranca rápido y frena al llegar. */
export const MOTION_EASE = [0.2, 0.7, 0.2, 1] as const;

/** Duraciones en segundos (Motion usa segundos). */
export const MOTION_DURATION = {
  /** Aparecer / desaparecer contenido (fundido). */
  fade: 0.18,
  /** Cambio de alto de un contenedor. */
  resize: 0.4,
  /** Un bloque que se mueve a otro lugar del layout. */
  move: 0.7,
} as const;
