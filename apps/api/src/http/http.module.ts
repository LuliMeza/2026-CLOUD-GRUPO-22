import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ContractInterceptor } from "./contract.js";
import { ProblemDetailsFilter } from "./problem-details.filter.js";

/**
 * Manejo HTTP común: todas las respuestas de error en Problem Details (ProblemDetailsFilter,
 * global) y el cumplimiento de contratos en las rutas declaradas con @ContractRoute.
 */
@Module({
  providers: [{ provide: APP_FILTER, useClass: ProblemDetailsFilter }, ContractInterceptor],
  exports: [ContractInterceptor],
})
export class HttpModule {}
