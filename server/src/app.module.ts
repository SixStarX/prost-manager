import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DiagnosticsModule } from './diagnostics/diagnostics.module';
import { ServiceOrdersModule } from './service-orders/service-orders.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { OiModule } from './oficina-inteligente/oi.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ClientsModule,
    VehiclesModule,
    DiagnosticsModule,
    ServiceOrdersModule,
    DashboardModule,
    IntegrationsModule,
    WebhooksModule,
    OiModule,
  ],
})
export class AppModule {}
