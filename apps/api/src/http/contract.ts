import {
  applyDecorators,
  HttpCode,
  Inject,
  Injectable,
  Logger,
  RequestMapping,
  RequestMethod,
  SetMetadata,
  UseInterceptors,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { problemFromZodError, type EndpointContract, type HttpMethod } from "@cloud-grupo-22/shared";
import { catchError, map, throwError, type Observable } from "rxjs";
import { AppError } from "./app-error.js";

const CONTRACT_KEY = "aula-clara:contract";

const METHODS: Record<HttpMethod, RequestMethod> = {
  GET: RequestMethod.GET,
  POST: RequestMethod.POST,
  PUT: RequestMethod.PUT,
  PATCH: RequestMethod.PATCH,
  DELETE: RequestMethod.DELETE,
};

/**
 * Hace cumplir el contrato de la ruta:
 *
 * 1. Valida el cuerpo (o la query en GET) con el esquema del contrato. Si falla, responde
 *    VALIDATION_FAILED con un error por campo, con la misma clave que ve el front. Si pasa,
 *    el handler recibe el cuerpo ya validado (sin campos de más).
 * 2. Valida la respuesta correcta con el esquema del contrato (y saca campos de más, así no se
 *    filtra nada que el contrato no declare). Si no cumple, INTERNAL_ERROR.
 * 3. Si el handler lanza un AppError que el contrato no declara, INTERNAL_ERROR: el front solo
 *    sabe manejar los errores declarados.
 */
@Injectable()
export class ContractInterceptor implements NestInterceptor {
  private readonly logger = new Logger("Contract");

  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const contract = this.reflector.get<EndpointContract | undefined>(CONTRACT_KEY, context.getHandler());
    if (!contract) return next.handle();

    const request = context.switchToHttp().getRequest<{ body?: unknown; query?: unknown }>();
    const input = contract.method === "GET" ? request.query : request.body;
    const parsed = contract.body.safeParse(input ?? {});
    if (!parsed.success) {
      const p = problemFromZodError(parsed.error);
      throw new AppError("VALIDATION_FAILED", { errors: p.errors ?? [] });
    }
    if (contract.method === "GET") request.query = parsed.data;
    else request.body = parsed.data;

    return next.handle().pipe(
      map((data: unknown) => {
        const out = contract.response.safeParse(data);
        if (!out.success) {
          this.logger.error(`${contract.id}: la respuesta no cumple el contrato`, JSON.stringify(out.error.issues));
          throw new AppError("INTERNAL_ERROR");
        }
        return out.data;
      }),
      catchError((error: unknown) => {
        if (error instanceof AppError && !(contract.errors as readonly string[]).includes(error.code)) {
          this.logger.error(`${contract.id}: devolvió ${error.code}, que no está declarado en el contrato`);
          return throwError(() => new AppError("INTERNAL_ERROR"));
        }
        return throwError(() => error);
      }),
    );
  }
}

/**
 * Declara una ruta a partir de su contrato: método, ruta y status de éxito salen del contrato,
 * y ContractInterceptor valida cuerpo, respuesta y errores.
 *
 *   @Controller()
 *   export class AuthController {
 *     @ContractRoute(loginEndpoint)
 *     login(@Body() body: EndpointBody<typeof loginEndpoint>) { … }
 *   }
 */
export function ContractRoute(contract: EndpointContract) {
  return applyDecorators(
    RequestMapping({ path: contract.path, method: METHODS[contract.method] }),
    HttpCode(contract.successStatus),
    SetMetadata(CONTRACT_KEY, contract),
    UseInterceptors(ContractInterceptor),
  );
}
