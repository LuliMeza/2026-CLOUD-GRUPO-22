import "./ds.css";
import { Badge, type BadgeTone } from "./Badge";

interface CardProps {
  /** Nombre de la materia o cátedra. */
  title: string;
  /** Comisión y/o docente, como texto corto. */
  meta: string;
  /** Chip de valoración mostrado en el encabezado. */
  tone: BadgeTone;
  /** Comentario del estudiante, tal cual fue escrito — nunca se recorta ni se reescribe. */
  comment: string;
  /** Texto de pie, ej. "+12 valoraciones". */
  footerMeta: string;
}

/** Ficha de materia: el bloque que se repite en cualquier listado. */
export function Card({ title, meta, tone, comment, footerMeta }: CardProps) {
  return (
    <div className="ac-card">
      <div className="ac-card__header">
        <div>
          <h3 className="ac-card__title">{title}</h3>
          <p className="ac-card__meta">{meta}</p>
        </div>
        <Badge tone={tone} />
      </div>
      <p className="ac-card__comment">{comment}</p>
      <div className="ac-card__footer">
        <span className="ac-card__footer-meta">{footerMeta}</span>
        <Badge tone="accent" />
      </div>
    </div>
  );
}
