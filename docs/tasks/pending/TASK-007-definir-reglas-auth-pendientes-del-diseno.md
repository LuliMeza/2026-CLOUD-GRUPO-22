# TASK-007: Definir reglas de autenticación que el diseño dejó abiertas

Estado: Pendiente
Fecha: 2026-10-20
Contexto de producto: HU-01 y [TASK-004](../finished/TASK-004-investigar-autenticacion-institucional.md). Las reglas de auth (respuestas y errores) pasan a los contratos de `packages/shared` ([TASK-014](./TASK-014-contratos-compartidos-y-catalogo-de-errores.md)).

## 1. Contexto y Objetivo

Las pantallas de "Crear cuenta" y de los estados del login (artifact de Design "Aula Clara UTN —
Pantallas") muestran dos datos que la definición de auth de TASK-004 todavía no fija. En el diseño quedaron como
marcadores con subrayado punteado, para no mostrar reglas inventadas:

- `[Requisitos de la contraseña · a definir con backend]` en Crear cuenta. La definición de auth dice que en
  `POST /auth/register` "se valida sintaxis de email y fortaleza de contraseña", pero no define la
  política (largo mínimo, tipos de caracteres, etc.).
- `[tiempo de espera]` en el estado "Ingreso bloqueado" del login. La definición de auth solo define el límite de
  intentos del OTP (`otp_attempts >= 5` → 429), no un bloqueo por intentos fallidos de contraseña.

El objetivo es decidir ambas reglas, escribirlas en la sección "Decisiones" de esta tarea (y en el
catálogo de errores y contratos de `packages/shared`, TASK-014) y reemplazar los marcadores del diseño
por el texto real.

## 2. Alcance

- Definir la política de contraseña (requisitos visibles para el alumno y validación en backend).
- Decidir si existe bloqueo por intentos fallidos de login; si existe: cantidad de intentos,
  duración del bloqueo, respuesta HTTP y mensaje.
- Si se decide no bloquear, quitar el estado "Ingreso bloqueado" del diseño.
- Reflejar las reglas en el catálogo de errores y los contratos de auth de `packages/shared`.
- Reemplazar los marcadores en los artboards de Crear cuenta y de Ingreso bloqueado (modo noche y claro).

## 3. Exclusiones

- No implementar la validación ni el bloqueo en código: eso va en la tarea de implementación de auth.
- No cambiar el flujo de OTP ya definido.

## 4. Criterios de Aceptación

- [ ] La política de contraseña está escrita en esta tarea y en el esquema de `packages/shared`, y se
      puede mostrar en una línea de ayuda.
- [ ] Está decidido si hay bloqueo por intentos de login, con sus números si aplica.
- [ ] No quedan marcadores `[… a definir]` de estas reglas en el diseño.

## 5. Validaciones

- [ ] Revisión del equipo (back + front) sobre las reglas y los contratos.

## 6. Resultado

Pendiente.
