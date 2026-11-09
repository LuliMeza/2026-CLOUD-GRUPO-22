import type { Metadata } from "next";
import { ResponsiveText } from "@/components";
import { AuthAltAction } from "../_auth/AuthAltAction";
import { AuthShell } from "../_auth/AuthShell";
import { REGISTER_HREF } from "../_auth/routes";
import { LoginForm } from "./LoginForm";
import "./login.css";

export const metadata: Metadata = {
  title: "Ingresá a tu cuenta · Aula Clara UTN",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Ingresá a tu cuenta"
      subtitle="Usá el email con el que te registraste."
      cardTagline
      footer={
        <AuthAltAction
          ariaLabel="Crear cuenta"
          question="¿Todavía no tenés cuenta?"
          href={REGISTER_HREF}
          label="Crear cuenta"
          note={
            <ResponsiveText
              long="Para crear una cuenta necesitás tu email @alu.frlp.utn.edu.ar."
              short="Necesitás tu email @alu.frlp.utn.edu.ar."
            />
          }
        />
      }
    >
      {/* Aviso del resultado (si hay) + formulario: ver LoginForm. */}
      <LoginForm />
    </AuthShell>
  );
}
