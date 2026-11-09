import { Catch, HttpException, HttpStatus, Logger, type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import { PROBLEM_CONTENT_TYPE, problem, type Problem } from "@cloud-grupo-22/shared";
import { AppError } from "./app-error.js";

/** Lo mínimo de Express que usa el filtro (evita sumar @types/express solo por esto). */
interface HttpRequest {
  originalUrl?: string;
  url: string;
}
interface HttpResponse {
  status(code: number): HttpResponse;
  type(contentType: string): HttpResponse;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
}

/**
 * Toda respuesta de error de la API sale de acá, con formato Problem Details (RFC 9457) y un
 * código del catálogo de @cloud-grupo-22/shared:
 *
 * - AppError → su código, con el status del catálogo (y `Retry-After` si trae espera).
 * - 404 de Nest (ruta inexistente) → NOT_FOUND.
 * - Otros 4xx de Nest o de Express (JSON mal formado, cuerpo demasiado grande) → VALIDATION_FAILED.
 * - Cualquier otra cosa → INTERNAL_ERROR, sin exponer el mensaje interno; se registra en el log.
 */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger("ProblemDetails");

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<HttpRequest>();
    const response = http.getResponse<HttpResponse>();

    const body: Problem = { ...this.toProblem(exception, request), instance: request.originalUrl ?? request.url };

    response.status(body.status).type(PROBLEM_CONTENT_TYPE);
    if (body.retryAfterSeconds) response.setHeader("Retry-After", String(body.retryAfterSeconds));
    response.json(body);
  }

  private toProblem(exception: unknown, request: HttpRequest): Problem {
    if (exception instanceof AppError) {
      if (exception.code === "INTERNAL_ERROR") this.logger.error(exception.message, exception.stack);
      return problem(exception.code, exception.extras);
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status === HttpStatus.NOT_FOUND) return problem("NOT_FOUND");
      if (status >= 400 && status < 500) {
        return problem("VALIDATION_FAILED", { detail: exception.message });
      }
    }

    this.logger.error(
      `Error no controlado en ${request.originalUrl ?? request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );
    return problem("INTERNAL_ERROR");
  }
}
