import { Injectable, Logger } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private prisma: PrismaService) {}

  /** Verifica assinatura HMAC-SHA256 da Oficina Inteligente */
  verifySignature(rawBody: Buffer, signature: string | undefined): boolean {
    const secret = process.env.OI_WEBHOOK_SECRET;
    if (!secret) return true; // Se não configurado, aceita tudo (dev mode)
    if (!signature) return false;

    const expected = createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const sigPart = signature.startsWith('sha256=') ? signature.slice(7) : signature;

    try {
      return timingSafeEqual(Buffer.from(expected), Buffer.from(sigPart));
    } catch {
      return false;
    }
  }

  async receive(source: string, event: string, payload: object): Promise<{ ok: boolean; id: string }> {
    const record = await this.prisma.webhookEvent.create({
      data: {
        source,
        event,
        payload: JSON.stringify(payload),
        status: 'RECEIVED',
      },
    });

    // Processa o evento de forma assíncrona (não bloqueia o response)
    this.processEvent(record.id, event, payload).catch((err) =>
      this.logger.error(`Falha ao processar evento ${record.id}: ${err.message}`)
    );

    return { ok: true, id: record.id };
  }

  private async processEvent(id: string, event: string, payload: any) {
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
          this.logger.log(`OS recebida via webhook: ${JSON.stringify(payload)}`);
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
    } catch (err: any) {
      await this.prisma.webhookEvent.update({
        where: { id },
        data: { status: 'FAILED', error: err.message },
      });
      throw err;
    }
  }

  private async handleClientCreated(payload: any) {
    const name  = payload.nome  || payload.name  || payload.razao_social;
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

  private async handleClientUpdated(payload: any) {
    const name  = payload.nome || payload.name;
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

  private async handleVehicleCreated(payload: any) {
    const plate    = payload.placa || payload.plate;
    const brand    = payload.marca || payload.brand || '—';
    const model    = payload.modelo || payload.model || '—';
    const year     = parseInt(payload.ano || payload.year, 10) || new Date().getFullYear();
    const cliName  = payload.cliente || payload.proprietario || payload.owner;

    if (!plate || !cliName) return;

    const exists = await this.prisma.vehicle.findFirst({
      where: { plate: { equals: plate } },
    });
    if (exists) return;

    const client = await this.prisma.client.findFirst({
      where: { name: { equals: cliName } },
    });
    if (!client) {
      this.logger.warn(`Veículo ${plate} recebido mas cliente "${cliName}" não encontrado.`);
      return;
    }

    await this.prisma.vehicle.create({
      data: { plate: plate.toUpperCase(), brand, model, year, clientId: client.id },
    });
    this.logger.log(`Veículo criado via webhook: ${plate}`);
  }

  // ── Consultas ─────────────────────────────────────────────────

  async getEvents(limit = 100) {
    return this.prisma.webhookEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true, source: true, event: true,
        status: true, error: true, createdAt: true, processedAt: true,
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
    return { total, processed, failed, ignored, received: total - processed - failed - ignored };
  }
}
