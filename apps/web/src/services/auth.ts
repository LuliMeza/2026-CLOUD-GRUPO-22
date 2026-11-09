import {
  loginEndpoint,
  registerEndpoint,
  resendCodeEndpoint,
  verifyEmailEndpoint,
  type LoginValues,
  type RegisterValues,
  type ResendCodeValues,
  type VerifyEmailValues,
} from "@cloud-grupo-22/shared";
import { callEndpoint } from "./api";

/*
 * Servicios de autenticación: cada uno es el contrato de @cloud-grupo-22/shared llamado
 * por el cliente único. Qué puede devolver cada uno: docs/api/catalogo-de-errores.md.
 */

export const login = (values: LoginValues) => callEndpoint(loginEndpoint, values);

export const register = (values: RegisterValues) =>
  // El formulario trae además "Repetí la contraseña", que no viaja al back.
  callEndpoint(registerEndpoint, { email: values.email, password: values.password });

export const verifyEmail = (values: VerifyEmailValues) => callEndpoint(verifyEmailEndpoint, values);

export const resendCode = (values: ResendCodeValues) => callEndpoint(resendCodeEndpoint, values);
