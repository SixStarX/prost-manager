import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// ── Tipos do payload enviado pelo coletor (bookmarklet) ─────────────────────

export interface ScrapePayload {
  /** Tipo de relatório coletado da tela da OI */
  kind: 'orders' | 'clients' | 'vehicles';
  /** Cabeçalhos da tabela exatamente como aparecem na tela */
  headers: string[];
  /** Linhas da tabela (cada linha é um array de células, na ordem dos headers) */
  rows: string[][];
}

export interface ScrapeResult {
  kind: string;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

// ── Helpers de mapeamento de colunas ────────────────────────────────────────

/** Normaliza: minúsculas, sem acentos, só letras e números */
function normalize(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/** Constrói um índice header-normalizado → posição na linha */
function buildIndex(headers: string[]): Record<string, number> {
  const idx: Record<string, number> = {};
  headers.forEach((h, i) => {
    idx[normalize(h)] = i;
  });
  return idx;
}

/** Pega o valor de uma célula tentando múltiplos aliases de coluna */
function cell(row: string[], idx: Record<string, number>, ...aliases: string[]): string {
  for (const alias of aliases) {
    const pos = idx[normalize(alias)];
    if (pos !== undefined && row[pos] != null) {
      const v = String(row[pos]).trim();
      if (v) return v;
    }
  }
  return '';
}

/** "R$ 1.234,56" → 1234.56 */
function parseMoney(s: string): number {
  if (!s) return 0;
  const clean = s
    .replace(/[^\d.,-]/g, '')
    .replace(/\./g, '')       // remove separador de milhar
    .replace(',', '.');       // vírgula decimal → ponto
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
}

function parseYear(s: string): number {
  // aceita "2012", "2012/2013", "2012 - GASOLINA"
  const m = (s || '').match(/(19|20)\d{2}/);
  return m ? parseInt(m[0], 10) : new Date().getFullYear();
}

/**
 * Mapeia a situação da OI (orçamento ou OS) para o status do Prost.
 * Status conhecidos da OI: Enviado, Aprovado Total, Aprovado Parcial,
 * Em aberto, Reprovado, Gerado Revisão, Gerado O.S., Aberta, Fechada.
 */
function mapStatus(situacao: string): 'OPEN' | 'IN_PROGRESS' | 'DONE' {
  const s = (situacao || '').toLowerCase();
  if (/aprovado\s*total|conclu|finaliz|fechad|pago|gerado\s*o\.?s/.test(s)) return 'DONE';
  if (/aprovado\s*parcial|andamento|revis|execu/.test(s))                   return 'IN_PROGRESS';
  return 'OPEN'; // enviado, em aberto, reprovado, etc.
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class OiScrapeService {
  private readonly logger = new Logger(OiScrapeService.name);

  constructor(private prisma: PrismaService) {}

  async ingest(payload: ScrapePayload): Promise<ScrapeResult> {
    const { kind, headers, rows } = payload;

    if (!kind || !Array.isArray(headers) || !Array.isArray(rows)) {
      throw new BadRequestException('Payload inválido: informe kind, headers e rows.');
    }
    if (rows.length === 0) {
      throw new BadRequestException('Nenhuma linha encontrada na tabela.');
    }

    const idx = buildIndex(headers);
    let result: ScrapeResult;

    switch (kind) {
      case 'orders':   result = await this.ingestOrders(rows, idx);   break;
      case 'clients':  result = await this.ingestClients(rows, idx);  break;
      case 'vehicles': result = await this.ingestVehicles(rows, idx); break;
      default:
        throw new BadRequestException(`Tipo de coleta desconhecido: ${kind}`);
    }

    await this.prisma.oiSyncJob.create({
      data: {
        source: 'scrape',
        kind,
        date: new Date().toLocaleDateString('pt-BR'),
        total:   result.total,
        created: result.created,
        updated: result.updated,
        skipped: result.skipped,
        errors:  result.errors.length ? JSON.stringify(result.errors) : null,
        status:  result.total > 0 && result.skipped === result.total ? 'FAILED' : 'DONE',
      },
    });

    this.logger.log(
      `Coleta ${kind}: ${result.total} linhas | +${result.created} | ↻${result.updated} | ✗${result.skipped}`,
    );

    return result;
  }

  // ── Clientes ────────────────────────────────────────────────────────────────

  private async ingestClients(rows: string[][], idx: Record<string, number>): Promise<ScrapeResult> {
    const errors: string[] = [];
    let created = 0, updated = 0, skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name    = cell(row, idx, 'nome', 'cliente', 'nomedocliente', 'razaosocial', 'nomerazaosocial');
      const phone   = cell(row, idx, 'celular', 'telefone', 'fone', 'contato', 'whatsapp');
      const email   = cell(row, idx, 'email', 'e-mail');
      const cpfcnpj = cell(row, idx, 'cpfcnpj', 'cpf', 'cnpj', 'documento');

      if (!name) { skipped++; errors.push(`Linha ${i + 1}: sem nome de cliente.`); continue; }

      try {
        const existing = await this.findClient(name, cpfcnpj);
        if (existing) {
          await this.prisma.client.update({
            where: { id: existing.id },
            data: {
              ...(phone ? { phone } : {}),
              ...(email ? { email } : {}),
              ...(cpfcnpj ? { cpfcnpj } : {}),
            },
          });
          updated++;
        } else {
          await this.prisma.client.create({
            data: { name, phone: phone || '—', email: email || null, cpfcnpj: cpfcnpj || null },
          });
          created++;
        }
      } catch (e: any) {
        skipped++; errors.push(`Linha ${i + 1} (${name}): ${e.message}`);
      }
    }

    return { kind: 'clients', total: rows.length, created, updated, skipped, errors };
  }

  // ── Veículos ──────────────────────────────────────────────────────────────

  private async ingestVehicles(rows: string[][], idx: Record<string, number>): Promise<ScrapeResult> {
    const errors: string[] = [];
    let created = 0, updated = 0, skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const plate   = cell(row, idx, 'placa', 'plate').toUpperCase();
      const brand   = cell(row, idx, 'marca', 'fabricante');
      const model   = cell(row, idx, 'modelo', 'veiculo', 'descricao');
      const yearRaw = cell(row, idx, 'ano', 'anofabricacao', 'anomodelo');
      const cliName = cell(row, idx, 'cliente', 'proprietario', 'dono', 'nomedocliente', 'nome');

      if (!plate)   { skipped++; errors.push(`Linha ${i + 1}: sem placa.`); continue; }
      if (!cliName) { skipped++; errors.push(`Linha ${i + 1} (${plate}): sem cliente/proprietário.`); continue; }

      try {
        const client = await this.findClient(cliName);
        if (!client) {
          skipped++;
          errors.push(`Linha ${i + 1} (${plate}): cliente "${cliName}" não encontrado. Colete os clientes primeiro.`);
          continue;
        }

        const existing = await this.prisma.vehicle.findFirst({ where: { plate: { equals: plate } } });
        if (existing) {
          await this.prisma.vehicle.update({
            where: { id: existing.id },
            data: {
              ...(brand ? { brand } : {}),
              ...(model ? { model } : {}),
              ...(yearRaw ? { year: parseYear(yearRaw) } : {}),
            },
          });
          updated++;
        } else {
          await this.prisma.vehicle.create({
            data: {
              plate,
              brand: brand || '—',
              model: model || '—',
              year:  parseYear(yearRaw),
              clientId: client.id,
            },
          });
          created++;
        }
      } catch (e: any) {
        skipped++; errors.push(`Linha ${i + 1} (${plate}): ${e.message}`);
      }
    }

    return { kind: 'vehicles', total: rows.length, created, updated, skipped, errors };
  }

  // ── Ordens de Serviço ───────────────────────────────────────────────────────

  private async ingestOrders(rows: string[][], idx: Record<string, number>): Promise<ScrapeResult> {
    const errors: string[] = [];
    let created = 0, updated = 0, skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const oiId    = cell(row, idx, 'os', 'numero', 'numerodaos', 'ordemdeservico', 'ordemdeservicoid', 'codigo', 'id');
      const cliName = cell(row, idx, 'cliente', 'nomedocliente', 'nome', 'proprietario');
      const plate   = cell(row, idx, 'placa', 'plate').toUpperCase();
      const model   = cell(row, idx, 'modelo', 'veiculo');
      const yearRaw = cell(row, idx, 'ano', 'anofabricacao');
      const phone   = cell(row, idx, 'celular', 'telefone', 'fone', 'contato');
      const cpfcnpj = cell(row, idx, 'cpfcnpj', 'cpf', 'cnpj', 'documento');
      const valor   = parseMoney(cell(row, idx, 'valor', 'total', 'valortotal', 'valordaos', 'valordaordemdeservico'));
      const situacao= cell(row, idx, 'situacao', 'status', 'situacaodaos');
      const desc    = cell(row, idx, 'descricao', 'servico', 'servicos', 'observacao', 'observacoes');

      if (!cliName) { skipped++; errors.push(`Linha ${i + 1}: OS sem cliente.`); continue; }
      if (!plate)   { skipped++; errors.push(`Linha ${i + 1} (${cliName}): OS sem placa.`); continue; }

      const status = mapStatus(situacao);

      try {
        // 1. Cliente (upsert)
        let client = await this.findClient(cliName, cpfcnpj);
        if (!client) {
          client = await this.prisma.client.create({
            data: { name: cliName, phone: phone || '—', cpfcnpj: cpfcnpj || null },
          });
        } else if (phone || cpfcnpj) {
          client = await this.prisma.client.update({
            where: { id: client.id },
            data: { ...(phone ? { phone } : {}), ...(cpfcnpj ? { cpfcnpj } : {}) },
          });
        }

        // 2. Veículo (upsert por placa)
        let vehicle = await this.prisma.vehicle.findFirst({ where: { plate: { equals: plate } } });
        if (!vehicle) {
          vehicle = await this.prisma.vehicle.create({
            data: {
              plate,
              brand: '—',
              model: model || '—',
              year:  parseYear(yearRaw),
              clientId: client.id,
            },
          });
        }

        // 3. Ordem de Serviço (upsert por oiId, quando disponível)
        const notes = this.buildNotes(oiId, valor, cpfcnpj);
        const existing = oiId
          ? await this.prisma.serviceOrder.findFirst({ where: { oiId } })
          : null;

        if (existing) {
          await this.prisma.serviceOrder.update({
            where: { id: existing.id },
            data: { status, notes, oiTotal: valor },
          });
          updated++;
        } else {
          const diagnostic = await this.prisma.diagnostic.create({
            data: {
              description: desc || 'OS coletada do painel da Oficina Inteligente',
              status: status === 'DONE' ? 'DONE' : 'PENDING',
              vehicleId: vehicle.id,
            },
          });
          await this.prisma.serviceOrder.create({
            data: {
              status,
              notes,
              oiId: oiId || null,
              oiTotal: valor,
              diagnosticId: diagnostic.id,
            },
          });
          created++;
        }
      } catch (e: any) {
        skipped++; errors.push(`Linha ${i + 1} (${cliName}/${plate}): ${e.message}`);
      }
    }

    return { kind: 'orders', total: rows.length, created, updated, skipped, errors };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async findClient(name: string, cpfcnpj?: string) {
    if (cpfcnpj) {
      const byCpf = await this.prisma.client.findFirst({ where: { cpfcnpj } });
      if (byCpf) return byCpf;
    }
    return this.prisma.client.findFirst({ where: { name: { equals: name } } });
  }

  private buildNotes(oiId: string, valor: number, cpfcnpj: string): string {
    const parts: string[] = [];
    if (oiId)    parts.push(`OS OI #${oiId}`);
    parts.push(`Total: R$ ${valor.toFixed(2)}`);
    if (cpfcnpj) parts.push(`CPF/CNPJ: ${cpfcnpj}`);
    parts.push('(coletado do painel OI)');
    return parts.join(' | ');
  }
}
