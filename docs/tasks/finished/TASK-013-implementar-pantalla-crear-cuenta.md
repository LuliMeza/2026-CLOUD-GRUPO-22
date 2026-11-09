# TASK-013: Implementar la pantalla Crear cuenta

Estado: Terminada (2026-11-09; validación manual del desarrollador aprobada)
Fecha: 2026-11-08
Historia: HU-01 (crear cuenta de alumno).
Depende de: TASK-006, TASK-011 y TASK-012. Relacionadas: TASK-007, TASK-008, TASK-009.

## 1. Contexto y Objetivo

Implementar `/registro` (Crear cuenta, paso 1 de 2) según la página "Crear cuenta" del diseño
(https://claude.ai/code/artifact/1e743281-4747-4b4e-91ed-1a14f0e04232): estado por defecto y
"email no institucional", en Desktop 1440, Tablet 768 y Mobile 390, noche y claro.

## 2. Alcance

- **Design System** (autorizado por el desarrollador):
  - `StepIndicator` nuevo ("Paso 1 de 2" + barras decorativas).
  - `PasswordField` con visibilidad controlada opcional (`visible`/`onVisibleChange`),
    `toggleLabels` y `controls`. Sin esas props funciona como antes (login sin cambios).
  - `Panel glass="strong"` y tokens `--glass-bg-strong` / `--glass-blur-strong` en `tokens.json`.
  - `PendingText` nuevo (dato a definir, subrayado punteado). Reemplaza a `login__pending`.
- **Estructura compartida** `src/app/_auth/`: `AuthShell` (ilustración, marca, tagline, toggle de
  tema, horizonte, tarjeta; props `glass`, `cardTagline`, `mobileHeader`), `AuthAltAction`
  (pie), `Copy` (texto largo/corto), `auth.css` y `routes.ts`. El login se refactorizó para
  usarla: capturas antes/después idénticas píxel a píxel en 3 anchos × 2 temas.
- **Crear cuenta**: `validations/register.ts`, `register()` en `services/auth.ts`
  (`POST /auth/register`), mocks en `mocks/handlers.ts`, `registro/RegisterForm.tsx` y
  `registro/page.tsx`. El link "Crear cuenta" del login ya no lleva TODO.

## 3. Decisiones

- **Mapeo de la API**: 2xx → paso 2 en la misma página (ver "Paso 2");
  400 con `code: "EMAIL_DOMAIN_NOT_ALLOWED"` → el mismo error del campo email (escenario 3);
  409 → aviso "Ya existe una cuenta con ese email"; otro o sin red → aviso genérico.
- Un solo botón muestra u oculta las dos contraseñas ("Mostrar contraseñas"), con
  `aria-controls` a los dos campos.
- Placeholder del email: `nombre@alu.frlp.utn.edu.ar` en todos los anchos (un placeholder no
  cambia por CSS).
- Alturas (TASK-009): la página hace scroll si no entra.
- Requisitos de contraseña (TASK-007): `PendingText` con TODO; no se inventa la política.

- **Paso 2 y animación (2026-11-08)**: diseño aprobado en el canvas (página "Crear cuenta":
  prototipos animados Desktop/Tablet/Mobile y estados del paso 2 en modo noche). La animación se
  implementa con **Motion** (`motion`, dependencia nueva) y no con la View Transitions API
  nativa: el desarrollador prevé otras animaciones en más pantallas y Motion funciona igual en
  todos los navegadores. Reglas de uso en `docs/standards/frontend-design-system.md`.

- **Paso 2 en la misma página, no en `/verificar-email`** (pedido del desarrollador): el alta
  correcta cambia el contenido de la tarjeta. `/registro?paso=2&email=…` abre directo el paso 2
  (lo usa el login con un email sin confirmar) y la URL se actualiza con `history.replaceState`
  para que recargar no pierda el paso, sin sumar entradas al historial.
  `routes.ts` reemplaza la constante `VERIFY_EMAIL_HREF` por `verifyEmailHref(email)`.
- **El email va en la URL** del paso 2: es lo que necesita el deep link del login. Queda en el
  historial del navegador; si el back implementa una sesión de registro, se puede sacar.
- **Cómo se anima** (desktop): la tarjeta, la marca y el tagline son los mismos elementos en los
  dos layouts y Motion mueve cada uno con `layout="position"` (FLIP, sin calcular posiciones a
  mano). La tarjeta no escala: su alto lo anima un contenedor medido (`auth__card-body`) solo
  mientras cambia el contenido, así un error que aparece en un campo no se anima. El contenido se
  desvanece y entra el nuevo con `AnimatePresence`. La ilustración (ancho, desenfoque, opacidad) y
  el horizonte usan transiciones de CSS con la misma duración y curva (`src/styles/motion.ts`).
- **Movimiento reducido**: con `prefers-reduced-motion` la tarjeta y la ilustración cambian de
  lugar sin desplazarse; quedan solo los fundidos.
- **Foco**: al cambiar de paso el foco va al título nuevo (`AuthHeader focusOnMount`) y cambia el
  `<title>` del documento. `/registro` pasa a ser dinámica (lee `searchParams`).
- **AuthShell** ahora es componente de cliente y suma `centered` y `contentKey`; exporta
  `AuthHeader` y `AuthFooter` para pantallas cuyo encabezado o pie depende del estado.
  `AuthAltAction` acepta una acción propia (`action`), pregunta opcional y varias notas.
- **Ícono `ClockIcon`** en `components/icons.tsx` y prop `icon` en `ApiErrorAlert` (código vencido).
  `components/index.ts` ahora exporta los íconos.

## Paso 2: confirmar el email

Diseño: prototipos `Registro-Paso2-Prototipo-*` y estados `Registro-Paso2-*-Noche` del canvas.

| Estado | Cuándo | Qué se ve |
|---|---|---|
| Por defecto | Llegada al paso 2 | Código vacío, "Confirmar", "Reenviar código" y "Volver al paso 1" |
| Verificando | Mientras se confirma | Campo y botón deshabilitados, "Verificando…", reenviar deshabilitado |
| Código incorrecto | `AUTH_OTP_INVALID` | Error en el campo, foco en el campo |
| Reenviado | `resendCode` ok | Aviso accent, campo vacío, reenviar deshabilitado con "Podés pedir otro en …" |
| Vencido | `AUTH_OTP_EXPIRED` | Aviso warning con reloj y "Mandarme un código nuevo"; campo deshabilitado; el pie solo tiene "Volver al paso 1" |
| Demasiados intentos | `AUTH_OTP_TOO_MANY_ATTEMPTS` | Aviso warning; campo y reenviar deshabilitados hasta que pase la espera |

La espera (`retryAfterSeconds`) la manda el back; sin ella se muestra `[tiempo de espera]`
(TASK-007). `AUTH_OTP_RESEND_TOO_SOON` no muestra aviso: deshabilita "Reenviar código" con la
espera debajo, como el diseño. Confirmar bien → `AFTER_LOGIN_HREF` (`TODO(auth)`, destino por rol).

Login: "Ingresar el código" lleva al paso 2 con el email del intento; "Reenviar código" también, y
pide el código al llegar (`&reenviar=1`, se borra de la URL para que recargar no lo repita).

## 4. Exclusiones

- Autenticación real (`TODO(auth)`) y destino según el rol después de confirmar.
- Tiempo de vigencia del código y espera entre reenvíos (TASK-007).

## 5. Textos que no están en el diseño (a validar con diseño)

- Email vacío: "Ingresá tu email."
- Contraseña vacía: "Elegí una contraseña."
- Contraseñas distintas: "Las contraseñas no coinciden."
- Email ya registrado: aviso danger "Ya existe una cuenta con ese email" / "Si es tuya, ingresá
  con ese email." + "Ingresar".
- Error del servidor: "No pudimos crear tu cuenta" / "Intentá de nuevo en unos minutos."
- Botón mientras se envía: "Creando cuenta…".
- Paso 2: código vacío "Ingresá el código que te mandamos."; formato "El código tiene 6 números.";
  "Mandarme un código nuevo" mientras se pide: "Mandando código…"; errores del servidor o sin
  conexión: "No pudimos confirmar tu email" / "No pudimos reenviar el código".

## 6. Criterios de Aceptación

- [x] Textos idénticos a los artboards Registro-* y Registro-Dominio-* (versión corta en mobile).
- [x] Email que no es `@alu.frlp.utn.edu.ar` → error del diseño, borde danger, foco en el email.
- [x] El mismo error aparece si el back responde 400 de dominio.
- [x] "Mostrar contraseñas" cambia los dos campos a la vez.
- [x] Contraseñas distintas → error en "Repetí la contraseña".
- [x] Tablet: tarjeta casi opaca, sin tagline. Mobile: marca en barra superior, tarjeta debajo.
- [x] El login sigue igual (sin regresiones de TASK-006/011/012).
- [x] Teclado solo y zoom al 200 % (checklist de `docs/standards/frontend-design-system.md`).
- [x] Paso 2: la tarjeta pasa al centro con la animación del prototipo en desktop; en tablet y
      mobile se queda y el fondo se desenfoca. "Volver al paso 1" hace el camino inverso y
      conserva el email.
- [x] Paso 2: los seis estados como en los artboards `Registro-Paso2-*` (3 anchos).
- [x] Con "reducir movimiento" activo no hay desplazamientos, solo fundidos.

## 7. Validaciones

- [x] `tsc --noEmit` y `next build` (con fuentes reemplazadas solo en el entorno de verificación).
- [x] Recorrido con Chromium headless y mocks: estados de dominio (cliente y servidor),
      contraseñas distintas, botón compartido, cargando, email existente y alta correcta.
- [x] Login: capturas antes/después del refactor idénticas (1440, 768, 390 × claro/noche) y sus
      cinco estados siguen funcionando.
- [x] Paso 2 (2026-11-09), Chromium con mocks: animación medida cuadro a cuadro (la tarjeta va de
      x 860 a 500 y su alto de 736 a 536 px; la marca de 48,48 al centro), los seis estados en
      1440/768/390 × noche/claro, sin scroll horizontal, foco al título al cambiar de paso,
      volver al paso 1 con el email, deep link y "Reenviar código" del login, y movimiento reducido.
- [x] Validación manual del desarrollador.

### Cómo probar sin backend

Con `NEXT_PUBLIC_API_MOCKING=enabled` en `apps/web/.env.local`, en `/registro`:

| Caso | Email |
|---|---|
| Email no institucional (cliente) | `lucas.gonzalez@gmail.com` |
| Dominio rechazado por el back | `dominio@alu.frlp.utn.edu.ar` |
| Email ya registrado | `existe@alu.frlp.utn.edu.ar` |
| Error del servidor | `caido@alu.frlp.utn.edu.ar` |
| Alta correcta → paso 2 | cualquier otro `@alu.frlp.utn.edu.ar` |

En el paso 2 (o directo: `/registro?paso=2&email=tiago.solis@alu.frlp.utn.edu.ar`):

| Caso | Qué hacer |
|---|---|
| Código correcto | `123456` |
| Código incorrecto | cualquier otro; al 5.º, demasiados intentos (10 min) |
| Código vencido | `000000` |
| Demasiados intentos sin espera conocida | email `bloqueado@alu.frlp.utn.edu.ar` |
| Reenviado | "Reenviar código" (espera de 60 s) |
| Reenviar demasiado pronto | email `espera@alu.frlp.utn.edu.ar` |

## 8. Resultado

Terminada el 2026-11-09. `/registro` con los dos pasos de HU-01 en la misma página: crear cuenta
(email de alumno, contraseña y confirmación) y confirmar el email con el código, con la animación
del prototipo (Motion) y los seis estados del paso 2 en 3 anchos. Validación manual del
desarrollador aprobada. Quedan para otras tareas la política de contraseña, la vigencia del
código y las esperas (TASK-007) y el destino después de confirmar (`TODO(auth)`).

## Anexo: prompt original de planificación


Copiar y pegar en el agente:

```text
/planificar Implementar la pantalla "Crear cuenta" (/registro) de Aula Clara UTN.

Implement this design in this codebase: @https://claude.ai/code/artifact/1e743281-4747-4b4e-91ed-1a14f0e04232
Read the design's files from that link. Match how it looks, using this codebase's own components and conventions.

Artboards de referencia (página "Crear cuenta" del canvas; Desktop 1440, Tablet 768 y Mobile 390, en modo
noche *-Noche.dc.html y modo claro *-Claro.dc.html):
- Estado por defecto: Registro-Desktop-*, Registro-Tablet-*, Registro-Mobile-*.
- Email no institucional (HU-01, escenario 3): Registro-Dominio-*.

Contenido y comportamiento según el diseño:
- Mismo esquema que /login de TASK-006: dos columnas con ilustración en desktop; tarjeta translúcida
  (90 % de opacidad) sobre la ilustración en tablet; en mobile, barra superior con marca y botón de tema,
  y la tarjeta debajo.
- Indicador "Paso 1 de 2" (el paso 2 es verificar el email con el OTP).
- Título "Creá tu cuenta" y bajada sobre el email de alumno y el código.
- Campos: Email institucional (type="email", autocomplete="email"), Contraseña con mostrar/ocultar
  (autocomplete="new-password") y Repetí la contraseña. El botón de mostrar afecta a los dos campos.
- Validación de cliente: el email tiene que terminar en @alu.frlp.utn.edu.ar (error: "Solo podés
  registrarte con tu email de alumno, el que termina en @alu.frlp.utn.edu.ar."), y las contraseñas tienen
  que coincidir. El backend igual rechaza otros dominios con 400 (TDD-AUTH-H1): mapear esa respuesta al
  mismo error.
- Requisitos de contraseña: no están definidos (TASK-007). No inventarlos; dejar la línea de ayuda con
  TODO y referencia a TASK-007.
- Pie: "¿Ya tenés cuenta?" con "Ingresar" (a /login) y la nota "¿Sos docente o autoridad? Tu cuenta la
  crea un administrador de la facultad."
- Submit: sin auth real (TODO(auth), como en TASK-006). Si el alta sale bien, ir a Verificar email (OTP):
  la pantalla no existe, dejar TODO(rutas) referenciando TASK-008.
- Al terminar, quitar el TODO(rutas) del link "Crear cuenta" del login que apunta a /registro.

Restricciones:
- Leer CLAUDE.md, AGENTS.md, .agents/front.md, docs/standards/frontend-design-system.md, TDD-AUTH-H1 y TASK-006.
- Reutilizar los componentes de TASK-006 (TextField, PasswordField, Panel, ThemeToggle, Button,
  ButtonLink) y el estado de error de campo que defina TASK-012; si hace falta un componente global nuevo
  (por ejemplo el indicador de pasos), pedir autorización y reflejarlo primero en el Design System.
- Solo tokens; WCAG 2.1 AA (contraste en los dos temas, 44 px táctiles en tablet y mobile, teclado, zoom 200 %).
- Mobile y tablet superan la altura de referencia (TASK-009): resolver o dejar explícito el scroll.
- Textos exactamente como en el diseño (voseo, mayúscula solo inicial, sin emoji).

Entregable de la planificación: plan con ruta, componentes, validaciones, criterios de aceptación
verificables por ancho y tema, y la formalización en docs/tasks/.
```
