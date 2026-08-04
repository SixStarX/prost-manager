import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { SentryModule } from '@sentry/nestjs/setup';
import { PrismaModule } from './prisma/prisma.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DiagnosticsModule } from './diagnostics/diagnostics.module';
import { ServiceOrdersModule } from './service-orders/service-orders.module';
import { ChecklistsModule } from './checklists/checklists.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { OiModule } from './oficina-inteligente/oi.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Sentry primeiro (captura erros de toda a app). No-op sem SENTRY_DSN.
    SentryModule.forRoot(),
    // Carrega o server/.env em process.env, de forma global, antes dos demais
    // módulos (o AuthModule depende de JWT_SECRET já estar disponível).
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting global: 120 req/min por IP. Armazenamento em memória — para
    // múltiplas instâncias, trocar por storage compartilhado (ex.: Redis).
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    // Habilita @Cron (retry agendado dos webhooks).
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    ClientsModule,
    VehiclesModule,
    DiagnosticsModule,
    ServiceOrdersModule,
    ChecklistsModule,
    DashboardModule,
    IntegrationsModule,
    WebhooksModule,
    OiModule,
    HealthModule,
  ],
  providers: [
    // Filtro global: padroniza erros e reporta 5xx ao Sentry (no-op sem DSN).
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    // Guard global de rate limiting (soma-se ao JwtAuthGuard do AuthModule).
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
