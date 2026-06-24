import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OiOrdemDeServico, OiItem, OiProduto, SyncResult } from './oi.types';

const OI_BASE =
  'https://www.oiapi.com.br/ws/v2/IntegracaoOficinaInteligente.asmx';

// ── Helpers ────────────────────────────────────────────────────────────────

/** "Fechada" → "DONE", qualquer outra → "OPEN" */
function mapStatus(oiStatus: string): string {
  return oiStatus === 'Fechada' ? 'DONE' : 'OPEN';
}

/** Monta a descrição do diagnóstico a partir dos itens da OS */
function buildDescription(items: OiItem[]): string {
  if (!items?.length) return 'OS importada da Oficina Inteligente';
  return items
    .map(
      (i) =>
        `${i.DescricaoDoItem.trim()} (${i.QuantidadeDoItem}x R$${Number(i.ValorUnitarioDoItem).toFixed(2)})`,
    )
    .join('; ');
}

/** Monta as observações da OS */
function buildNotes(os: OiOrdemDeServico): string {
  const parts = [`OS OI #${os.OrdemDeServicoID}`];
  parts.push(`Total: R$ ${Number(os.ValorDaOrdemDeServico).toFixed(2)}`);
  if (os.KMDoVeiculo) parts.push(`KM: ${os.KMDoVeiculo}`);
  if (os.CPFCNPJ)     parts.push(`CPF/CNPJ: ${os.CPFCNPJ}`);
  return parts.join(' | ');
}

/** Parseia resposta .NET que pode vir como array direto ou envolta em { d: "..." } */
function parseOiResponse<T>(text: string): T[] {
  const raw = JSON.parse(text);
  if (Array.isArray(raw)) return raw as T[];
  if (raw?.d) {
    const inner = JSON.parse(raw.d);
    return Array.isArray(inner) ? inner : [];
  }
  return [];
}

// ── Service ────────────────────────────────────────────────────────────────

@Injectable()
export class OiService {
  private readonly logger = new Logger(OiService.name);

  constructor(private prisma: PrismaService) {}

  get isConfigured(): boolean {
    return !!process.env.OI_TOKEN;
  }

  private get token(): string {
    const t = process.env.OI_TOKEN;
    if (!t)
      throw new Error(
        'OI_TOKEN não configurado. Defina a variável de ambiente OI_TOKEN no servidor.',
      );
    return t;
  }

  // ── API calls ────────────────────────────────────────────────────────────

  /** Busca Ordens de Serviço da API OI para uma data (formato dd/MM/yyyy) */
  async fetchOrdensDeServico(dateStr: string): Promise<OiOrdemDeServico[]> {
    const url = `${OI_BASE}/OrdemDeServicoJSON?token=${encodeURIComponent(this.token)}&data=${encodeURIComponent(dateStr)}`;
    this.logger.debug(`GET ${url.replace(this.token, '***')}`);

    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) throw new Error(`API OI respondeu HTTP ${res.status}`);

    const text = await res.text();
    return parseOiResponse<OiOrdemDeServico>(text);
  }

  /** Busca o catálogo de Produtos da API OI */
  async fetchProdutos(somenteAtivo = 1): Promise<OiProduto[]> {
    const url = `${OI_BASE}/ProdutoJSON?token=${encodeURIComponent(this.token)}&produtoID=&somenteAtivo=${somenteAtivo}`;
    this.logger.debug(`GET ${url.replace(this.token, '***')}`);

    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) throw new Error(`API OI respondeu HTTP ${res.status}`);

    const text = await res.text();
    return parseOiResponse<OiProduto>(text);
  }

  // ── Sync ─────────────────────────────────────────────────────────────────

  async syncByDate(dateStr: string): Promise<SyncResult> {
    let ordensDeServico: OiOrdemDeServico[];

    try {
      ordensDeServico = await this.fetchOrdensDeServico(dateStr);
    } catch (err: any) {
      await this.prisma.oiSyncJob.create({
        data: {
          date: dateStr,
          total: 0,
          created: 0,
          updated: 0,
          skipped: 0,
          status: 'FAILED',
          errors: JSON.stringify([err.message]),
        },
      });
      throw err;
    }

    const errors: string[] = [];
    let created = 0, updated = 0, skipped = 0;

    for (const os of ordensDeServico) {
      try {
        const oiId = String(os.OrdemDeServicoID);
        const existsBefore = await this.prisma.serviceOrder.findFirst({
          where: { oiId },
        });

        await this.processOrdem(os);

        if (existsBefore) updated++;
        else created++;
      } catch (err: any) {
        this.logger.error(`OS #${os.OrdemDeServicoID}: ${err.message}`);
        errors.push(`OS #${os.OrdemDeServicoID}: ${err.message}`);
        skipped++;
      }
    }

    await this.prisma.oiSyncJob.create({
      data: {
        date: dateStr,
        total: ordensDeServico.length,
        created,
        updated,
        skipped,
        errors: errors.length ? JSON.stringify(errors) : null,
        status:
          ordensDeServico.length > 0 && skipped === ordensDeServico.length
            ? 'FAILED'
            : 'DONE',
      },
    });

    this.logger.log(
      `Sync ${dateStr}: ${ordensDeServico.length} OS | +${created} criadas | ↻${updated} atualizadas | ✗${skipped} ignoradas`,
    );

    return {
      date: dateStr,
      total: ordensDeServico.length,
      created,
      updated,
      skipped,
      errors,
    };
  }

  private async processOrdem(os: OiOrdemDeServico): Promise<void> {
    const client  = await this.upsertClient(os);
    const vehicle = await this.upsertVehicle(os, client.id);

    const oiId   = String(os.OrdemDeServicoID);
    const status = mapStatus(os.SituacaoDaOrdemDeServico);
    const notes  = buildNotes(os);

    const existing = await this.prisma.serviceOrder.findFirst({ where: { oiId } });

    if (existing) {
      await this.prisma.serviceOrder.update({
        where: { id: existing.id },
        data: { status, notes, oiTotal: os.ValorDaOrdemDeServico },
      });
    } else {
      const description = buildDescription(os.Itens);
      const diagStatus  = status === 'DONE' ? 'DONE' : 'PENDING';

      const diagnostic = await this.prisma.diagnostic.create({
        data: { description, status: diagStatus, vehicleId: vehicle.id },
      });

      await this.prisma.serviceOrder.create({
        data: {
          status,
          notes,
          oiId,
          oiTotal: os.ValorDaOrdemDeServico,
          diagnosticId: diagnostic.id,
        },
      });
    }
  }

  private async upsertClient(os: OiOrdemDeServico) {
    const name    = os.NomeDoCliente?.trim() || 'Cliente sem nome';
    const phone   = os.Celular?.trim()       || '—';
    const cpfcnpj = os.CPFCNPJ?.trim()      || null;

    // Prioridade 1: CPF/CNPJ
    if (cpfcnpj) {
      const byCpf = await this.prisma.client.findFirst({ where: { cpfcnpj } });
      if (byCpf) {
        return this.prisma.client.update({
          where: { id: byCpf.id },
          data: { name, phone },
        });
      }
    }

    // Prioridade 2: nome (case-insensitive)
    const byName = await this.prisma.client.findFirst({
      where: { name: { equals: name } },
    });
    if (byName) {
      return this.prisma.client.update({
        where: { id: byName.id },
        data: { phone, ...(cpfcnpj ? { cpfcnpj } : {}) },
      });
    }

    // Criar novo
    return this.prisma.client.create({ data: { name, phone, cpfcnpj } });
  }

  private async upsertVehicle(os: OiOrdemDeServico, clientId: string) {
    const plate = os.PlacaDoVeiculo?.trim().toUpperCase();
    if (!plate) throw new Error('Veículo sem placa — OS ignorada.');

    const existing = await this.prisma.vehicle.findFirst({
      where: { plate: { equals: plate } },
    });
    if (existing) return existing;

    return this.prisma.vehicle.create({
      data: {
        plate,
        brand: '—',
        model: os.ModeloDoVeiculo?.trim() || '—',
        year:  os.AnoDoVeiculo            || new Date().getFullYear(),
        clientId,
      },
    });
  }

  // ── Consultas ────────────────────────────────────────────────────────────

  async getSyncHistory(limit = 20) {
    return this.prisma.oiSyncJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getStatus() {
    const lastSync = await this.prisma.oiSyncJob.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    return { configured: this.isConfigured, lastSync };
  }
}
