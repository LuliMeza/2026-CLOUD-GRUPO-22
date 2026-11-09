import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller.js";
import { HttpModule } from "./http/index.js";
import { PrismaModule } from "./infrastructure/prisma/prisma.module.js";

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [HealthController],
})
export class AppModule {}
