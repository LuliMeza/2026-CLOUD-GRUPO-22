# Backend

API HTTP escrita en TypeScript con NestJS. PostgreSQL es la base de datos relacional y Prisma
ORM concentra el esquema, las migraciones y el acceso tipado a datos.

## Estructura

- `src/`: módulos, controllers y services de NestJS.
- `src/infrastructure/prisma/`: módulo global de acceso a datos.
- `src/http/`: manejo HTTP común (ver "Errores y contratos").
- `prisma/schema.prisma`: contrato de datos; los modelos se agregan con cada módulo funcional.
- `prisma/migrations/`: migraciones versionadas generadas por Prisma.
- `tests/`: pruebas automatizadas del backend.

## Contratos iniciales

- `GET /health`: responde `{ "status": "ok", "service": "back" }` cuando la API está activa.
- `DATABASE_URL`: conexión PostgreSQL utilizada por Prisma.
- `BACKEND_PORT`: puerto HTTP opcional; el valor predeterminado es `3001`.

## Errores y contratos

Los endpoints, sus cuerpos, respuestas y errores posibles están en `@cloud-grupo-22/shared`
(tabla en [docs/api/catalogo-de-errores.md](../docs/api/catalogo-de-errores.md)). `src/http/`
los hace cumplir:

- **`@ContractRoute(contrato)`** declara la ruta: método, ruta y status de éxito salen del
  contrato. El cuerpo llega validado con el esquema compartido (si falla, `VALIDATION_FAILED`
  con un error por campo y la misma clave que ve el front) y la respuesta se valida y se recorta
  a lo que declara el contrato.
- **`throw new AppError("CODIGO", extras)`** para cualquier error de negocio, con un código del
  catálogo. No se lanzan `HttpException` de Nest ni se arman respuestas de error a mano.
- **`ProblemDetailsFilter`** (global) responde todo error en Problem Details con el status del
  catálogo y `Retry-After` cuando hay espera. Un error no declarado en el contrato, una respuesta
  con otra forma o una excepción no controlada salen como `INTERNAL_ERROR`, sin exponer el
  mensaje interno (queda en el log). Ruta inexistente: `NOT_FOUND`.

```ts
@Controller()
export class AuthController {
  @ContractRoute(registerEndpoint)
  async register(@Body() body: EndpointBody<typeof registerEndpoint>) {
    if (await this.users.exists(body.email)) throw new AppError("AUTH_EMAIL_TAKEN");
    return { email: body.email };
  }
}
```

## Comandos

- `npm run dev:api`: inicia NestJS en desarrollo desde la raíz.
- `npm run build --workspace=@cloud-grupo-22/api`: genera Prisma Client y compila el backend.
- `npm test --workspace=@cloud-grupo-22/api`: ejecuta las pruebas con Vitest.
- `npm run db:generate`: regenera Prisma Client.
- `npm run db:migrate`: crea y aplica una migración de desarrollo.
- `npm run db:studio`: abre Prisma Studio.

Todavía no existen modelos de dominio. Cada módulo debe documentar sus endpoints, payloads,
reglas, relaciones, estados, errores, permisos e historial.
