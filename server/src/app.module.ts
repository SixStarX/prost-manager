import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
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

@Module({
  imports: [
    // Carrega o server/.env em process.env, de forma global, antes dos demais
    // módulos (o AuthModule depende de JWT_SECRET já estar disponível).
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
})
export class AppModule {}
