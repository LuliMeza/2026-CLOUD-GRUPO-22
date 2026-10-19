# Design System y Accesibilidad (Frontend)

## Fuente de verdad

El sistema de diseño "Aula Clara UTN" (paleta clara/oscura, tipografía, espaciado, radios y los
componentes `Button`/`Badge`/`Card`) vive en un Design System artifact de Cowork — no es un
paquete que se instale, se sincroniza a mano hacia el código de este repo. Esa sincronización ya
está hecha y vive en:

- `front/src/app/globals.css` — tokens de color/espaciado/radios y las clases de texto (`.h1`,
  `.body`, etc.), con su bloque `[data-theme="dark"]`.
- `front/src/app/layout.tsx` — carga de Work Sans y Plus Jakarta Sans vía `next/font/google`.
- `front/src/components/ds.css` — clases de componentes (`.ac-btn`, `.ac-badge`, `.ac-card`).
- `front/src/components/{Button,Badge,Card}.tsx` — los componentes de React sobre esas clases.

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

Ninguna tarea de `front/` que agregue o cambie una pantalla o componente visible se da por
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
