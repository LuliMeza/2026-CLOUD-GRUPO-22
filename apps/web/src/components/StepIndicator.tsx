import "./ds.css";

interface StepIndicatorProps {
  /** Paso actual, empezando en 1. */
  current: number;
  /** Cantidad total de pasos. */
  total: number;
  className?: string;
}

/**
 * Indicador de pasos de un flujo ("Paso 1 de 2" + barras). El texto es lo que se
 * anuncia; las barras son decorativas (aria-hidden) y repiten la misma información.
 * Va arriba del título de la pantalla.
 */
export function StepIndicator({ current, total, className }: StepIndicatorProps) {
  return (
    <div className={["ac-steps", className].filter(Boolean).join(" ")}>
      <p className="ac-steps__label">
        Paso {current} de {total}
      </p>
      <div className="ac-steps__bars" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`ac-steps__bar${i < current ? " ac-steps__bar--done" : ""}`} />
        ))}
      </div>
    </div>
  );
}
