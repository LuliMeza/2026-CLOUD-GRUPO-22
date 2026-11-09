import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { Problem } from "@cloud-grupo-22/shared";

/**
 * Pasa los errores por campo de un VALIDATION_FAILED (o de cualquier Problem con `errors`)
 * al formulario de react-hook-form. Cada error trae la misma clave que produce el esquema
 * compartido en el cliente, así que el campo muestra el mismo texto que si hubiera fallado
 * la validación local. Devuelve true si marcó al menos un campo del formulario.
 */
export function applyFieldErrors<T extends FieldValues>(
  problem: Problem | null,
  fields: readonly Path<T>[],
  setError: UseFormSetError<T>,
): boolean {
  let applied = false;
  for (const fe of problem?.errors ?? []) {
    const field = fields.find((f) => f === fe.field);
    if (!field) continue;
    // Sin shouldFocus: mientras se envía el formulario está deshabilitado y no recibe foco;
    // cada pantalla enfoca el primer campo con error del servidor cuando se habilita.
    setError(field, { type: "server", message: fe.code });
    applied = true;
  }
  return applied;
}
