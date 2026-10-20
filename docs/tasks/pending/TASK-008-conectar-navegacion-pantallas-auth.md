# TASK-008: Conectar la navegación entre las pantallas de autenticación

Estado: Pendiente
Fecha: 2026-10-20
TDD relacionado: [TDD-AUTH-H1](../../tdd/TDD-AUTH-H1.md)

## 1. Contexto y Objetivo

En el diseño ("Aula Clara UTN — Pantallas") hay acciones que apuntan a pantallas que todavía no
existen. Cada una quedó con un comentario `TODO(rutas)` en el artboard para que, al implementarlas,
se aplique la redirección. Esta tarea registra esas conexiones para que no se pierdan entre el
diseño y el código.

| Origen | Acción | Destino |
|---|---|---|
| Login · Email sin confirmar (HU-01, esc. 4) | "Ingresar el código" | Verificar email (OTP) |
| Login · Email sin confirmar | "Reenviar código" | Reenvío de OTP (`POST /auth/register` o endpoint a definir) |
| Login · Ingreso bloqueado | "Restablecer contraseña" | Recuperar contraseña (HU-02) |
| Login (todos los estados) | "¿Olvidaste tu contraseña?" | Recuperar contraseña (HU-02) |
| Crear cuenta | "Crear cuenta" (submit OK) | Verificar email (OTP), paso 2 de 2 |
| Crear cuenta | "Ingresar" | Login |
| Login | "Crear cuenta" | Crear cuenta |

Las dos últimas ya están conectadas entre artboards en el diseño.

## 2. Alcance

- Diseñar las pantallas faltantes: Verificar email (OTP) y Recuperar contraseña (pedido + código y
  contraseña nueva), en 1440/768/390 y modo noche y claro.
- Conectar en el diseño los destinos de la tabla y quitar los `TODO(rutas)` resueltos.
- Al implementar en `front/`: reemplazar los `TODO(rutas)` de TASK-006 y de las pantallas nuevas
  por las rutas reales.
- Definir con backend el endpoint de reenvío de OTP (el TDD no tiene uno explícito).

## 3. Exclusiones

- No implementa la lógica de autenticación (OTP, sesiones).

## 4. Criterios de Aceptación

- [ ] Todas las acciones de la tabla llevan a una pantalla existente, en el diseño y en el código.
- [ ] No quedan comentarios `TODO(rutas)` sin resolver en las pantallas de auth.

## 5. Validaciones

- [ ] Recorrer el flujo completo en modo Play del diseño.
- [ ] Recorrer el flujo en `npm run dev:front` solo con teclado.

## 6. Resultado

Pendiente.
