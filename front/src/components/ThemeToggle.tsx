"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./icons";
import { getEffectiveTheme, setTheme, type Theme } from "./theme";
import "./ds.css";

interface ThemeToggleProps {
  className?: string;
}

/** Botón día/noche. Pone data-theme en <html> y recuerda la elección. */
export function ThemeToggle({ className }: ThemeToggleProps) {
  // En el servidor no se sabe el tema; se arranca en claro y se corrige al montar.
  // El ícono no depende de este estado (lo resuelve CSS), así no parpadea.
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setThemeState(getEffectiveTheme());
    // Mientras el usuario no elija, seguir los cambios del sistema.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setThemeState(getEffectiveTheme());
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className={["ac-icon-btn", "ac-theme-toggle", className].filter(Boolean).join(" ")}
      aria-label={next === "dark" ? "Activar modo oscuro" : "Activar modo claro"}
      onClick={() => {
        setTheme(next);
        setThemeState(next);
      }}
    >
      <MoonIcon className="ac-theme-toggle__moon" />
      <SunIcon className="ac-theme-toggle__sun" />
    </button>
  );
}
