import type { Metadata } from "next";
import { verifyEmailSchema } from "@cloud-grupo-22/shared";
import { REGISTER_EMAIL_PARAM, REGISTER_RESEND_PARAM, REGISTER_STEP_PARAM } from "../_auth/routes";
import { RegisterFlow } from "./RegisterFlow";

export const metadata: Metadata = {
  title: "Creá tu cuenta · Aula Clara UTN",
};

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/**
 * Crear cuenta (HU-01): paso 1 (email y contraseña) y paso 2 (confirmar el email con el
 * código) en la misma página. `?paso=2&email=…` abre directo el paso 2 (ej. desde el login,
 * con un email sin confirmar); sin un email válido, abre el paso 1.
 */
export default async function RegisterPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const email = first(params[REGISTER_EMAIL_PARAM]) ?? "";
  const emailOk = verifyEmailSchema.shape.email.safeParse(email).success;
  const step2 = first(params[REGISTER_STEP_PARAM]) === "2" && emailOk;

  return (
    <RegisterFlow
      initialStep={step2 ? 2 : 1}
      initialEmail={emailOk ? email : ""}
      resendOnMount={step2 && first(params[REGISTER_RESEND_PARAM]) === "1"}
    />
  );
}
