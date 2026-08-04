import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { OiWebhookPayload } from './webhook.types';
import { errorMessage } from '../common/errors';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly MAX_ATTEMPTS = 5;

  constructor(private prisma: PrismaService) {}

  /** Verifica assinatura HMAC-SHA256 da Oficina Inteligente */
  verifySignature(
    rawBody: Buffer | undefined,
    signature: string | undefined,
  ): boolean {
    const secret = process.env.OI_WEBHOOK_SECRET;
    if (!secret) {
      // Fail-closed em produção: sem segredo, nenhum webhook é aceito.
      if (process.env.NODE_ENV === 'production') {
        this.logger.error(
          'OI_WEBHOOK_SECRET ausente em produção — webhook recusado.',
        );
        return false;
      }
      this.logger.warn(
        'OI_WEBHOOK_SECRET não configurado — aceitando sem verificação (apenas fora de produção).',
      );
      return true;
    }
    if (!rawBody || !signature) return false;

    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');

    const sigPart = signature.startsWith('sha256=')
      ? signature.slice(7)
      : signature;

    try {
      const a = Buffer.from(expected);
      const b = Buffer.from(sigPart);
      // timingSafeEqual exige buffers do mesmo tamanho.
      if (a.length !== b.length) return false;
      return timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  async receive(
    source: string,
    event: string,
    payload: OiWebhookPayload,
  ): Promise<{ ok: boolean; id: string }> {
    const record = await this.prisma.webhookEvent.create({
      data: {
        source,
        event,
        payload: JSON.stringify(payload),
        status: 'RECEIVED',
      },
    });

    // Processa o evento de forma assíncrona (não bloqueia o response)
    void this.processEvent(record.id, event, payload).catch((err) =>
      this.logger.error(
        `Falha ao processar evento ${record.id}: ${errorMessage(err)}`,
      ),
    );

    return { ok: true, id: record.id };
  }

  private async processEvent(
    id: string,
    event: string,
    payload: OiWebhookPayload,
  ) {
    try {
      const handled = await this.runHandlers(event, payload);
      await this.prisma.webhookEvent.update({
        where: { id },
        data: {
          status: handled ? 'PROCESSED' : 'IGNORED',
          processedAt: new Date(),
          error: null,
          nextRetryAt: null,
        },
      });
    } catch (err) {
      await this.recordFailure(id, err);
    }
  }

  /**
   * Executa os handlers do evento. Retorna `false` para evento desconhecido
   * (marcado como IGNORED, sem retry). Lança em erro (dispara o retry).
   */
  private async runHandlers(
    event: string,
    payload: OiWebhookPayload,
  ): Promise<boolean> {
    switch (event) {
      case 'client.created':
      case 'customer.created':
        await this.handleClientCreated(payload);
        return true;

      case 'client.updated':
      case 'customer.updated':
        await this.handleClientUpdated(payload);
        return true;

      case 'vehicle.created':
        await this.handleVehicleCreated(payload);
        return true;

      case 'service_order.created':
      case 'os.created':
        // Para OS, precisaríamos de diagnóstico prévio — só logamos por enquanto
        this.logger.log(`OS recebida via webhook: ${JSON.stringify(payload)}`);
        return true;

      default:
        return false; // desconhecido → IGNORED
    }
  }

  /**
   * Registra a falha: incrementa tentativas e agenda o próximo retry com
   * backoff exponencial (2, 4, 8… min, teto 60). Esgotadas as tentativas,
   * move para DEAD (dead-letter) para inspeção/retry manual.
   */
  private async recordFailure(id: string, err: unknown) {
    const current = await this.prisma.webhookEvent.findUnique({
      where: { id },
      select: { attempts: true },
    });
    const attempts = (current?.attempts ?? 0) + 1;
    const exhausted = attempts >= this.MAX_ATTEMPTS;
    const backoffMin = Math.min(2 ** attempts, 60);

    await this.prisma.webhookEvent.update({
      where: { id },
      data: {
        status: exhausted ? 'DEAD' : 'FAILED',
        attempts,
        error: errorMessage(err),
        nextRetryAt: exhausted
          ? null
          : new Date(Date.now() + backoffMin * 60_000),
      },
    });

    this.logger.error(
      `Webhook ${id} falhou (tentativa ${attempts}/${this.MAX_ATTEMPTS})` +
        `${exhausted ? ' — movido para DEAD (dead-letter)' : `, próximo retry em ${backoffMin}min`}: ${errorMessage(err)}`,
    );
  }

  /**
   * Reprocessa periodicamente os eventos FAILED cujo backoff já venceu.
   * Os handlers verificam existência antes de criar, então reprocessar (mesmo
   * em múltiplas instâncias) não duplica dados.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async retryDueEvents() {
    const due = await this.prisma.webhookEvent.findMany({
      where: { status: 'FAILED', nextRetryAt: { lte: new Date() } },
      select: { id: true, event: true, payload: true },
      orderBy: { nextRetryAt: 'asc' },
      take: 20,
    });
    if (due.length === 0) return;

    this.logger.log(`Retry de ${due.length} webhook(s) pendente(s).`);
    for (const ev of due) {
      let payload: OiWebhookPayload;
      try {
        payload = JSON.parse(ev.payload) as OiWebhookPayload;
      } catch {
        await this.prisma.webhookEvent.update({
          where: { id: ev.id },
          data: { status: 'DEAD', error: 'Payload inválido (JSON).' },
        });
        continue;
      }
      await this.processEvent(ev.id, ev.event, payload);
    }
  }

  /**
   * Retry manual (endpoint admin): reprocessa um evento FAILED/DEAD agora.
   */
  async retryEvent(id: string) {
    const ev = await this.prisma.webhookEvent.findUnique({ where: { id } });
    if (!ev) return { ok: false, message: 'Evento não encontrado.' };

    let payload: OiWebhookPayload;
    try {
      payload = JSON.parse(ev.payload) as OiWebhookPayload;
    } catch {
      return { ok: false, message: 'Payload inválido (JSON).' };
    }
    await this.processEvent(id, ev.event, payload);
    const updated = await this.prisma.webhookEvent.findUnique({
      where: { id },
      select: { status: true, attempts: true },
    });
    return { ok: true, status: updated?.status, attempts: updated?.attempts };
  }

  private async handleClientCreated(payload: OiWebhookPayload) {
    const name = payload.nome || payload.name || payload.razao_social;
    const phone = payload.telefone || payload.phone || payload.celular || '—';
    const email = payload.email || null;

    if (!name) return;

    const exists = await this.prisma.client.findFirst({
      where: { name: { equals: name } },
    });
    if (exists) return; // já existe, ignora

    await this.prisma.client.create({ data: { name, phone, email } });
    this.logger.log(`Cliente criado via webhook: ${name}`);
  }

  private async handleClientUpdated(payload: OiWebhookPayload) {
    const name = payload.nome || payload.name;
    const phone = payload.telefone || payload.phone || payload.celular;
    const email = payload.email;

    if (!name) return;

    const client = await this.prisma.client.findFirst({
      where: { name: { equals: name } },
    });
    if (!client) return;

    await this.prisma.client.update({
      where: { id: client.id },
      data: {
        ...(phone ? { phone } : {}),
        ...(email !== undefined ? { email } : {}),
      },
    });
    this.logger.log(`Cliente atualizado via webhook: ${name}`);
  }

  private async handleVehicleCreated(payload: OiWebhookPayload) {
    const plate = payload.placa || payload.plate;
    const brand = payload.marca || payload.brand || '—';
    const model = payload.modelo || payload.model || '—';
    const year =
      parseInt(String(payload.ano ?? payload.year ?? ''), 10) ||
      new Date().getFullYear();
    const cliName = payload.cliente || payload.proprietario || payload.owner;

    if (!plate || !cliName) return;

    const exists = await this.prisma.vehicle.findFirst({
      where: { plate: { equals: plate } },
    });
    if (exists) return;

    const client = await this.prisma.client.findFirst({
      where: { name: { equals: cliName } },
    });
    if (!client) {
      this.logger.warn(
        `Veículo ${plate} recebido mas cliente "${cliName}" não encontrado.`,
      );
      return;
    }

    await this.prisma.vehicle.create({
      data: {
        plate: plate.toUpperCase(),
        brand,
        model,
        year,
        clientId: client.id,
      },
    });
    this.logger.log(`Veículo criado via webhook: ${plate}`);
  }

  // ── Consultas ─────────────────────────────────────────────────

  async getEvents(limit = 100) {
    return this.prisma.webhookEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        source: true,
        event: true,
        status: true,
        error: true,
        attempts: true,
        nextRetryAt: true,
        createdAt: true,
        processedAt: true,
        // payload omitido do listing (pode ser grande)
      },
    });
  }

  async getEventById(id: string) {
    return this.prisma.webhookEvent.findUnique({ where: { id } });
  }

  async getStats() {
    const [total, processed, failed, ignored, dead] = await Promise.all([
      this.prisma.webhookEvent.count(),
      this.prisma.webhookEvent.count({ where: { status: 'PROCESSED' } }),
      this.prisma.webhookEvent.count({ where: { status: 'FAILED' } }),
      this.prisma.webhookEvent.count({ where: { status: 'IGNORED' } }),
      this.prisma.webhookEvent.count({ where: { status: 'DEAD' } }),
    ]);
    return {
      total,
      processed,
      failed,
      ignored,
      dead,
      received: total - processed - failed - ignored - dead,
    };
  }
}
