#!/usr/bin/env node
// Lee apps/web/src/styles/tokens.json (la fuente) y escribe
// apps/web/src/app/tokens.generated.css. No editar ese .css a mano — se
// regenera solo antes de "dev" y "build" (ver package.json: predev/prebuild).
//
// Por qué existe: antes, el claro y el oscuro de cada token vivían escritos
// dos veces en globals.css (una vez en [data-theme="dark"], otra en
// @media (prefers-color-scheme: dark)), con un comentario pidiendo
// "si cambiás un valor, cambialo en los dos". Este script cambia eso por un
// solo lugar: tokens.json tiene un `dark` por variable, y las dos veces que
// hace falta ese valor en CSS se generan solas desde ahí.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(here, "..", "src", "styles", "tokens.json");
const OUT = path.join(here, "..", "src", "app", "tokens.generated.css");

const { name, variables } = JSON.parse(readFileSync(SRC, "utf8"));

function block(vars, { dark }) {
  const lines = vars
    .filter((v) => (dark ? v.dark !== undefined : true))
    .map((v) => `  --${v.name}: ${dark ? v.dark : v.light};`);
  return lines.join("\n");
}

const lightVars = block(variables, { dark: false });
const darkVars = block(variables, { dark: true });

const css = `/* GENERADO por scripts/build-tokens.mjs a partir de src/styles/tokens.json.
   No editar a mano — el próximo "npm run dev" o "npm run build" lo pisa.
   Para cambiar un valor, editar tokens.json y correr "npm run tokens:build"
   (o simplemente volver a levantar dev/build: se regenera solo). */

:root {
  color-scheme: light;
${lightVars}
}

/* Tema oscuro, en dos formas que cubren los dos casos:
   1) elegido a mano (ThemeToggle pone data-theme="dark" en <html>);
   2) preferencia del sistema, mientras el usuario no haya elegido nada.
   Las dos vienen de los mismos valores de tokens.json — no hay riesgo de
   que queden distintas entre sí. */
[data-theme="dark"] {
  color-scheme: dark;
${darkVars}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
${darkVars.replace(/^/gm, "  ")}
  }
}
`;

writeFileSync(OUT, css, "utf8");
console.log(
  `tokens.generated.css escrito (${variables.length} variables, ${name}).`
);
