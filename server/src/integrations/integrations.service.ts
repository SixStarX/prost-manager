import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parse } from 'csv-parse/sync';

// ── Helpers ────────────────────────────────────────────────────

/** Normaliza cabeçalhos: minúsculas sem acentos/espaços */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/** Tenta encontrar o valor de uma linha por múltiplos aliases */
function pick(row: Record<string, string>, ...aliases: string[]): string {
  for (const alias of aliases) {
    const key = Object.keys(row).find((k) => normalize(k) === normalize(alias));
    if (key && row[key]?.trim()) return row[key].trim();
  }
  return '';
}

function parseRows(buffer: Buffer): Record<string, string>[] {
  try {
    return parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_column_count: true,
    }) as Record<string, string>[];
  } catch {
    throw new BadRequestException('Arquivo CSV inválido ou mal formatado.');
  }
}

// ── Service ────────────────────────────────────────────────────

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  // ── IMPORT ────────────────────────────────────────────────────

  async importClients(file: Express.Multer.File) {
    const rows = parseRows(file.buffer);
    const errors: string[] = [];
    let imported = 0;
    let skipped  = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const lineNum = i + 2; // +2: header + 1-based

      const name  = pick(row, 'nome', 'name', 'cliente', 'razao social', 'razaosocial');
      const phone = pick(row, 'telefone', 'phone', 'celular', 'cel', 'fone', 'whatsapp');
      const email = pick(row, 'email', 'e-mail');

      if (!name) {
        errors.push(`Linha ${lineNum}: campo "nome" ausente ou vazio — ignorado.`);
        skipped++;
        continue;
      }

      // Evita duplicatas por nome+telefone
      const exists = await this.prisma.client.findFirst({
        where: { name: { equals: name } },
      });

      if (exists) {
        skipped++;
        errors.push(`Linha ${lineNum}: cliente "${name}" já existe — ignorado.`);
        continue;
      }

      try {
        await this.prisma.client.create({
          data: { name, phone: phone || '—', email: email || null },
        });
        imported++;
      } catch (e: any) {
        errors.push(`Linha ${lineNum}: erro ao salvar "${name}" — ${e.message}`);
        skipped++;
      }
    }

    await this.prisma.importJob.create({
      data: {
        type: 'clients',
        filename: file.originalname,
        total: rows.length,
        imported,
        skipped,
        errors: errors.length ? JSON.stringify(errors) : null,
        status: 'DONE',
      },
    });

    return { total: rows.length, imported, skipped, errors };
  }

  async importVehicles(file: Express.Multer.File) {
    const rows = parseRows(file.buffer);
    const errors: string[] = [];
    let imported = 0;
    let skipped  = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const lineNum = i + 2;

      const plate  = pick(row, 'placa', 'plate');
      const brand  = pick(row, 'marca', 'brand', 'fabricante');
      const model  = pick(row, 'modelo', 'model');
      const yearRaw= pick(row, 'ano', 'year', 'anofabricacao', 'ano fabricacao');
      const cliName= pick(row, 'cliente', 'proprietario', 'owner', 'nome do cliente', 'nomecliente');

      if (!plate) {
        errors.push(`Linha ${lineNum}: campo "placa" ausente — ignorado.`);
        skipped++; continue;
      }
      if (!cliName) {
        errors.push(`Linha ${lineNum}: campo "cliente/proprietário" ausente para placa "${plate}" — ignorado.`);
        skipped++; continue;
      }

      const year = parseInt(yearRaw, 10);
      if (isNaN(year)) {
        errors.push(`Linha ${lineNum}: ano inválido "${yearRaw}" para placa "${plate}" — ignorado.`);
        skipped++; continue;
      }

      const client = await this.prisma.client.findFirst({
        where: { name: { equals: cliName } },
      });

      if (!client) {
        errors.push(`Linha ${lineNum}: cliente "${cliName}" não encontrado para placa "${plate}". Importe os clientes primeiro.`);
        skipped++; continue;
      }

      // Evita duplicata por placa
      const exists = await this.prisma.vehicle.findFirst({ where: { plate: { equals: plate } } });
      if (exists) {
        skipped++;
        errors.push(`Linha ${lineNum}: placa "${plate}" já cadastrada — ignorado.`);
        continue;
      }

      try {
        await this.prisma.vehicle.create({
          data: { plate: plate.toUpperCase(), brand: brand || '—', model: model || '—', year, clientId: client.id },
        });
        imported++;
      } catch (e: any) {
        errors.push(`Linha ${lineNum}: erro ao salvar placa "${plate}" — ${e.message}`);
        skipped++;
      }
    }

    await this.prisma.importJob.create({
      data: {
        type: 'vehicles',
        filename: file.originalname,
        total: rows.length,
        imported,
        skipped,
        errors: errors.length ? JSON.stringify(errors) : null,
        status: 'DONE',
      },
    });

    return { total: rows.length, imported, skipped, errors };
  }

  // ── EXPORT ────────────────────────────────────────────────────

  async exportClients(): Promise<string> {
    const clients = await this.prisma.client.findMany({ orderBy: { createdAt: 'asc' } });
    const header = 'nome,telefone,email,cadastrado_em';
    const rows = clients.map((c) =>
      [this.csv(c.name), this.csv(c.phone), this.csv(c.email ?? ''),
       new Date(c.createdAt).toLocaleDateString('pt-BR')].join(',')
    );
    return [header, ...rows].join('\n');
  }

  async exportVehicles(): Promise<string> {
    const vehicles = await this.prisma.vehicle.findMany({
      include: { client: true }, orderBy: { createdAt: 'asc' }
    });
    const header = 'placa,marca,modelo,ano,proprietario,email_proprietario,cadastrado_em';
    const rows = vehicles.map((v) =>
      [this.csv(v.plate), this.csv(v.brand), this.csv(v.model), v.year,
       this.csv(v.client.name), this.csv(v.client.email ?? ''),
       new Date(v.createdAt).toLocaleDateString('pt-BR')].join(',')
    );
    return [header, ...rows].join('\n');
  }

  async exportServiceOrders(): Promise<string> {
    const orders = await this.prisma.serviceOrder.findMany({
      include: { diagnostic: { include: { vehicle: { include: { client: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    const header = 'id,status,diagnostico,observacoes,veiculo,placa,cliente,criado_em,atualizado_em';
    const rows = orders.map((o) => [
      o.id,
      o.status,
      this.csv(o.diagnostic.description),
      this.csv(o.notes ?? ''),
      this.csv(`${o.diagnostic.vehicle.brand} ${o.diagnostic.vehicle.model}`),
      this.csv(o.diagnostic.vehicle.plate),
      this.csv(o.diagnostic.vehicle.client.name),
      new Date(o.createdAt).toLocaleDateString('pt-BR'),
      new Date(o.updatedAt).toLocaleDateString('pt-BR'),
    ].join(','));
    return [header, ...rows].join('\n');
  }

  // ── HISTÓRICO ─────────────────────────────────────────────────

  async getImportHistory() {
    return this.prisma.importJob.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  }

  /** Escapa valor para CSV (envolve em aspas se contém vírgula ou aspas) */
  private csv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
