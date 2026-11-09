"use client";

import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, ClockIcon, ResponsiveText, StepIndicator, TextField } from "@/components";
import { resendCode, verifyEmail } from "@/services/auth";
import { applyFieldErrors } from "@/services/form-errors";
import { OTP_LENGTH, verifyEmailSchema, type Problem } from "@cloud-grupo-22/shared";
import { VERIFY_EMAIL_MESSAGES, type VerifyCodeIssue } from "@/validations/verify-email";
import { ApiErrorAlert } from "@/messages/ApiErrorAlert";
import { formatWait } from "@/messages/api-errors";
import { AuthAltAction } from "../_auth/AuthAltAction";
import { AuthFooter, AuthHeader } from "../_auth/AuthShell";
import { AFTER_LOGIN_HREF } from "../_auth/routes";
import { useCountdown } from "./useCountdown";

/** El paso 2 solo pide el código: el email viene del paso 1. */
const codeSchema = verifyEmailSchema.pick({ code: true });
type CodeValues = { code: string };
const CODE_FIELDS = ["code"] as const;

type VerifyErrorCode = Exclude<Awaited<ReturnType<typeof verifyEmail>>, { ok: true }>["code"];
type ResendErrorCode = Exclude<Awaited<ReturnType<typeof resendCode>>, { ok: true }>["code"];

/** Lo que se muestra como aviso arriba del formulario (uno a la vez). */
type Notice =
  | { kind: "resent" }
  | { kind: "verify-error"; code: VerifyErrorCode; problem: Problem | null }
  | { kind: "resend-error"; code: ResendErrorCode; problem: Problem | null }
  | null;

/**
 * Por qué el código no se puede usar: venció (hay que pedir otro) o hubo demasiados
 * intentos (bloqueado hasta poder pedir otro). Deshabilita el campo y "Confirmar".
 */
type Blocked = "expired" | "locked" | null;

function fieldError(message: string | undefined): ReactNode {
  if (!message) return undefined;
  return VERIFY_EMAIL_MESSAGES[message as VerifyCodeIssue] ?? message;
}

const secondsFromNow = (seconds: number | undefined) => (seconds ? Date.now() + seconds * 1000 : null);

interface VerifyEmailStepProps {
  /** Email al que se mandó el código (el del paso 1). */
  email: string;
  /** Mover el foco al título al aparecer (cuando se llega desde el paso 1). */
  focusTitle?: boolean;
  /** Pedir un código nuevo al aparecer (botón "Reenviar código" del login). */
  resendOnMount?: boolean;
  /** "Volver al paso 1". */
  onBack: () => void;
}

/**
 * Paso 2 de 2 de Crear cuenta (HU-01): confirmar el email con el código de 6 dígitos.
 * Estados del diseño (Registro-Paso2-*): por defecto, código incorrecto (en el campo),
 * verificando, código reenviado, código vencido y demasiados intentos.
 * Es el contenido completo de la tarjeta (encabezado, formulario y pie), porque el pie
 * depende del estado (reenviar, espera, vencido).
 */
export function VerifyEmailStep({ email, focusTitle = false, resendOnMount = false, onBack }: VerifyEmailStepProps) {
  const router = useRouter();
  const [notice, setNotice] = useState<Notice>(null);
  const [blocked, setBlocked] = useState<Blocked>(null);
  const [resending, setResending] = useState(false);
  // Hasta cuándo no se puede pedir otro código (lo dice el back, regla de TASK-007).
  const [resendUntil, setResendUntil] = useState<number | null>(null);
  const resendWait = useCountdown(resendUntil);
  const alertRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    resetField,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CodeValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Al llegar un aviso, el foco va a él (lo anuncia el lector y queda a la vista).
  useEffect(() => {
    if (notice) alertRef.current?.focus();
  }, [notice]);

  // Error en el campo (incorrecto, o el que mandó el back): foco al campo cuando el fieldset
  // ya se habilitó.
  useEffect(() => {
    if (!isSubmitting && errors.code?.type === "server") setFocus("code", { shouldSelect: true });
  }, [isSubmitting, errors.code, setFocus]);

  async function onSubmit({ code }: CodeValues) {
    setNotice(null);
    const result = await verifyEmail({ email, code });

    if (result.ok) {
      // TODO(auth): la sesión la deja el back en una cookie (contrato auth.verifyEmail); falta el
      // destino según el rol (result.data.user.role).
      router.push(AFTER_LOGIN_HREF);
      return;
    }
    switch (result.code) {
      case "AUTH_OTP_INVALID":
        setError("code", { type: "server", message: "codeInvalid" satisfies VerifyCodeIssue });
        return;
      case "AUTH_OTP_EXPIRED":
        // Ese código ya no sirve: el campo queda vacío y deshabilitado hasta pedir otro.
        resetField("code");
        setBlocked("expired");
        break;
      case "AUTH_OTP_TOO_MANY_ATTEMPTS":
        resetField("code");
        setBlocked("locked");
        setResendUntil(secondsFromNow(result.problem?.retryAfterSeconds));
        break;
      case "VALIDATION_FAILED":
        if (applyFieldErrors(result.problem, CODE_FIELDS, setError)) return;
        break;
    }
    setNotice({ kind: "verify-error", code: result.code, problem: result.problem });
  }

  async function onResend() {
    setResending(true);
    const result = await resendCode({ email });
    setResending(false);

    if (result.ok) {
      // El código anterior ya no sirve: se limpia el campo y se puede volver a intentar.
      setBlocked(null);
      resetField("code");
      clearErrors();
      setResendUntil(secondsFromNow(result.data.retryAfterSeconds));
      setNotice({ kind: "resent" });
      return;
    }
    if (result.code === "AUTH_OTP_RESEND_TOO_SOON") {
      // El diseño lo muestra con el botón deshabilitado y la espera debajo, sin aviso.
      setResendUntil(secondsFromNow(result.problem?.retryAfterSeconds));
      return;
    }
    setNotice({ kind: "resend-error", code: result.code, problem: result.problem });
  }

  // "Reenviar código" del login: pide el código al llegar (una sola vez, también en StrictMode).
  const resentOnMount = useRef(false);
  useEffect(() => {
    if (!resendOnMount || resentOnMount.current) return;
    resentOnMount.current = true;
    void onResend();
    // Solo al montar: es el pedido que trajo al usuario hasta acá.
  }, []);

  const busy = isSubmitting || resending;
  // Bloqueado sin espera conocida: no se puede pedir otro hasta que el back lo diga.
  const resendDisabled = busy || resendWait > 0 || (blocked === "locked" && resendUntil == null);

  return (
    <>
      <AuthHeader
        eyebrow={<StepIndicator current={2} total={2} />}
        title="Confirmá tu email"
        subtitle={
          <ResponsiveText
            long={`Te mandamos un código de ${OTP_LENGTH} dígitos a ${email}. Ingresalo para activar tu cuenta.`}
            short={`Te mandamos un código de ${OTP_LENGTH} dígitos a tu casilla. Ingresalo para activar tu cuenta.`}
          />
        }
        focusOnMount={focusTitle}
      />

      <NoticeAlert notice={notice} alertRef={alertRef} resending={resending} onResend={onResend} />

      <form className="auth__form" onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={isSubmitting}>
        <fieldset className="auth__fieldset" disabled={isSubmitting || blocked !== null}>
          <TextField
            id="verify-code"
            label="Código de verificación"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={OTP_LENGTH}
            placeholder={"0".repeat(OTP_LENGTH)}
            className="register__code"
            error={fieldError(errors.code?.message)}
            helper="Si no lo ves, revisá la carpeta de spam."
            {...register("code")}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="auth__submit"
            loading={isSubmitting}
            loadingLabel="Verificando…"
          >
            Confirmar
          </Button>
        </fieldset>
      </form>

      <AuthFooter>
        <AuthAltAction
          ariaLabel="Reenviar el código"
          // Con el código vencido, pedir otro es la acción del aviso: el pie no la repite.
          question={blocked === "expired" ? undefined : "¿No te llegó el código?"}
          action={
            blocked === "expired" ? undefined : (
              // TODO(TASK-007): el tiempo de espera entre reenvíos lo define el back.
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="auth__alt-btn"
                disabled={resendDisabled}
                onClick={onResend}
              >
                Reenviar código
              </Button>
            )
          }
          note={[
            resendWait > 0 && blocked !== "locked" ? <>Podés pedir otro en {formatWait(resendWait)}.</> : null,
            <>
              ¿Te equivocaste de email?{" "}
              <button type="button" className="auth__inline-action" onClick={onBack}>
                Volver al paso 1
              </button>
            </>,
          ]}
        />
      </AuthFooter>
    </>
  );
}

interface NoticeAlertProps {
  notice: Notice;
  alertRef: Ref<HTMLDivElement>;
  resending: boolean;
  onResend: () => void;
}

function NoticeAlert({ notice, alertRef, resending, onResend }: NoticeAlertProps) {
  if (!notice) return null;

  if (notice.kind === "resent") {
    return (
      <Alert ref={alertRef} tone="accent" title="Te mandamos un código nuevo">
        <ResponsiveText
          long="Revisá tu email: el código anterior ya no sirve."
          short="Revisá tu email: el anterior ya no sirve."
        />
      </Alert>
    );
  }

  const context = { retryAfterSeconds: notice.problem?.retryAfterSeconds };

  if (notice.kind === "resend-error") {
    // PENDIENTE de diseño (TASK-013): error del servidor o sin conexión al reenviar.
    return <ApiErrorAlert code={notice.code} title="No pudimos reenviar el código" context={context} alertRef={alertRef} />;
  }

  switch (notice.code) {
    case "AUTH_OTP_EXPIRED":
      return (
        <ApiErrorAlert
          code={notice.code}
          context={context}
          alertRef={alertRef}
          icon={<ClockIcon strokeWidth={2} />}
          actions={
            <Button
              type="button"
              variant="primary"
              size="lg"
              loading={resending}
              // PENDIENTE de diseño (TASK-013): el diseño no muestra el estado de carga.
              loadingLabel="Mandando código…"
              onClick={onResend}
            >
              Mandarme un código nuevo
            </Button>
          }
        />
      );
    case "AUTH_OTP_TOO_MANY_ATTEMPTS":
      return <ApiErrorAlert code={notice.code} context={context} alertRef={alertRef} />;
    default:
      // PENDIENTE de diseño (TASK-013): error del servidor o sin conexión al confirmar.
      return <ApiErrorAlert code={notice.code} title="No pudimos confirmar tu email" context={context} alertRef={alertRef} />;
  }
}
