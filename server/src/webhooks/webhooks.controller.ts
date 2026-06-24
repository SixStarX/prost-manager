import {
  Controller, Post, Get, Param, Body, Headers,
  Req, UnauthorizedException, HttpCode, Query,
} from '@nestjs/common';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly svc: WebhooksService) {}

  /**
   * POST /webhooks/oficina-inteligente
   * Endpoint que a Oficina Inteligente deve configurar como destino dos eventos.
   *
   * Cabeçalhos esperados:
   *   X-OI-Signature : sha256=<hmac>   (opcional — verificado se OI_WEBHOOK_SECRET estiver configurado)
   *   X-OI-Event     : client.created  (opcional — fallback para payload.event)
   */
  @Post('oficina-inteligente')
  @HttpCode(200)
  async receive(
    @Req() req: Request,
    @Body() body: any,
    @Headers('x-oi-signature') signature?: string,
    @Headers('x-oi-event')     eventHeader?: string,
  ) {
    // Verificação de assinatura
    const rawBody = (req as any).rawBody as Buffer | undefined;
    if (rawBody) {
      const valid = this.svc.verifySignature(rawBody, signature);
      if (!valid) throw new UnauthorizedException('Assinatura do webhook inválida.');
    }

    const event = eventHeader || body?.event || body?.tipo || body?.type || 'unknown';
    return this.svc.receive('oficina_inteligente', event, body);
  }

  // ── Consultas (para o painel de integrações) ─────────────────

  @Get('events')
  getEvents(@Query('limit') limit?: string) {
    return this.svc.getEvents(limit ? parseInt(limit, 10) : 100);
  }

  @Get('events/:id')
  getEvent(@Param('id') id: string) {
    return this.svc.getEventById(id);
  }

  @Get('stats')
  getStats() {
    return this.svc.getStats();
  }
}
