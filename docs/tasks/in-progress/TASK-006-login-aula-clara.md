# TASK-006: Pantalla de login de Aula Clara UTN

Estado: En progreso (pendiente de validación manual del desarrollador)
Fecha: 2026-10-20
TDD relacionado: [TDD-AUTH-H1](../../tdd/TDD-AUTH-H1.md) — solo como contexto; esta tarea no implementa autenticación.

## 1. Contexto y Objetivo

Implementar la pantalla de login (estado por defecto) a partir del diseño "Aula Clara UTN — Pantallas"
(artifact de Design, 6 artboards: Desktop 1440, Tablet 768 y Mobile 390, en modo día y noche) como
**una sola página responsive**, sobre los tokens y componentes del Design System "Aula Clara UTN".

## 2. Alcance

- Tokens nuevos en `front/src/app/globals.css`: `--input-bg`, `--surface-illustration`,
  `--horizon-line`, `--horizon-ratio-offset`, `--glass-bg`, `--glass-blur`, `--glass-border`.
- Tema oscuro por `[data-theme="dark"]` y, sin elección manual, por `prefers-color-scheme: dark`.
- Regla del sistema: inputs de texto en oscuro usan `surface-100` (un paso más oscuro que la tarjeta).
- Foco visible global (`:focus-visible`, 2 px `accent`, offset 2 px); el de `.ac-btn` pasa de
  `border-strong` a `accent`.
- `layout.tsx`: script inline que aplica el tema guardado antes del primer pintado.
- Componentes reutilizables nuevos: `TextField`, `PasswordField`, `Checkbox`, `ThemeToggle`, `Panel`
  (variantes `default`, `glass`, `glass-touch`) e íconos de contorno. `Button` suma `size="lg"` y
  `ButtonLink`.
- Ruta `/login` con layout de dos columnas en desktop (≥ 1024 px), tarjeta de vidrio sobre la
  ilustración en tablet (768–1023 px) y mobile (< 768 px).
- Continuación del horizonte de la ilustración en desktop, solo con CSS.
- Ilustraciones `facultad-dia` y `facultad-noche` en `front/public/img/login/` (JPG original +
  WebP 2528 px y 1280 px) servidas con `<picture>`/`srcset`.

## 3. Exclusiones

- Estados de error y de carga (la estructura queda lista: slot de ayuda, `aria-describedby`, prop `invalid`).
- Autenticación real: el submit es un handler con `TODO(auth)`.
- Páginas `/registro` y `/recuperar-contrasena` (los links apuntan ahí con `TODO(rutas)`).
- Logo y tagline definitivos (slots marcados con `TODO(logo)` / `TODO(tagline)`).
- `Card` (ficha de materia) no se modifica.

## 4. Criterios de Aceptación

- [x] La página coincide con los 6 artboards a 1440×900, 768×1024 y 390×844 en día y noche.
- [x] El horizonte queda alineado con la ilustración de 1024 a 1920 px de ancho, incluido un
      viewport bajo y ancho donde la imagen queda limitada por la altura (1600×500).
- [x] Sin scroll horizontal en ningún ancho; sin scroll en tablet y mobile a los tamaños de referencia.
- [x] Orden de Tab: tema, email/usuario, contraseña, mostrar/ocultar, Recordarme, ¿Olvidaste…?,
      Ingresar, Crear cuenta.
- [x] Objetivos táctiles ≥ 44 px en tablet y mobile; inputs a 16 px por debajo de desktop.
- [x] El submit no recarga la página.
- [x] El tema elegido persiste al recargar (localStorage, con try/catch).
- [ ] Validación manual del desarrollador: teclado solo y zoom al 200 % (checklist de
      `docs/standards/frontend-design-system.md`).

## 5. Validaciones

- [x] `tsc --noEmit` en `front/` sin errores.
- [x] `npm test --workspace=back` pasa.
- [x] `next build` del front compila (verificado con las fuentes servidas localmente: el entorno
      de verificación no tenía salida a Google Fonts).
- [x] Capturas de los 6 estados de referencia y barrido de anchos de desktop con Chromium headless.

## 6. Resultado

Pendiente de la validación manual. Al aprobarse: mover a `finished/`, registrar en `CHANGELOG.md`
y aplicar `commit-work`.
