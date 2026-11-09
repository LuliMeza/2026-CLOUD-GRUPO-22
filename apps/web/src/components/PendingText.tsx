import type { ReactNode } from "react";
import "./ds.css";

interface PendingTextProps {
  /** El marcador, entre corchetes, ej. "[tiempo de espera]". */
  children: ReactNode;
  className?: string;
}

/**
 * Dato que todavía no está definido (una regla, un texto, un valor), con el subrayado
 * punteado del diseño. Es un marcador para el equipo: cada uso lleva al lado un TODO
 * con la tarea que lo resuelve. Se usa en línea, dentro de un párrafo o una ayuda.
 */
export function PendingText({ children, className }: PendingTextProps) {
  return <span className={["ac-pending", className].filter(Boolean).join(" ")}>{children}</span>;
}
