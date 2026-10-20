# TASK-009: Definir el scroll de las pantallas de auth que no entran en la pantalla de referencia

Estado: Pendiente
Fecha: 2026-10-20
TDD relacionado: No requiere

## 1. Contexto y Objetivo

Varias pantallas del diseño quedaron más altas que el tamaño de referencia del dispositivo, porque
suman un aviso o más campos que el login por defecto:

| Pantalla | Desktop (ref. 900) | Tablet (ref. 1024) | Mobile (ref. 844) |
|---|---|---|---|
| Crear cuenta (y email no institucional) | 900 | 1024 | 1000 |
| Login · Error de validación | 900 | 1024 | 1040 |
| Login · Credenciales incorrectas | 900 | 1024 | 1040 |
| Login · Email sin confirmar | 980 | 1100 | 1100 |
| Login · Ingreso bloqueado | 980 | 1100 | 1100 |

TASK-006 pide "sin scroll en tablet y mobile a los tamaños de referencia" para el login por defecto.
Con avisos eso no se cumple, así que hay que decidir el comportamiento.

## 2. Alcance

- Decidir: scroll de la página completa, o compactar (tarjeta más chica, ocultar elementos
  secundarios como la nota para docentes) para que entre sin scroll.
- Si hay scroll: que el aviso quede visible al aparecer (llevar el foco o hacer scroll hasta él).
- Desktop con avisos: la continuación del horizonte de la ilustración se corrió 40 px en los
  artboards de 980 px de alto; validar que el cálculo de TASK-006 lo resuelve solo.
- Ajustar los artboards a la decisión.

## 3. Exclusiones

- No cambia el contenido ni los textos de las pantallas.

## 4. Criterios de Aceptación

- [ ] Decisión escrita (scroll o compactar) y aplicada en todas las pantallas de la tabla.
- [ ] Ningún contenido queda cortado ni tapado en 390×844, 768×1024 y 1440×900.

## 5. Validaciones

- [ ] Prueba en dispositivos reales o emulados con las alturas de referencia.

## 6. Resultado

Pendiente.
