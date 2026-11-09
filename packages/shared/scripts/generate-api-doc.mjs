// Genera docs/api/catalogo-de-errores.md desde el catálogo y los contratos compilados.
// Uso (desde la raíz): npm run docs:api --workspace=@cloud-grupo-22/shared
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_ENDPOINTS, renderApiDoc } from "../dist/index.js";

const here = dirname(fileURLToPath(import.meta.url));
export const API_DOC_PATH = resolve(here, "../../../docs/api/catalogo-de-errores.md");

mkdirSync(dirname(API_DOC_PATH), { recursive: true });
writeFileSync(API_DOC_PATH, renderApiDoc(ALL_ENDPOINTS) + "\n", "utf8");
console.log(`Escrito ${API_DOC_PATH}`);
