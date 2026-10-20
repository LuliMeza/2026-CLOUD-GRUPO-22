# TASK-007: Definir reglas de autenticación que el diseño dejó abiertas

Estado: Pendiente
Fecha: 2026-10-20
TDD relacionado: [TDD-AUTH-H1](../../tdd/TDD-AUTH-H1.md)

## 1. Contexto y Objetivo

Las pantallas de "Crear cuenta" y de los estados del login (artifact de Design "Aula Clara UTN —
Pantallas") muestran dos datos que el TDD-AUTH-H1 todavía no fija. En el diseño quedaron como
marcadores con subrayado punteado, para no mostrar reglas inventadas:

- `[Requisitos de la contraseña · a definir con backend]` en Crear cuenta. El TDD dice que en
  `POST /auth/register` "se valida sintaxis de email y fortaleza de contraseña", pero no define la
  política (largo mínimo, tipos de caracteres, etc.).
- `[tiempo de espera]` en el estado "Ingreso bloqueado" del login. El TDD solo define el límite de
  intentos del OTP (`otp_attempts >= 5` → 429), no un bloqueo por intentos fallidos de contraseña.

El objetivo es decidir ambas reglas, documentarlas en el TDD y reemplazar los marcadores del diseño
por el texto real.

## 2. Alcance

- Definir la política de contraseña (requisitos visibles para el alumno y validación en backend).
- Decidir si existe bloqueo por intentos fallidos de login; si existe: cantidad de intentos,
  duración del bloqueo, respuesta HTTP y mensaje.
- Si se decide no bloquear, quitar el estado "Ingreso bloqueado" del diseño.
- Actualizar TDD-AUTH-H1 (sección de errores y validaciones).
- Reemplazar los marcadores en los artboards de Crear cuenta y de Ingreso bloqueado (modo noche y claro).

## 3. Exclusiones

- No implementar la validación ni el bloqueo en código: eso va en la tarea de implementación de auth.
- No cambiar el flujo de OTP ya definido.

## 4. Criterios de Aceptación

- [ ] La política de contraseña está escrita en TDD-AUTH-H1 y se puede mostrar en una línea de ayuda.
- [ ] Está decidido si hay bloqueo por intentos de login, con sus números si aplica.
- [ ] No quedan marcadores `[… a definir]` de estas reglas en el diseño.

## 5. Validaciones

- [ ] Revisión del equipo (back + front) sobre el texto final del TDD.

## 6. Resultado

Pendiente.
