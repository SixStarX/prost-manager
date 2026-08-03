import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

// PrismaService é global (@Global no PrismaModule), então basta declarar o controller.
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
