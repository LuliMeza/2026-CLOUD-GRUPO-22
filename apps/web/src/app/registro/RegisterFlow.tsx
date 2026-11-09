"use client";

import { useEffect, useState } from "react";
import { ResponsiveText, StepIndicator } from "@/components";
import { AuthAltAction } from "../_auth/AuthAltAction";
import { AuthFooter, AuthHeader, AuthShell } from "../_auth/AuthShell";
import { LOGIN_HREF, REGISTER_HREF, verifyEmailHref } from "../_auth/routes";
import { RegisterForm } from "./RegisterForm";
import { VerifyEmailStep } from "./VerifyEmailStep";
import "./registro.css";

const TITLES = {
  1: "Creá tu cuenta · Aula Clara UTN",
  2: "Confirmá tu email · Aula Clara UTN",
} as const;

type Step = keyof typeof TITLES;

interface RegisterFlowProps {
  /** Paso con el que abre la página (2 si viene de /registro?paso=2&email=…). */
  initialStep: Step;
  /** Email del paso 2 cuando se abre directo en ese paso. */
  initialEmail?: string;
  /** Pedir un código nuevo al abrir el paso 2 (botón "Reenviar código" del login). */
  resendOnMount?: boolean;
}

/**
 * Crear cuenta (HU-01) en dos pasos dentro de la misma página: 1) email y contraseña,
 * 2) confirmar el email con el código. Al pasar al paso 2 la tarjeta va al centro en desktop
 * y la ilustración queda de fondo, borrosa (AuthShell `centered`); el contenido cambia con un
 * fundido. La URL refleja el paso para que recargar no lo pierda.
 */
export function RegisterFlow({ initialStep, initialEmail = "", resendOnMount = false }: RegisterFlowProps) {
  const [step, setStep] = useState<Step>(initialStep);
  const [email, setEmail] = useState(initialEmail);
  // Si ya hubo un cambio de paso en esta página: el foco va al título nuevo.
  const [moved, setMoved] = useState(false);

  function goTo(next: Step, nextEmail = email) {
    setStep(next);
    setEmail(nextEmail);
    setMoved(true);
    // replaceState: el paso queda en la URL sin sumar una entrada al historial ni recargar.
    window.history.replaceState(null, "", next === 2 ? verifyEmailHref(nextEmail) : REGISTER_HREF);
  }

  useEffect(() => {
    document.title = TITLES[step];
  }, [step]);

  // "reenviar=1" se usa una sola vez: si queda en la URL, recargar volvería a pedir un código.
  useEffect(() => {
    if (resendOnMount) window.history.replaceState(null, "", verifyEmailHref(initialEmail));
  }, [resendOnMount, initialEmail]);

  return (
    <AuthShell contentKey={`paso-${step}`} centered={step === 2} glass="strong" mobileHeader>
      {step === 1 ? (
        <>
          <AuthHeader
            eyebrow={<StepIndicator current={1} total={2} />}
            title="Creá tu cuenta"
            subtitle={
              <ResponsiveText
                long="Con tu email de alumno de la UTN FRLP. Después te mandamos un código para confirmar que es tuyo."
                short="Con tu email de alumno. Después te mandamos un código para confirmarlo."
              />
            }
            focusOnMount={moved}
          />
          <RegisterForm defaultEmail={email} onRegistered={(registered) => goTo(2, registered)} />
          <AuthFooter>
            <AuthAltAction
              ariaLabel="Ingresar"
              question="¿Ya tenés cuenta?"
              href={LOGIN_HREF}
              label="Ingresar"
              note={
                <ResponsiveText
                  long="¿Sos docente o autoridad? Tu cuenta la crea un administrador de la facultad."
                  short="¿Sos docente o autoridad? Tu cuenta la crea un administrador."
                />
              }
            />
          </AuthFooter>
        </>
      ) : (
        <VerifyEmailStep
          email={email}
          focusTitle={moved}
          resendOnMount={resendOnMount && !moved}
          onBack={() => goTo(1)}
        />
      )}
    </AuthShell>
  );
}
