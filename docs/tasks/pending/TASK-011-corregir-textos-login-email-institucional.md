# TASK-011: Corregir el login implementado: email institucional y link a registro

Estado: Pendiente
Fecha: 2026-10-20
TDD relacionado: [TDD-AUTH-H1](../../tdd/TDD-AUTH-H1.md) — solo como contexto.
Depende de: [TASK-006](../in-progress/TASK-006-login-aula-clara.md) (login ya implementado, en validación).

## Prompt para planificar

Copiar y pegar en el agente:

```text
/planificar Corregir el login ya implementado (TASK-006) para que coincida con la versión actualizada del diseño.

Implement this design in this codebase: @https://claude.ai/code/artifact/1e743281-4747-4b4e-91ed-1a14f0e04232
Read the design's files from that link. Match how it looks, using this codebase's own components and conventions.

Artboards de referencia (página "Login" del canvas): Main.dc.html (Desktop claro), Login-Tablet.dc.html,
Login-Mobile.dc.html, Login-Desktop-Noche.dc.html, Login-Tablet-Noche.dc.html y Login-Mobile-Noche.dc.html.

Qué cambió en el diseño respecto de lo implementado en TASK-006:
- El campo pasa de "Email o usuario" a "Email institucional". Ya no existe nombre de usuario: TDD-AUTH-H1
  define login solo por email, para alumnos, jefes departamentales y administradores.
- El input es type="email", inputmode="email", autocomplete="username", placeholder
  "nombre@alu.frlp.utn.edu.ar".
- Bajada: "Usá el email con el que te registraste."
- Ayuda del campo: desktop/tablet "¿Sos docente o autoridad? Usá el email con el que te dio de alta un
  administrador."; mobile "¿Sos docente? Usá el email con el que te dieron de alta."
- Pie: "Para crear una cuenta necesitás tu email @alu.frlp.utn.edu.ar." (mobile: "Necesitás tu email
  @alu.frlp.utn.edu.ar.").
- "Crear cuenta" lleva a la pantalla de registro (/registro), en los dos temas. La página todavía no
  existe: mantener el TODO(rutas) de TASK-006 y referenciar TASK-013.

Restricciones:
- Leer CLAUDE.md, AGENTS.md, .agents/front.md, docs/standards/frontend-design-system.md y TASK-006 antes de planificar.
- Es un cambio de textos y atributos: no tocar layout, tokens ni componentes globales salvo que sea
  imprescindible, y si lo es, pedir autorización (áreas sensibles).
- Textos en español rioplatense con voseo, mayúscula solo inicial, sin emoji.
- Revisar si el TODO(auth) y cualquier tipo, test o nombre de variable siguen diciendo "usuario" y renombrarlos.
- Decidir con el desarrollador si esto se cierra dentro de TASK-006 (todavía en validación) o como tarea
  aparte; dejar la decisión escrita en la tarea.

Entregable de la planificación: el plan con archivos a tocar, criterios de aceptación verificables
(textos exactos en los 3 anchos y los 2 temas, orden de Tab sin cambios, sin regresiones de TASK-006)
y la formalización en docs/tasks/.
```

## Criterios de aceptación (resumen)

- [ ] Ningún texto, tipo ni atributo del login menciona "usuario".
- [ ] Textos idénticos a los 6 artboards por defecto.
- [ ] "Crear cuenta" apunta a /registro con TODO(rutas) mientras la página no exista.

## Resultado

Pendiente.
