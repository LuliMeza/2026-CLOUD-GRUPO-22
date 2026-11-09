import type { ComponentPropsWithRef, ReactNode } from "react";
import "./ds.css";

interface CheckboxProps extends Omit<ComponentPropsWithRef<"input">, "type"> {
  label: ReactNode;
}

/** Checkbox nativo envuelto en su label: toda la fila es clickeable. Acepta `ref` (react-hook-form). */
export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  return (
    <label className={["ac-checkbox", className].filter(Boolean).join(" ")}>
      <input type="checkbox" className="ac-checkbox__input" {...rest} />
      <span>{label}</span>
    </label>
  );
}
