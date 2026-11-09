import { config } from "dotenv";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

// cwd es apps/api (npm corre los scripts del workspace ahí); la raíz del repo está dos niveles arriba.
config({
  path: [
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), "../../.env.local"),
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "../../.env"),
  ],
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
});
