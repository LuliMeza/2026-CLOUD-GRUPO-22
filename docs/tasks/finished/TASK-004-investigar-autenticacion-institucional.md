# TASK-004: Completar el mecanismo de verificación de identidad institucional

Estado: Finalizada
Fecha: 2026-10-18
TDD relacionado: [TDD-AUTH-H1](../../tdd/TDD-AUTH-H1.md) (Aprobado)

## 1. Contexto y Problema

El sistema requiere que los usuarios se identifiquen con sus correos institucionales de la UTN
(`@alu.frlp.utn.edu.ar` para estudiantes y `@frlp.utn.edu.ar` para docentes) para acceder a las
funciones de comentarios y visualización de cátedras/comisiones.

Esta tarea parte de **Spike 2 — Validación de identidad UTN vía mail institucional** (Trello,
`2026-UTN-Cloud`), no la reemplaza.

La decisión de alto nivel que esta tarea originalmente pedía tomar (¿SSO institucional o
contraseña propia?) **ya se resolvió en Spike 2 (actualizado 2026-10-10)**: la premisa de que
FRLP usa Google Workspace era falsa — FRLP usa **Microsoft 365**. El candidato real de SSO sería
Azure AD, pero requiere que la UTN autorice la app en su tenant, y la facultad no respondió el
mail al respecto. Por lo tanto se descartó el SSO y se mantiene **autenticación con contraseña +
validación de formato de dominio institucional**, que ya está parcialmente implementada
(HU-01, Escenario 3).

Lo que sigue abierto, y es el alcance real de esta tarea, es la capa que Spike 2 deja pendiente:
hoy solo se valida el **formato** del dominio del correo, no que la casilla institucional exista
de verdad y pertenezca a quien se registra. El mecanismo de verificación de esa titularidad
(magic link vs. OTP) todavía no se decidió.

---

## 2. Decisión ya tomada (no reabrir)

* Autenticación con contraseña propia (no SSO/Google OAuth — descartado, ver Contexto).
* Validación de formato de dominio institucional — implementada (HU-01 Escenario 3, HU-02).

## 3. Alcance de la Tarea (lo que sigue abierto)

- [x] Decidir el mecanismo de verificación de titularidad de la casilla institucional: magic link
      vs. OTP (Spike 2, alcance abierto — resuelto a favor de Email OTP debido al riesgo de Safe Links en Microsoft 365).
- [x] Elegir proveedor de correo transaccional para enviar la verificación/recuperación (Neon Auth
      con Email OTP integrado, sin requerir SMTP propio).
- [x] Redactar `docs/tdd/TDD-AUTH-H1.md` con el modelo de dominio `User` para Prisma, el mecanismo
      elegido y el flujo de verificación/recuperación.
- [x] Confirmar los roles (alumno, jefe departamental, administrador) y la regla de validación de dominios
      permitidos contra lo ya implementado en HU-01/HU-02.

---

## 4. Exclusiones

- No reabrir la discusión SSO vs. contraseña — ya está cerrada (ver Contexto).
- No escribir código en backend ni frontend hasta que el mecanismo de verificación esté acordado
  en el TDD.
- No solicitar permisos ni accesos a autoridades de la facultad para Azure AD — se intentó y no
  hubo respuesta; no es parte de esta tarea insistir por esa vía.

---

## 5. Criterios de Aceptación

1. [x] Se decidió el mecanismo de verificación de titularidad de la casilla: Email OTP vía Neon Auth.
2. [x] Se redactó y aprobó `docs/tdd/TDD-AUTH-H1.md` (Estado: Aprobado).
3. [x] Se confirmaron los roles (alumno, jefe departamental, administrador) contra HU-01/HU-02;
   las historias/tareas de implementación derivadas (backend/frontend) quedan a cargo de quien
   tome TDD-AUTH-H1.md como referencia para implementar.

---

## Resultado

Decisión cerrada: autenticación con contraseña propia, sin SSO institucional (Microsoft 365 sin
soporte de tenant de la facultad). Verificación de titularidad de la casilla vía **Email OTP de
Neon Auth** — se descartó magic link por el riesgo de que Safe Links de Microsoft 365 consuma el
token antes de que el usuario lo abra. Neon Auth cubre el envío de los mails sin necesidad de
contratar un proveedor de correo transaccional aparte (Resend u otro).

El diseño completo (modelo de dominio, contrato de API, flujo de alta y verificación) queda en
`docs/tdd/TDD-AUTH-H1.md`, Aprobado. Implementación de backend/frontend queda como trabajo
siguiente, a partir de ese TDD.
