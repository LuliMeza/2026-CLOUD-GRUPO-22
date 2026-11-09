/** Tema visual del Design System: "light" (día) o "dark" (noche). */
export type Theme = "light" | "dark";

/** Clave de localStorage donde se guarda el tema que el usuario eligió a mano. */
export const THEME_STORAGE_KEY = "aula-clara-theme";

/** Tema efectivo: el elegido a mano (data-theme en <html>) o, si no hay, el del sistema. */
export function getEffectiveTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Aplica un tema elegido a mano y lo recuerda. localStorage puede fallar (modo privado). */
export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // sin persistencia: el tema vale solo para esta visita
  }
}
