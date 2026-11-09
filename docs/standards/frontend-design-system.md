# Design System y Accesibilidad (Frontend)

## Fuente de verdad

El sistema de diseño "Aula Clara UTN" (paleta clara/oscura, tipografía, espaciado, radios y los
componentes `Button`/`Badge`/`Card`) vive en un Design System artifact de Cowork — no es un
paquete que se instale, se sincroniza a mano hacia el código de este repo. Esa sincronización ya
está hecha y vive en:

- `apps/web/src/app/globals.css` — tokens de color/espaciado/radios y las clases de texto (`.h1`,
  `.body`, etc.), con su bloque `[data-theme="dark"]`.
- `apps/web/src/app/layout.tsx` — carga de Work Sans y Plus Jakarta Sans vía `next/font/google`.
- `apps/web/src/components/ds.css` — clases de componentes (`.ac-btn`, `.ac-badge`, `.ac-card`,
  `.ac-panel`, `.ac-field`, `.ac-checkbox`, `.ac-icon-btn`, `.ac-alert`, `.ac-spinner`, `.ac-steps`,
  `.ac-pending`, `.ac-text-long` / `.ac-text-short`).
- `apps/web/src/components/{Alert,Button,Badge,Card,Panel,TextField,PasswordField,Checkbox,PendingText,ResponsiveText,Spinner,StepIndicator,ThemeToggle}.tsx`
  — los componentes de React sobre esas clases (`theme.ts`: tema día/noche).
- `apps/web/src/components/icons.tsx` — íconos del sistema sobre `lucide-react`: fija 20 px, trazo
  1,8 y `aria-hidden`. La app importa los íconos siempre desde acá, nunca directo de la librería.

## Componentes de estado y formularios

- `TextField` / `PasswordField`: `helper` para la ayuda y `error` para el error. El error
  reemplaza a la ayuda, pone el borde en `--danger` (2 px), marca `aria-invalid` y queda
  vinculado por `aria-describedby`. Aceptan `ref`, así se usan con `register()` de
  react-hook-form (convenciones en [CONTRIBUTING.md](../../CONTRIBUTING.md#estándares)).
- `Alert`: aviso con tono `danger` (algo salió mal), `warning` (algo impide seguir) o `accent`
  (falta un paso, sin ser error; fondo `--success-tint`). Título, descripción, `actions` y
  `footnote` opcionales. Lleva `role="alert"` y `tabIndex={-1}`: al aparecer, mover el foco con
  su `ref`.
- `Button`: variantes `primary`, `secondary`, `ghost`, `accent` (acción principal dentro de un
  aviso accent) y `outline` (secundaria sobre fondo teñido). `loading` + `loadingLabel` muestran
  `Spinner` y anuncian el texto con `role="status"`.
- `Spinner`: decorativo; con `prefers-reduced-motion` gira más lento en vez de detenerse.
- `PasswordField`: maneja solo su visibilidad, o la recibe controlada (`visible` +
  `onVisibleChange`) cuando un botón muestra varias contraseñas a la vez; `toggleLabels` y
  `controls` ajustan el nombre accesible y el `aria-controls` del botón.
- `ResponsiveText`: texto con versión larga (≥ 768 px) y corta (mobile), cuando el diseño tiene
  las dos. Se usa en línea, dentro de una ayuda, un aviso o un párrafo.
- `StepIndicator`: "Paso N de M" + barras decorativas, arriba del título de un flujo de pasos.
- `PendingText`: dato todavía no definido, con subrayado punteado (convención del diseño). Cada
  uso lleva un TODO con la tarea que lo resuelve.
- `Panel glass="strong"`: vidrio casi opaco (`--glass-bg-strong`, `--glass-blur-strong`) para
  formularios largos sobre la ilustración; con vidrio fuerte el texto secundario va en
  `--ink-muted`.

## Animaciones (Motion)

Las animaciones de interfaz usan **Motion** (`motion`, antes framer-motion). Se eligió sobre la
View Transitions API nativa porque se van a sumar animaciones en otras pantallas y Motion se
comporta igual en todos los navegadores (decisión de TASK-013).

- Importar siempre desde `motion/react`. Solo en componentes de cliente (`"use client"`).
- Movimiento entre dos lugares del layout (ej. la tarjeta del registro que pasa al centro):
  `layout` / `layoutId`, no cálculos de posición a mano.
- Entradas y salidas de contenido: `AnimatePresence`.
- **Movimiento reducido (WCAG 2.3.3)**: toda animación respeta `prefers-reduced-motion`. Las
  zonas animadas van dentro de `<MotionConfig reducedMotion="user">`: con la preferencia activa,
  Motion saca los desplazamientos y deja solo los cambios de opacidad.
- Duraciones cortas (150–700 ms) y la misma curva en toda la app, tomadas de
  `apps/web/src/styles/motion.ts` (`MOTION_EASE`, `MOTION_DURATION`); nada en bucle salvo
  indicadores de carga (`Spinner`). Si una transición de CSS acompaña a una animación de Motion
  (ej. el desenfoque de la ilustración en auth), usa los mismos valores.
- Un elemento que cambia de tamaño mientras se mueve: `layout="position"` y el alto animado
  aparte, para que el texto no se deforme (ver `AuthShell`).
- Una animación nunca es la única forma de enterarse de algo: el cambio de estado también se
  anuncia o se ve sin ella (foco, texto, `role="status"`).

## Tema día / noche

- El tema claro es el default. El oscuro aplica con `data-theme="dark"` en `<html>` (lo pone
  `ThemeToggle` y lo recuerda en `localStorage`) o, si el usuario no eligió, con
  `prefers-color-scheme: dark`. Por eso el bloque oscuro de tokens está dos veces en
  `globals.css`: cualquier cambio se hace en los dos.
- En oscuro los inputs de texto usan `--input-bg` (= `surface-100`, un paso más oscuro que la
  tarjeta) con borde `border-strong`; en claro son blancos.

## Cuándo y cómo volver a sincronizar

Cualquier tarea que agregue o cambie algo visual (un color, un tamaño, un componente nuevo):

1. El cambio se refleja primero en el Design System artifact (la fuente de verdad), o parte de un
   cambio que ya se hizo ahí.
2. Se copia a mano el token o la clase nueva a los archivos de arriba. Nunca se hardcodea un
   color, un tamaño de fuente o un radio directo en un componente de la aplicación — si el valor
   no existe todavía como variable (`var(--token)`), se agrega al Design System primero.
3. No se crea una paleta, tipografía o escala de espaciado paralela "para un caso puntual": toda
   UI nueva se construye sobre estos tokens.

## WCAG 2.1 — nivel AA (exigible)

Ninguna tarea de `apps/web/` que agregue o cambie una pantalla o componente visible se da por
terminada sin cumplir esto:

- **1.4.3 Contraste** — texto normal ≥4.5:1, texto grande (≥24px, o ≥19px en negrita) ≥3:1,
  contra el fondo real donde se usa, en los dos temas.
- **1.4.11 Contraste no textual** — un borde, anillo de foco o ícono que transmite estado
  ≥3:1 contra su fondo. Un divisor puramente decorativo (`--border`) no lo necesita; lo que sí
  transmite algo usa `--border-strong`.
- **1.4.1 Uso del color** — ningún estado (una valoración, un error, un éxito) se comunica solo
  por color: siempre va con texto o un ícono con significado propio.
- **1.4.4 Cambio de tamaño del texto** — tamaños de fuente en `rem`, nunca `px` fijo, para que el
  zoom de texto del navegador funcione.
- **2.1.1 Teclado** y **2.4.3 Orden de foco** — todo control interactivo se maneja con
  Tab/Enter/Espacio sin mouse, en un orden que sigue el layout visual. Preferir elementos HTML
  nativos (`<button>`, `<a>`, `<input>`) sobre un `<div onClick>`: el rol y el estado se anuncian
  solos.
- **2.4.7 Foco visible** — ningún control suprime el `outline` por defecto sin poner un anillo de
  foco propio visible (≥3:1).
- **2.5.8 Tamaño del objetivo** (AA en WCAG 2.2) — un control táctil mide al menos 44×44px
  (`min-height`/`min-width`), salvo que esté corrido dentro de una línea de texto.
- **3.3.2 Etiquetas** — todo input de formulario tiene un `<label>` asociado, nunca solo un
  placeholder.
- **4.1.2 Nombre, rol, valor** — un componente no estándar (un dropdown, un modal propios) expone
  su rol y estado por ARIA si no hay un elemento nativo equivalente.

Antes de dar una tarea visual por terminada: probarla con el teclado solo (Tab por toda la
pantalla) y con el zoom del navegador al 200%. Si algo se rompe ahí, la tarea no está lista.

## Referencia

El Design System artifact ("Aula Clara UTN") tiene el detalle completo de cada token, componente
y la auditoría de accesibilidad original en su propio README — pedirle el link a quien lo
mantiene si no está a mano.
