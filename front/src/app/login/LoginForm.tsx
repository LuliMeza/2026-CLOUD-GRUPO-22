"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { Button, Checkbox, PasswordField, TextField } from "@/components";
import { FORGOT_PASSWORD_HREF } from "./routes";

/**
 * Formulario de login — solo estado por defecto.
 * Errores y carga vienen después: cada campo ya tiene slot de ayuda con
 * aria-describedby y la prop `invalid` (aria-invalid) lista para usarse.
 */
export function LoginForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO(auth): conectar con el servicio de login cuando exista (TDD-AUTH-H1).
    // Leer los valores con `new FormData(event.currentTarget)`:
    // "identifier", "password" y "remember".
  }

  return (
    <form className="login__form" onSubmit={handleSubmit} noValidate>
      <TextField
        id="login-identifier"
        name="identifier"
        label="Email o usuario"
        placeholder="Tu email o tu usuario"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        helper={
          <>
            <span className="login__copy-long">
              Si un administrador te dio de alta, usá el usuario que te asignó.
            </span>
            <span className="login__copy-short">¿Te dio de alta un administrador? Usá tu usuario.</span>
          </>
        }
      />

      <PasswordField
        id="login-password"
        name="password"
        label="Contraseña"
        placeholder="Tu contraseña"
        autoComplete="current-password"
      />

      <div className="login__options">
        <Checkbox name="remember" label="Recordarme" />
        <Link href={FORGOT_PASSWORD_HREF} className="login__forgot">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <Button type="submit" variant="primary" size="lg" className="login__submit">
        Ingresar
      </Button>
    </form>
  );
}
