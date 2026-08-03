import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/public.decorator';

/**
 * Health check público (sem JWT) para orquestradores, load balancers e monitores
 * de uptime. Verifica a conectividade com o banco. Isento de rate limiting.
 */
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @SkipThrottle()
  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      // 503 sinaliza "não saudável" para o orquestrador.
      throw new ServiceUnavailableException({ status: 'error', db: 'down' });
    }
    return {
      status: 'ok',
      db: 'up',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
