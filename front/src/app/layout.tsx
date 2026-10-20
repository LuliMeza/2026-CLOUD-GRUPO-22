import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Work_Sans, Plus_Jakarta_Sans } from "next/font/google";
import { THEME_STORAGE_KEY } from "@/components/theme";
import "./globals.css";

// Cuerpo de texto del Design System — se expone como --font-work-sans y
// globals.css la enchufa en --font-sans.
const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-work-sans",
});

// Títulos — se expone como --font-plus-jakarta, usada por --font-display.
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Aula Clara UTN",
  description: "Aplicación del proyecto 2026 Cloud Grupo 22",
};

interface RootLayoutProps {
  children: ReactNode;
}

// Aplica el tema elegido a mano (ThemeToggle) antes del primer pintado, para que
// no parpadee de claro a oscuro. Si no hay elección guardada no toca nada y manda
// prefers-color-scheme vía CSS (ver globals.css).
const themeInitScript = `try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    // suppressHydrationWarning: el script de arriba puede agregar data-theme a
    // <html> antes de que React hidrate; es esperado.
    <html
      lang="es"
      className={`${workSans.variable} ${plusJakartaSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
