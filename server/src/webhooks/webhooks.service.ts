import { Injectable, Logger } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { OiWebhookPayload } from './webhook.types';
import { errorMessage } from '../common/errors';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

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
      switch (event) {
        case 'client.created':
        case 'customer.created':
          await this.handleClientCreated(payload);
          break;

        case 'client.updated':
        case 'customer.updated':
          await this.handleClientUpdated(payload);
          break;

        case 'vehicle.created':
          await this.handleVehicleCreated(payload);
          break;

        case 'service_order.created':
        case 'os.created':
          // Para OS, precisaríamos de diagnóstico prévio — só logamos por enquanto
          this.logger.log(
            `OS recebida via webhook: ${JSON.stringify(payload)}`,
          );
          break;

        default:
          // Evento desconhecido — marca como IGNORED mas mantém o registro
          await this.prisma.webhookEvent.update({
            where: { id },
            data: { status: 'IGNORED', processedAt: new Date() },
          });
          return;
      }

      await this.prisma.webhookEvent.update({
        where: { id },
        data: { status: 'PROCESSED', processedAt: new Date() },
      });
    } catch (err) {
      await this.prisma.webhookEvent.update({
        where: { id },
        data: { status: 'FAILED', error: errorMessage(err) },
      });
      throw err;
    }
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
    const [total, processed, failed, ignored] = await Promise.all([
      this.prisma.webhookEvent.count(),
      this.prisma.webhookEvent.count({ where: { status: 'PROCESSED' } }),
      this.prisma.webhookEvent.count({ where: { status: 'FAILED' } }),
      this.prisma.webhookEvent.count({ where: { status: 'IGNORED' } }),
    ]);
    return {
      total,
      processed,
      failed,
      ignored,
      received: total - processed - failed - ignored,
    };
  }
}
