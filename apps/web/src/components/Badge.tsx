import "./ds.css";

export type BadgeTone = "success" | "warning" | "danger" | "accent";

const DEFAULT_LABEL: Record<BadgeTone, string> = {
  success: "Buena",
  warning: "Regular",
  danger: "Mala",
  accent: "Verificado",
};

interface BadgeProps {
  tone: BadgeTone;
  /** Por defecto usa Buena/Regular/Mala/Verificado según el tone. */
  label?: string;
}

/** Chip de valoración o estado. El color nunca va solo: siempre lleva la palabra al lado. */
export function Badge({ tone, label }: BadgeProps) {
  return (
    <span className={`ac-badge ac-badge--${tone}`}>
      <span className="ac-badge__dot" aria-hidden="true" />
      {label ?? DEFAULT_LABEL[tone]}
    </span>
  );
}
