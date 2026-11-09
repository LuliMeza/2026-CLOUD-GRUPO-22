import "./ds.css";

interface SpinnerProps {
  /** Lado en px. Default 20 (mismo tamaño que los íconos). */
  size?: number;
  className?: string;
}

/**
 * Indicador de carga. Es decorativo (aria-hidden): quien lo usa anuncia el estado
 * con texto, por ejemplo `Button loading` con su `role="status"`.
 * Con prefers-reduced-motion gira más lento en vez de detenerse, para que se siga
 * entendiendo que algo está pasando.
 */
export function Spinner({ size = 20, className }: SpinnerProps) {
  return (
    <svg
      className={["ac-spinner", className].filter(Boolean).join(" ")}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="ac-spinner__track" cx="12" cy="12" r="9" strokeWidth="3" />
      <path className="ac-spinner__arc" d="M21 12a9 9 0 0 0-9-9" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
