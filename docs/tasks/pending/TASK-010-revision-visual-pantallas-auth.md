# TASK-010: Revisión visual de las pantallas de autenticación del diseño

Estado: Pendiente
Fecha: 2026-10-20
TDD relacionado: No requiere

## 1. Contexto y Objetivo

Las pantallas nuevas del diseño "Aula Clara UTN — Pantallas" (Crear cuenta, estados del login en
modo noche y claro) se armaron sin revisarlas renderizadas. Antes de implementarlas hay que hacer
una pasada visual.

## 2. Alcance

- Páginas del canvas: "Login", "Login · estados", "Crear cuenta".
- Revisar en cada artboard: alineación, cortes de texto, espaciados contra la escala del Design System.
- Contraste de los textos sobre la tarjeta translúcida en tablet y mobile (opacidad 90 %), en los
  dos modos, en especial donde la ilustración queda detrás.
- Colores fuera de tokens que siguen en el diseño: fondo `#1a1712` / `#f2ebd8` y hovers de enlace
  `#f0bd63` / `#6b450f`. Sumarlos al Design System o reemplazarlos.
- Los avisos (error, advertencia, email sin confirmar) no son todavía un componente del Design
  System: proponer `Alert` y `TextField` con estado de error.

## 3. Exclusiones

- No rediseña pantallas; solo corrige lo que la revisión encuentre.

## 4. Criterios de Aceptación

- [ ] Todos los artboards revisados, con las correcciones aplicadas.
- [ ] Texto ≥ 4.5:1 y bordes/íconos con significado ≥ 3:1 en ambos modos.
- [ ] No quedan colores hardcodeados fuera de tokens, o están registrados como token nuevo.

## 5. Validaciones

- [ ] Checklist de `docs/standards/frontend-design-system.md` aplicado sobre el diseño.

## 6. Resultado

Pendiente.
