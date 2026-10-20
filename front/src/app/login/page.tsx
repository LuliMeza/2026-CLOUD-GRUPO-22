import type { Metadata } from "next";
import { ButtonLink, Panel, ThemeToggle } from "@/components";
import { LoginForm } from "./LoginForm";
import { REGISTER_HREF } from "./routes";
import "./login.css";

export const metadata: Metadata = {
  title: "Ingresá a tu cuenta · Aula Clara UTN",
};

/** Ilustración de la facultad (día o noche). Decorativa: alt vacío. */
function Illustration({ variant }: { variant: "dia" | "noche" }) {
  const base = `/img/login/facultad-${variant}`;
  return (
    // Las dos versiones van en el HTML y CSS muestra la del tema activo. loading="lazy"
    // hace que el navegador no descargue la que queda con display:none.
    <picture className={`login__art login__art--${variant}`}>
      <source
        type="image/webp"
        srcSet={`${base}-1280.webp 1280w, ${base}.webp 2528w`}
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
      <img src={`${base}.jpg`} alt="" width={2528} height={1696} loading="lazy" decoding="async" />
    </picture>
  );
}

/** Logo + wordmark. `place` decide dónde se muestra (columna de desktop o tarjeta). */
function Brand({ place }: { place: "aside" | "card" }) {
  return (
    <div className={`login__brand login__brand--${place}`}>
      {/* TODO(logo): reemplazar este slot por el logo de Aula Clara cuando exista. */}
      <div className="login__logo-slot" aria-hidden="true">
        Logo
      </div>
      <p className="login__wordmark">
        <span>Aula Clara</span>
        <span className="login__wordmark-utn">UTN</span>
      </p>
    </div>
  );
}

function Tagline({ place }: { place: "aside" | "card" }) {
  return (
    // TODO(tagline): reemplazar por el tagline definitivo de Aula Clara.
    <div className={`login__tagline login__tagline--${place}`}>
      <span className="login__tagline-overline">Tagline · A definir</span>
      <p className="login__tagline-text">[Tagline de Aula Clara]</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="login">
      {/* Primero en el DOM para que sea el primer Tab. */}
      <ThemeToggle className="login__theme" />

      <div className="login__art-col">
        <Illustration variant="dia" />
        <Illustration variant="noche" />
        <Brand place="aside" />
        <Tagline place="aside" />
      </div>

      {/* Continuación del horizonte de la ilustración, por detrás de la tarjeta (solo desktop). */}
      <svg
        className="login__horizon"
        viewBox="0 0 720 24"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M0 11.9 C30 13 60 10.6 100 11.8 S170 14.4 210 12.6 S280 10 330 11.6 S410 14.6 460 12.8 S540 10.3 590 12 S670 14.5 720 13"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <main className="login__main">
        <Panel variant="glass-touch" className="login__card">
          <div className="login__card-brand">
            <Brand place="card" />
            <Tagline place="card" />
          </div>

          <header className="login__header">
            <h1 className="login__title">Ingresá a tu cuenta</h1>
            <p className="login__subtitle">Usá tu email o tu nombre de usuario.</p>
          </header>

          <LoginForm />

          <hr className="login__divider" />

          <section className="login__signup" aria-label="Crear cuenta">
            <div className="login__signup-row">
              <span className="login__signup-question">¿Todavía no tenés cuenta?</span>
              <ButtonLink href={REGISTER_HREF} variant="secondary" size="lg" className="login__signup-btn">
                Crear cuenta
              </ButtonLink>
            </div>
            <p className="login__note">
              <span className="login__copy-long">
                Para crear una cuenta necesitás tu email institucional de la UTN.
              </span>
              <span className="login__copy-short">Necesitás tu email institucional de la UTN.</span>
            </p>
          </section>
        </Panel>
      </main>
    </div>
  );
}
