import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Work_Sans, Plus_Jakarta_Sans } from "next/font/google";
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

export default function RootLayout({ children }: RootLayoutProps) {
  // TODO: cuando haya un selector de tema, pasar data-theme="dark" acá según
  // preferencia del usuario o prefers-color-scheme. Por ahora siempre claro.
  return (
    <html lang="es" className={`${workSans.variable} ${plusJakartaSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
