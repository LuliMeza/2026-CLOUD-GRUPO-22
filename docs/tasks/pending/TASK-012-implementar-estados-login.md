# TASK-012: Implementar los estados del login

Estado: Pendiente
Fecha: 2026-10-20
TDD relacionado: [TDD-AUTH-H1](../../tdd/TDD-AUTH-H1.md)
Depende de: TASK-006 y TASK-011. Relacionadas: TASK-007, TASK-008, TASK-009, TASK-010.

## Prompt para planificar

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
- Leer CLAUDE.md, AGENTS.md, .agents/front.md, docs/standards/frontend-design-system.md, TDD-AUTH-H1 y TASK-006.
- Solo tokens del Design System; sin colores hardcodeados.
- WCAG 2.1 AA: contraste en los dos temas, objetivos táctiles de 44 px en tablet y mobile, teclado y zoom 200 %.
- Textos exactamente como en el diseño (voseo, mayúscula solo inicial, sin emoji).

Entregable de la planificación: plan por estado, componentes nuevos o modificados, criterios de
aceptación verificables por estado y ancho, y la formalización en docs/tasks/.
```

## Resultado

Pendiente.
