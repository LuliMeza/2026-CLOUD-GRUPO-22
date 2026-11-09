import type { ReactNode } from "react";
import "./ds.css";

interface ResponsiveTextProps {
  /** Versión para desktop y tablet (≥ 768 px). */
  long: ReactNode;
  /** Versión corta para mobile (< 768 px), cuando el diseño la tiene. */
  short: ReactNode;
}

/**
 * Texto con versión larga y corta según el ancho, como en el diseño (ej. "¿Sos docente o
 * autoridad? Usá el email…" / "¿Sos docente? Usá el email…"). Las dos van en el HTML y CSS
 * muestra una; la oculta queda con display:none, así que el lector de pantalla lee solo la
 * visible. Se usa en línea, dentro de un párrafo, una ayuda o un aviso.
 */
export function ResponsiveText({ long, short }: ResponsiveTextProps) {
  return (
    <>
      <span className="ac-text-long">{long}</span>
      <span className="ac-text-short">{short}</span>
    </>
  );
}
