# TASK-013: Implementar la pantalla Crear cuenta

Estado: Pendiente
Fecha: 2026-10-20
TDD relacionado: [TDD-AUTH-H1](../../tdd/TDD-AUTH-H1.md) — HU-01
Depende de: TASK-006 y TASK-011. Relacionadas: TASK-007, TASK-008, TASK-012.

## Prompt para planificar

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

## Resultado

Pendiente.
