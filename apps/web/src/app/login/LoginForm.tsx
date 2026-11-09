"use client";

import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ButtonLink, Checkbox, PasswordField, ResponsiveText, TextField } from "@/components";
import { login } from "@/services/auth";
import { applyFieldErrors } from "@/services/form-errors";
import { loginSchema, type LoginIssue, type LoginValues, type Problem } from "@cloud-grupo-22/shared";
import { LOGIN_MESSAGES, LOGIN_MESSAGES_SHORT } from "@/validations/login";
import { ApiErrorAlert } from "@/messages/ApiErrorAlert";
import { AFTER_LOGIN_HREF, FORGOT_PASSWORD_HREF, verifyEmailHref } from "../_auth/routes";

/** Texto de un error de validación: el esquema compartido devuelve una clave (LoginIssue). */
function fieldError(message: string | undefined): ReactNode {
  if (!message) return undefined;
  const key = message as LoginIssue;
  const long = LOGIN_MESSAGES[key] ?? message;
  const short = LOGIN_MESSAGES_SHORT[key];
  return short ? <ResponsiveText long={long} short={short} /> : long;
}

/** Último error de la API a mostrar; `null` mientras no haya ninguno. */
type Outcome = { code: LoginErrorCode; problem: Problem | null; email: string } | null;
type LoginErrorCode = Exclude<Awaited<ReturnType<typeof login>>, { ok: true }>["code"];

function OutcomeAlert({ outcome, alertRef }: { outcome: Outcome; alertRef: Ref<HTMLDivElement> }) {
  if (!outcome) return null;
  const context = { email: outcome.email, retryAfterSeconds: outcome.problem?.retryAfterSeconds };

  switch (outcome.code) {
    case "AUTH_EMAIL_NOT_VERIFIED":
      return (
        <ApiErrorAlert
          code={outcome.code}
          context={context}
          alertRef={alertRef}
          actions={
            <>
              {/* Paso 2 del registro, con el email de este intento. */}
              <ButtonLink href={verifyEmailHref(outcome.email)} variant="accent">
                Ingresar el código
              </ButtonLink>
              {/* Mismo paso 2, pidiendo un código nuevo al llegar. */}
              <ButtonLink href={verifyEmailHref(outcome.email, { resend: true })} variant="outline">
                Reenviar código
              </ButtonLink>
            </>
          }
        />
      );

    case "AUTH_LOGIN_LOCKED":
      return (
        <ApiErrorAlert
          code={outcome.code}
          context={context}
          alertRef={alertRef}
          actions={
            // TODO(rutas): llevar a Recuperar contraseña (HU-02) cuando exista la pantalla. Ver TASK-008.
            <ButtonLink href={FORGOT_PASSWORD_HREF} variant="primary" size="lg">
              Restablecer contraseña
            </ButtonLink>
          }
        />
      );

    case "AUTH_INVALID_CREDENTIALS":
      return <ApiErrorAlert code={outcome.code} context={context} alertRef={alertRef} />;

    case "VALIDATION_FAILED":
    case "INTERNAL_ERROR":
    case "NETWORK_ERROR":
      // PENDIENTE de diseño (TASK-012): el diseño no tiene un estado para errores del servidor.
      return <ApiErrorAlert code={outcome.code} title="No pudimos ingresar" context={context} alertRef={alertRef} />;
  }
}

const LOGIN_FIELDS = ["email", "password"] as const;

/**
 * Formulario de login con sus estados: validación en el cliente (zod), ingresando,
 * credenciales incorrectas, email sin confirmar e ingreso bloqueado.
 * Devuelve el aviso y el formulario como hermanos, para que el aviso quede entre el
 * encabezado y el formulario dentro de la tarjeta.
 */
export function LoginForm() {
  const router = useRouter();
  const [outcome, setOutcome] = useState<Outcome>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    resetField,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
    // Errores al enviar (como el diseño); después se corrigen mientras se escribe.
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Al llegar un aviso, el foco va a él: queda a la vista aunque la página tenga
  // scroll (TASK-009) y el Tab sigue desde ahí.
  useEffect(() => {
    if (outcome) alertRef.current?.focus();
  }, [outcome]);

  // Errores por campo que mandó el back: foco al primero cuando el fieldset ya se habilitó
  // (mientras se envía está deshabilitado y no puede recibir foco).
  useEffect(() => {
    if (isSubmitting) return;
    const first = LOGIN_FIELDS.find((f) => errors[f]?.type === "server");
    if (first) setFocus(first);
  }, [isSubmitting, errors, setFocus]);

  async function onSubmit(values: LoginValues) {
    setOutcome(null);
    const result = await login(values);

    if (result.ok) {
      // TODO(auth): la sesión la deja el back en una cookie (contrato auth.login); falta el
      // destino según el rol (result.data.user.role).
      router.push(AFTER_LOGIN_HREF);
      return;
    }
    if (result.code === "VALIDATION_FAILED" && applyFieldErrors(result.problem, LOGIN_FIELDS, setError)) {
      return;
    }
    if (result.code === "AUTH_INVALID_CREDENTIALS" || result.code === "AUTH_LOGIN_LOCKED") {
      resetField("password");
    }
    setOutcome({ code: result.code, problem: result.problem, email: values.email });
  }

  const locked = outcome?.code === "AUTH_LOGIN_LOCKED";

  return (
    <>
      <OutcomeAlert outcome={outcome} alertRef={alertRef} />

      <form className="auth__form" onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={isSubmitting}>
        {/* fieldset deshabilita todos los controles juntos mientras se ingresa o con el ingreso bloqueado */}
        <fieldset className="auth__fieldset" disabled={isSubmitting || locked}>
          <TextField
            id="login-email"
            label="Email institucional"
            type="email"
            inputMode="email"
            placeholder="nombre@alu.frlp.utn.edu.ar"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            error={fieldError(errors.email?.message)}
            helper={
              <ResponsiveText
                long="¿Sos docente o autoridad? Usá el email con el que te dio de alta un administrador."
                short="¿Sos docente? Usá el email con el que te dieron de alta."
              />
            }
            {...register("email")}
          />

          <PasswordField
            id="login-password"
            label="Contraseña"
            placeholder="Tu contraseña"
            autoComplete="current-password"
            error={fieldError(errors.password?.message)}
            {...register("password")}
          />

          <div className="login__options">
            <Checkbox label="Recordarme" {...register("remember")} />
            {/* TODO(rutas): llevar a Recuperar contraseña (HU-02) cuando exista la pantalla. Ver TASK-008. */}
            <Link href={FORGOT_PASSWORD_HREF} className="login__forgot">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="auth__submit"
            loading={isSubmitting}
            loadingLabel="Ingresando…"
          >
            Ingresar
          </Button>
        </fieldset>
      </form>
    </>
  );
}
