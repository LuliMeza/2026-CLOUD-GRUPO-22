import type { ReactNode } from "react";
import { ButtonLink } from "@/components";

type AuthAltActionProps = {
  /** Pregunta, ej. "¿Ya tenés cuenta?". Sin pregunta ni acción, el pie muestra solo las notas. */
  question?: ReactNode;
  /** Nombre accesible de la sección. */
  ariaLabel: string;
  /** Notas chicas debajo, una por línea. */
  note?: ReactNode | ReactNode[];
} & (
  | {
      /** Link a otra pantalla (crear cuenta ↔ ingresar). */
      href: string;
      /** Texto del botón, ej. "Ingresar". */
      label: ReactNode;
      action?: never;
    }
  | {
      /** Acción propia en vez de un link, ej. <Button>Reenviar código</Button>. */
      action?: ReactNode;
      href?: never;
      label?: never;
    }
);

/** Pie de las pantallas de auth: la acción alternativa (crear cuenta ↔ ingresar, reenviar el código). */
export function AuthAltAction({ question, href, label, action, ariaLabel, note }: AuthAltActionProps) {
  const notes = (Array.isArray(note) ? note : [note]).filter((n) => n != null && n !== false);
  const button =
    href !== undefined ? (
      <ButtonLink href={href} variant="secondary" size="lg" className="auth__alt-btn">
        {label}
      </ButtonLink>
    ) : (
      action
    );

  return (
    <section className="auth__alt" aria-label={ariaLabel}>
      {question || button ? (
        <div className="auth__alt-row">
          {question ? <span className="auth__alt-question">{question}</span> : null}
          {button}
        </div>
      ) : null}
      {notes.map((n, i) => (
        <p key={i} className="auth__note">
          {n}
        </p>
      ))}
    </section>
  );
}
