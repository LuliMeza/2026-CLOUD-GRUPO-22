"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ButtonLink, PasswordField, PendingText, ResponsiveText, TextField } from "@/components";
import { register as registerAccount } from "@/services/auth";
import { applyFieldErrors } from "@/services/form-errors";
import { registerFormSchema, type Problem, type RegisterFormValues, type RegisterIssue } from "@cloud-grupo-22/shared";
import { REGISTER_MESSAGES, REGISTER_MESSAGES_SHORT } from "@/validations/register";
import { ApiErrorAlert } from "@/messages/ApiErrorAlert";
import { LOGIN_HREF } from "../_auth/routes";

/** Texto de un error de validación: el esquema compartido devuelve una clave (RegisterIssue). */
function fieldError(message: string | undefined): ReactNode {
  if (!message) return undefined;
  const key = message as RegisterIssue;
  const long = REGISTER_MESSAGES[key] ?? message;
  const short = REGISTER_MESSAGES_SHORT[key];
  return short ? <ResponsiveText long={long} short={short} /> : long;
}

/** Último error de la API a mostrar como aviso (los de un campo van en el campo). */
type RegisterErrorCode = Exclude<Awaited<ReturnType<typeof registerAccount>>, { ok: true }>["code"];
type Outcome = { code: RegisterErrorCode; problem: Problem | null } | null;

const REGISTER_FIELDS = ["email", "password"] as const;

const PASSWORD_ID = "register-password";
const CONFIRM_ID = "register-password-confirm";

interface RegisterFormProps {
  /** Email con el que arranca el campo (ej. al volver del paso 2). */
  defaultEmail?: string;
  /** El alta salió bien: sigue el paso 2 (confirmar el email) con el email que aceptó el back. */
  onRegistered: (email: string) => void;
}

/**
 * Formulario de Crear cuenta (paso 1 de 2, HU-01). Valida en el cliente que el email sea
 * de alumno y que las contraseñas coincidan; el mismo error de dominio llega si lo rechaza
 * el back. Si el alta sale bien, avisa con `onRegistered` (RegisterFlow pasa al paso 2).
 */
export function RegisterForm({ defaultEmail = "", onRegistered }: RegisterFormProps) {
  const [outcome, setOutcome] = useState<Outcome>(null);
  // Un solo botón muestra u oculta las dos contraseñas.
  const [passwordsVisible, setPasswordsVisible] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { email: defaultEmail, password: "", passwordConfirm: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Al llegar un aviso, el foco va a él (queda a la vista aunque la página tenga scroll).
  useEffect(() => {
    if (outcome) alertRef.current?.focus();
  }, [outcome]);

  // Errores de campo que mandó el back: foco al primero cuando el fieldset ya se habilitó
  // (mientras se envía está deshabilitado y no puede recibir foco).
  useEffect(() => {
    if (isSubmitting) return;
    const first = REGISTER_FIELDS.find((f) => errors[f]?.type === "server");
    if (first) setFocus(first);
  }, [isSubmitting, errors, setFocus]);

  async function onSubmit(values: RegisterFormValues) {
    setOutcome(null);
    const result = await registerAccount(values);

    if (result.ok) {
      onRegistered(result.data.email);
      return;
    }
    switch (result.code) {
      case "AUTH_EMAIL_DOMAIN_NOT_ALLOWED":
        // El back rechazó el dominio (HU-01, escenario 3): mismo error del campo que en el cliente.
        setError("email", { type: "server", message: "emailNotStudent" satisfies RegisterIssue });
        return;
      case "VALIDATION_FAILED":
        if (applyFieldErrors(result.problem, REGISTER_FIELDS, setError)) return;
        break;
    }
    setOutcome({ code: result.code, problem: result.problem });
  }

  const passwordType = passwordsVisible ? "text" : "password";

  return (
    <>
      {outcome?.code === "AUTH_EMAIL_TAKEN" ? (
        <ApiErrorAlert
          code={outcome.code}
          alertRef={alertRef}
          actions={
            <ButtonLink href={LOGIN_HREF} variant="outline">
              Ingresar
            </ButtonLink>
          }
        />
      ) : outcome ? (
        // PENDIENTE de diseño (TASK-013): error del servidor o sin conexión.
        <ApiErrorAlert code={outcome.code} title="No pudimos crear tu cuenta" alertRef={alertRef} />
      ) : null}

      <form className="auth__form" onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={isSubmitting}>
        <fieldset className="auth__fieldset" disabled={isSubmitting}>
          <TextField
            id="register-email"
            label="Email institucional"
            type="email"
            inputMode="email"
            placeholder="nombre@alu.frlp.utn.edu.ar"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            error={fieldError(errors.email?.message)}
            helper={
              <ResponsiveText
                long="Solo se aceptan emails que terminan en @alu.frlp.utn.edu.ar."
                short="Tiene que terminar en @alu.frlp.utn.edu.ar."
              />
            }
            {...register("email")}
          />

          <PasswordField
            id={PASSWORD_ID}
            label="Contraseña"
            placeholder="Elegí una contraseña"
            autoComplete="new-password"
            visible={passwordsVisible}
            onVisibleChange={setPasswordsVisible}
            toggleLabels={{ show: "Mostrar contraseñas", hide: "Ocultar contraseñas" }}
            controls={[CONFIRM_ID]}
            error={fieldError(errors.password?.message)}
            helper={
              // TODO(TASK-007): reemplazar por los requisitos de la contraseña cuando estén definidos.
              <ResponsiveText
                long={<PendingText>[Requisitos de la contraseña · a definir con backend]</PendingText>}
                short={<PendingText>[Requisitos de la contraseña · a definir]</PendingText>}
              />
            }
            {...register("password")}
          />

          <TextField
            id={CONFIRM_ID}
            label="Repetí la contraseña"
            type={passwordType}
            placeholder="La misma contraseña"
            autoComplete="new-password"
            error={fieldError(errors.passwordConfirm?.message)}
            {...register("passwordConfirm")}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="auth__submit"
            loading={isSubmitting}
            // PENDIENTE de diseño (TASK-013): el diseño no muestra el estado de carga.
            loadingLabel="Creando cuenta…"
          >
            Crear cuenta
          </Button>
        </fieldset>
      </form>
    </>
  );
}
