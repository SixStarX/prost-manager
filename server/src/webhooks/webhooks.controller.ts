import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Headers,
  Req,
  UnauthorizedException,
  HttpCode,
  Query,
} from '@nestjs/common';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service';
import { Public } from '../auth/public.decorator';
import type { OiWebhookPayload } from './webhook.types';

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
  // Ingestão externa: autenticada por HMAC (X-OI-Signature), não por JWT.
  @Public()
  @Post('oficina-inteligente')
  @HttpCode(200)
  async receive(
    @Req() req: Request & { rawBody?: Buffer },
    @Body() body: OiWebhookPayload,
    @Headers('x-oi-signature') signature?: string,
    @Headers('x-oi-event') eventHeader?: string,
  ) {
    // Verificação de assinatura — sempre executada (fail-closed em produção).
    const valid = this.svc.verifySignature(req.rawBody, signature);
    if (!valid)
      throw new UnauthorizedException('Assinatura do webhook inválida.');

    const event =
      eventHeader || body.event || body.tipo || body.type || 'unknown';
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
