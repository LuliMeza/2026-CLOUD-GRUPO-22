# TASK-012: Implementar los estados del login

Estado: Terminada (2026-11-09; validación manual del desarrollador aprobada)
Fecha: 2026-11-08
Contexto de producto: HU-01 y [TASK-004](../finished/TASK-004-investigar-autenticacion-institucional.md). Las reglas de auth (respuestas y errores) pasan a los contratos de `packages/shared` ([TASK-014](../finished/TASK-014-contratos-compartidos-y-catalogo-de-errores.md)).
Depende de: TASK-006 y TASK-011 (TASK-011 se implementó junto con esta). Relacionadas: TASK-007,
TASK-008, TASK-009, TASK-010.

## 1. Contexto y Objetivo

Implementar en `/login` los cinco estados de la página "Login · estados" del diseño
(https://claude.ai/code/artifact/1e743281-4747-4b4e-91ed-1a14f0e04232), en Desktop 1440, Tablet
768 y Mobile 390, modo noche y claro, reutilizando el Design System y dejando los componentes
nuevos reutilizables para el resto de las pantallas.

## 2. Alcance

- **Dependencias** (decisión abajo, en §3): `react-hook-form`, `zod`,
  `@hookform/resolvers`, `lucide-react` y `msw` (dev).
- **Design System** (autorizado por el desarrollador, componentes globales):
  - `TextField`/`PasswordField`: prop `error` (reemplaza a la ayuda, borde danger 2 px,
    `aria-invalid`, `aria-describedby` al error) y estilo `:disabled`. Aceptan `ref`.
  - `Checkbox`: acepta `ref`.
  - `Alert` nuevo: tonos `danger`, `warning`, `accent`; `actions` y `footnote` opcionales;
    `role="alert"` y `tabIndex={-1}`.
  - `Button`: `loading` + `loadingLabel` y variantes `accent` y `outline`.
  - `Spinner` nuevo, con `prefers-reduced-motion`.
  - `icons.tsx` pasa a `lucide-react` manteniendo los nombres exportados; suma
    `AlertCircleIcon`, `MailIcon` y `LockIcon`.
- **Login**:
  - Textos de TASK-011 (email institucional, ayudas y pie nuevos).
  - `src/validations/login.ts`: esquema zod.
  - `src/services/auth.ts`: `POST {NEXT_PUBLIC_API_URL}/auth/login` y mapeo de respuestas.
  - `src/mocks/`: handlers de msw para probar cada estado sin backend.
  - `LoginForm`: aviso + formulario, foco al aviso al llegar, campos deshabilitados mientras se
    ingresa y con el ingreso bloqueado.

## 3. Decisiones tomadas en la planificación

- **Mapeo de la API** (contrato propuesto; pasa al catálogo de errores de TASK-014): 400 → aviso genérico,
  401 → credenciales incorrectas, 403 con `code: "EMAIL_NOT_VERIFIED"` → email sin confirmar,
  423/429 → ingreso bloqueado, otro o sin red → aviso genérico.
- **Validación del email**: se valida el formato. El mensaje con el dominio
  `@alu.frlp.utn.edu.ar` solo aparece si el email parece de alumno (dominio `alu.frlp…`
  incompleto), porque docentes y autoridades usan otro dominio.
- **Alturas (TASK-009)**: la página hace scroll cuando el aviso no entra; al aparecer un aviso el
  foco va a él, así queda a la vista.
- **Bloqueo (TASK-007)**: el estado está implementado con el marcador `[tiempo de espera]`
  subrayado como en el diseño; no se inventa un número.
- **Destinos sin pantalla** ("Ingresar el código", "Reenviar código", "Restablecer contraseña",
  "¿Olvidaste tu contraseña?", "Crear cuenta", destino después de ingresar): `TODO(rutas)` con
  referencia a TASK-008 / TASK-013 en `routes.ts` y en el formulario.

- **Librerías (2026-11-08)**: react-hook-form + zod (+ `@hookform/resolvers`) para formularios,
  lucide-react para íconos (siempre vía `components/icons.tsx`) y msw para simular la API en
  desarrollo. Descartado: formularios a mano o con `useActionState` (no resuelven errores por
  campo ni revalidación), un cliente falso propio en vez de msw (mete `if (mock)` en cada
  servicio) y SVG copiados a mano. Lo visual (Alert, Spinner, Button) se hace sobre `ds.css`: Radix
  o shadcn/ui traen estilos propios que chocan con los tokens.

## 4. Exclusiones

- Autenticación real y guardado de sesión (`TODO(auth)`).
- Pantallas de verificación de email, recuperación de contraseña y registro.
- Compartir el esquema zod con el backend: lo resuelve TASK-014 (`packages/shared`).

## 5. Textos que no están en el diseño (a validar con diseño)

- Email vacío: "Ingresá tu email."
- Email mal escrito que no es de alumno: "El email parece incompleto. Revisá que esté bien escrito."
- Error del servidor o sin conexión: aviso danger "No pudimos ingresar" / "Intentá de nuevo en
  unos minutos."

## 6. Criterios de Aceptación

- [x] Validación: `nombre@alu.frlp` + contraseña vacía muestran los dos errores del diseño
      (versión corta en mobile), con borde danger, `aria-invalid` y foco en el primer campo con error.
- [x] Ingresando: spinner + "Ingresando…" con `role="status"`, `aria-busy` en el form, campos
      deshabilitados.
- [x] Credenciales incorrectas: aviso danger arriba del formulario, foco en el aviso, contraseña vacía.
- [x] Email sin confirmar: aviso accent con el email (desktop/tablet) o "a tu casilla" (mobile) y
      las dos acciones.
- [x] Ingreso bloqueado: aviso warning con "Restablecer contraseña", formulario deshabilitado.
- [x] Textos idénticos a los artboards en 1440, 768 y 390, noche y claro.
- [x] Sin scroll horizontal; objetivos táctiles ≥ 44 px en tablet y mobile.
- [x] Teclado solo y zoom al 200 % (checklist de `docs/standards/frontend-design-system.md`).

## 7. Validaciones

- [x] `tsc --noEmit` en `apps/web/` sin errores.
- [x] `next build` compila (verificado en un entorno sin salida a Google Fonts, con las fuentes
      reemplazadas solo para el build).
- [x] Recorrido con Chromium headless y mocks activos: los cinco estados aparecen, el foco va al
      aviso o al primer campo con error, y no hay scroll horizontal en 1440, 768 y 390.
- [x] Validación manual del desarrollador en `npm run dev:web` con `NEXT_PUBLIC_API_MOCKING=enabled`.

### Cómo probar cada estado sin backend

En `apps/web/.env.local`: `NEXT_PUBLIC_API_MOCKING=enabled`. Después, en `/login`:

| Estado | Email | Contraseña |
|---|---|---|
| Validación | `nombre@alu.frlp` | (vacía) |
| Credenciales incorrectas | cualquier email válido | cualquiera menos `aulaclara` |
| Ingreso correcto | cualquier email válido | `aulaclara` |
| Email sin confirmar | `sin-verificar@alu.frlp.utn.edu.ar` | cualquiera |
| Ingreso bloqueado | `bloqueado@alu.frlp.utn.edu.ar` | cualquiera |
| Error del servidor | `caido@alu.frlp.utn.edu.ar` | cualquiera |

"Ingresando…" se ve durante 1,2 s en cualquiera de los envíos.

## 8. Resultado

Terminada el 2026-11-09, junto con TASK-011. Los cinco estados del login (validación,
ingresando, credenciales incorrectas, email sin confirmar e ingreso bloqueado) más el error del
servidor, sobre los contratos de `packages/shared` (TASK-014). Componentes nuevos del Design
System: `Alert`, estado de error de `TextField`/`PasswordField`, `Spinner` y botón con carga.
Validación manual del desarrollador aprobada. Quedan para otras tareas las reglas pendientes
(TASK-007) y los destinos de "Restablecer contraseña" (TASK-008).

## Anexo: prompt original de planificación


Copiar y pegar en el agente:

```text
/planificar Implementar los estados del login de Aula Clara UTN sobre la pantalla /login de TASK-006.

Implement this design in this codebase: @https://claude.ai/code/artifact/1e743281-4747-4b4e-91ed-1a14f0e04232
Read the design's files from that link. Match how it looks, using this codebase's own components and conventions.

Artboards de referencia (página "Login · estados" del canvas; cada estado en Desktop 1440, Tablet 768 y
Mobile 390, modo noche *-Noche.dc.html y modo claro *-Claro.dc.html):
1. Error de validación — Login-Validacion-*: email incompleto ("El email parece incompleto. Revisá que
   termine en @alu.frlp.utn.edu.ar.") y contraseña vacía ("Ingresá tu contraseña."). Validación del lado
   del cliente, error debajo del campo con ícono, borde en danger, aria-invalid + aria-describedby.
2. Credenciales incorrectas (401) — Login-Credenciales-*: aviso danger arriba del formulario, role="alert".
3. Email sin confirmar (403, HU-01 escenario 4) — Login-SinVerificar-*: aviso con tono accent y dos
   acciones, "Ingresar el código" y "Reenviar código".
4. Ingresando — Login-Cargando-*: campos deshabilitados, botón con spinner y "Ingresando…" (role="status",
   aria-busy en el form, respetar prefers-reduced-motion).
5. Ingreso bloqueado — Login-Bloqueada-*: aviso warning con "Restablecer contraseña".

Puntos a resolver en el plan:
- Los avisos todavía no son componente del Design System: proponer un componente Alert (variantes danger,
  warning, info/accent, con acciones opcionales) y el estado de error de TextField/PasswordField (TASK-006
  ya dejó la prop invalid y el slot de ayuda). Son componentes reutilizables globales: pedir autorización
  y reflejarlos primero en el Design System, según docs/standards/frontend-design-system.md.
- No hay autenticación real todavía (submit con TODO(auth)). Proponer cómo mapear las respuestas de la API
  (400/401/403/429) a estos estados y cómo probar cada estado sin backend.
- Las acciones sin destino ("Ingresar el código", "Reenviar código", "Restablecer contraseña",
  "¿Olvidaste tu contraseña?") llevan TODO(rutas) referenciando TASK-008, igual que en el diseño.
- El bloqueo por intentos y su tiempo de espera no están definidos (TASK-007): no inventar números; dejar
  el estado preparado y el texto del tiempo como dato pendiente, o excluir el estado si TASK-007 lo descarta.
- Varias pantallas superan la altura de referencia (TASK-009): el plan tiene que tomar la decisión de
  scroll o compactar, o dejarla explícita como dependencia.
- Al llegar un aviso, el foco o el anuncio del lector de pantalla tiene que llevar al aviso.

Restricciones:
- Leer CLAUDE.md, AGENTS.md, .agents/front.md, docs/standards/frontend-design-system.md, TASK-004 y TASK-006.
- Solo tokens del Design System; sin colores hardcodeados.
- WCAG 2.1 AA: contraste en los dos temas, objetivos táctiles de 44 px en tablet y mobile, teclado y zoom 200 %.
- Textos exactamente como en el diseño (voseo, mayúscula solo inicial, sin emoji).

Entregable de la planificación: plan por estado, componentes nuevos o modificados, criterios de
aceptación verificables por estado y ancho, y la formalización en docs/tasks/.
```
