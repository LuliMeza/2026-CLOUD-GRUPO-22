# TASK-002: Refinar el tablero Trello del Gemelo Digital (2026-UTN-Cloud)

Estado: Finalizada
Fecha: 2026-09-27

## Objetivo

Refinar y auditar el tablero Trello `2026-UTN-Cloud` (Gemelo Digital) con el agente PO —
estructura de tarjetas (DoD/DoR), criterio de prioridad, mantenimiento de Historias de Usuario y
organización de listas.

## Contexto

`2026-UTN-Cloud` (ID `6ab84d2bf785d1d79a69cc9b`) es, y era desde el principio, el tablero real y
accesible del equipo: tiene a los integrantes reales del grupo (Tiago, Lucia Meza, Cesar Huari) y
referencia el remote correcto del repo (`github.com/LuliMeza/2026-CLOUD-GRUPO-22.git`) en su
tarjeta GITHUB. El agente PO siempre tuvo acceso de lectura y escritura vía API sobre este mismo
tablero — no hubo bloqueo de permisos ni workspace ajeno.

El tablero que sí pertenece a otro proyecto es `2026-UTN-Grupo-1` (Metodologías Ágiles, Grupo 01),
ubicado en el mismo workspace de Tiago, no en uno de un tercero. No debe confundirse con
`2026-UTN-Cloud`.

## Alcance completado

- Definición del agente PO (`.claude/agents/po.md`, personal, no versionado): rol híbrido
  Product Owner + Scrum Master, estructura de tarjetas (DoD siempre, DoR condicional),
  refinamiento (detectar vs. ejecutar), mantenimiento de Historias de Usuario (template
  COMO/QUIERO/PARA + escenarios Gherkin + INVEST), auditoría del tablero, conciencia de
  documentos externos referenciados, criterio de prioridad (3 ejes) y flujo de listas / política
  de Sprint Backlog.
- Auditoría completa del tablero `2026-UTN-Cloud` (9 listas, ~20 tarjetas).
- Corrección de checklists DoD/DoR en las 6 Spikes.
- Fusión de Spike 6 en Spike 3 (contenido de IA) y de sus notas de infraestructura (Neon,
  Vercel, Amplify) en Spike 5; Spike 6 archivada.
- Conversión de las 9 Historias de Usuario originales a escenarios Gherkin, con checklist DoD y
  label de prioridad en cada una.
- División de HU-03 (rol "sistema" + 4 comportamientos empaquetados) en HU-03a/b/c/d, con
  HU-03d reemplazando a HU-07 (archivada, sin pérdida de contenido).
- División de HU-05 (rol ambiguo "administrador o sistema") en HU-05a/HU-05b, con ajuste de
  prioridad a URGENTE por la dependencia real con HU-06.
- Corrección del contenido de HU-06 contra el documento de backlog real (Google Doc): preguntas
  cerradas siempre presentes, campo de texto libre condicional a publicación identificada.
- Creación de la lista "Sprint Backlog" y de las tarjetas de referencia "CONVENCIONES DEL
  TABLERO" y "CONVENCIONES DE TARJETAS" (lista Info), visibles para todo el equipo.
- Archivado de la tarjeta vacía "HOLAA".

## Validaciones

- [x] Cada Spike y cada Historia de Usuario vigente tiene checklist DoD.
- [x] Los Spikes tienen su checklist DoR ("Tareas") con contenido específico, no genérico.
- [x] Las Historias de Usuario expresan sus criterios de aceptación como escenarios Gherkin.
- [x] Las etiquetas de prioridad se revisaron contra el criterio de 3 ejes documentado, y se
      corrigieron las inconsistencias encontradas (Spike 3/6, HU-05a/b vs HU-06).
- [x] El contenido de HU-06 se validó contra el documento de backlog real, no contra supuestos.

## Resultado

El tablero `2026-UTN-Cloud` quedó refinado, auditado y documentado. No hay sincronización
pendiente hacia ningún otro tablero: `2026-UTN-Cloud` siempre fue el tablero real del equipo, así
que los cambios ya están aplicados sobre él.
