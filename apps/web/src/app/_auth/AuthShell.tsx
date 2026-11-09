"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { Panel, ThemeToggle, type PanelGlass } from "@/components";
import { MOTION_DURATION, MOTION_EASE } from "@/styles/motion";
import "./auth.css";

/* Estructura de las pantallas de autenticación: ilustración + marca a la izquierda en
   desktop; tarjeta de vidrio sobre la ilustración en tablet y mobile.
   Con `centered` (paso 2 del registro) la tarjeta pasa al centro en desktop, con la marca y el
   tagline arriba, y la ilustración queda de fondo, borrosa; en tablet y mobile solo se
   desenfoca el fondo. El cambio se anima con Motion (docs/standards/frontend-design-system.md).
   La carpeta _auth empieza con guion bajo para que Next no la tome como ruta. */

/** Ilustración de la facultad (día o noche). Decorativa: alt vacío. */
function Illustration({ variant }: { variant: "dia" | "noche" }) {
  const base = `/img/login/facultad-${variant}`;
  return (
    // Las dos versiones van en el HTML y CSS muestra la del tema activo. loading="lazy"
    // hace que el navegador no descargue la que queda con display:none.
    <picture className={`auth__art auth__art--${variant}`}>
      <source
        type="image/webp"
        srcSet={`${base}-1280.webp 1280w, ${base}.webp 2528w`}
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
      <img src={`${base}.jpg`} alt="" width={2528} height={1696} loading="lazy" decoding="async" />
    </picture>
  );
}

/** Movimiento de la marca, el tagline y la tarjeta entre el layout normal y el centrado. */
const MOVE = { layout: { duration: MOTION_DURATION.move, ease: MOTION_EASE } };

/** Logo + wordmark. `place`: columna de desktop, tarjeta, o barra superior de mobile. */
function Brand({ place }: { place: "aside" | "card" | "bar" }) {
  return (
    // Solo la de la columna se mueve (pasa arriba de la tarjeta en el layout centrado).
    <motion.div
      layout={place === "aside" ? "position" : undefined}
      transition={MOVE}
      className={`auth__brand auth__brand--${place}`}
    >
      {/* TODO(logo): reemplazar este slot por el logo de Aula Clara cuando exista. */}
      <div className="auth__logo-slot" aria-hidden="true">
        Logo
      </div>
      <p className="auth__wordmark">
        <span>Aula Clara</span>
        <span className="auth__wordmark-utn">UTN</span>
      </p>
    </motion.div>
  );
}

function Tagline({ place }: { place: "aside" | "card" }) {
  return (
    // TODO(tagline): reemplazar por el tagline definitivo de Aula Clara.
    <motion.div
      layout={place === "aside" ? "position" : undefined}
      transition={MOVE}
      className={`auth__tagline auth__tagline--${place}`}
    >
      <span className="auth__tagline-overline">Tagline · A definir</span>
      <p className="auth__tagline-text">[Tagline de Aula Clara]</p>
    </motion.div>
  );
}

/** La tarjeta acepta `ref` (React 19) y Motion le pone la animación de layout. */
const MotionPanel = motion.create(Panel);

interface AuthHeaderProps {
  /** Título de la pantalla (único h1). */
  title: ReactNode;
  /** Bajada debajo del título. */
  subtitle?: ReactNode;
  /** Arriba del título, ej. <StepIndicator />. */
  eyebrow?: ReactNode;
  /**
   * Mover el foco al título al aparecer. Para cuando el contenido de la tarjeta cambia sin
   * cambiar de página (ej. paso 1 → paso 2): el lector de pantalla anuncia el título nuevo y
   * el Tab sigue desde ahí.
   */
  focusOnMount?: boolean;
}

/** Encabezado de la tarjeta: indicador opcional, título y bajada. */
export function AuthHeader({ title, subtitle, eyebrow, focusOnMount = false }: AuthHeaderProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focusOnMount) titleRef.current?.focus({ preventScroll: true });
    // Solo al montar (es la llegada a este contenido), no si la prop cambia después.
  }, []);

  return (
    <header className={["auth__header", eyebrow ? "auth__header--eyebrow" : null].filter(Boolean).join(" ")}>
      {eyebrow}
      <h1 ref={titleRef} className="auth__title" tabIndex={focusOnMount ? -1 : undefined}>
        {title}
      </h1>
      {subtitle ? <p className="auth__subtitle">{subtitle}</p> : null}
    </header>
  );
}

/** Pie de la tarjeta, debajo de un divisor (ej. <AuthAltAction />). */
export function AuthFooter({ children }: { children: ReactNode }) {
  return (
    <>
      <hr className="auth__divider" />
      {children}
    </>
  );
}

interface AuthShellProps {
  /** Título de la pantalla (único h1). Sin título, `children` trae su propio <AuthHeader />. */
  title?: ReactNode;
  /** Bajada debajo del título. */
  subtitle?: ReactNode;
  /** Arriba del título, ej. <StepIndicator />. */
  eyebrow?: ReactNode;
  /** Contenido principal: avisos y formulario. */
  children: ReactNode;
  /** Debajo de un divisor, ej. <AuthAltAction />. */
  footer?: ReactNode;
  /** Vidrio de la tarjeta en tablet/mobile. `strong` para formularios largos. */
  glass?: PanelGlass;
  /** En tablet, mostrar el tagline dentro de la tarjeta (debajo de la marca). */
  cardTagline?: boolean;
  /** En mobile, la marca va en una barra superior en vez de dentro de la tarjeta. */
  mobileHeader?: boolean;
  /**
   * Layout centrado: en desktop la tarjeta va al centro con la marca y el tagline arriba, y la
   * ilustración queda de fondo, borrosa. En tablet y mobile solo se desenfoca el fondo.
   */
  centered?: boolean;
  /**
   * Identifica el contenido de la tarjeta. Al cambiar, el contenido viejo se desvanece, entra
   * el nuevo y la tarjeta ajusta su alto con una animación (ej. "paso-1" → "paso-2").
   */
  contentKey?: string;
}

export function AuthShell({
  title,
  subtitle,
  eyebrow,
  children,
  footer,
  glass = "light",
  cardTagline = false,
  mobileHeader = false,
  centered = false,
  contentKey = "content",
}: AuthShellProps) {
  const reduceMotion = useReducedMotion();

  // Alto del contenido de la tarjeta, medido. Mientras cambia el contenido el alto queda fijo
  // en píxeles y se anima hacia el nuevo; el resto del tiempo es "auto" (un error que aparece
  // en un campo agranda la tarjeta sin animación, como siempre).
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const [lastKey, setLastKey] = useState(contentKey);
  const [resizing, setResizing] = useState(false);
  if (contentKey !== lastKey) {
    setLastKey(contentKey);
    setResizing(true);
  }

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setContentHeight(entry.borderBoxSize[0]?.blockSize ?? el.offsetHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!resizing) return;
    // Lo que dura el movimiento completo; después el alto vuelve a "auto".
    const timer = setTimeout(() => setResizing(false), MOTION_DURATION.move * 1000 + 100);
    return () => clearTimeout(timer);
  }, [resizing, lastKey]);

  const rootClasses = [
    "auth",
    glass === "strong" ? "auth--glass-strong" : null,
    cardTagline ? "auth--card-tagline" : null,
    mobileHeader ? "auth--mobile-header" : null,
    centered ? "auth--centered" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    // Con "reducir movimiento" activo, Motion saca los desplazamientos y deja los fundidos.
    <MotionConfig reducedMotion="user">
      <div className={rootClasses}>
        {/* Primero en el DOM para que sea el primer Tab. */}
        <ThemeToggle className="auth__theme" />

        {mobileHeader ? (
          <header className="auth__topbar">
            <Brand place="bar" />
          </header>
        ) : null}

        {/* Ilustración: columna izquierda en desktop, fondo de toda la página en el resto y en el
            layout centrado. */}
        <div className="auth__art-layer">
          <Illustration variant="dia" />
          <Illustration variant="noche" />
        </div>

        <div className="auth__art-col">
          <Brand place="aside" />
          <Tagline place="aside" />
        </div>

        {/* Continuación del horizonte de la ilustración, por detrás de la tarjeta (solo desktop). */}
        <svg className="auth__horizon" viewBox="0 0 720 24" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path
            d="M0 11.9 C30 13 60 10.6 100 11.8 S170 14.4 210 12.6 S280 10 330 11.6 S410 14.6 460 12.8 S540 10.3 590 12 S670 14.5 720 13"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <main className="auth__main">
          <MotionPanel layout="position" transition={MOVE} variant="glass-touch" glass={glass} className="auth__card">
            <div className="auth__card-brand">
              <Brand place="card" />
              <Tagline place="card" />
            </div>

            <motion.div
              className="auth__card-body"
              initial={false}
              animate={{ height: resizing && contentHeight != null ? contentHeight : "auto" }}
              transition={{ duration: resizing && !reduceMotion ? MOTION_DURATION.resize : 0, ease: MOTION_EASE }}
              // Recorta solo mientras cambia el alto: el resto del tiempo el anillo de foco de
              // los campos puede salir del borde.
              style={{ overflow: resizing ? "hidden" : "visible" }}
            >
              <div ref={contentRef}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={contentKey}
                    className="auth__card-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: MOTION_DURATION.fade, ease: "easeOut" }}
                  >
                    {title ? <AuthHeader title={title} subtitle={subtitle} eyebrow={eyebrow} /> : null}
                    {children}
                    {footer ? <AuthFooter>{footer}</AuthFooter> : null}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </MotionPanel>
        </main>
      </div>
    </MotionConfig>
  );
}
