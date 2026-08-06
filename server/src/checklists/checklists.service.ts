import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';

/** Código curto por unidade, usado no protocolo (CL-MEC-0052/26). */
const UNIT_CODE: Record<string, string> = {
  MECANICA: 'MEC',
  FUNILARIA: 'FUN',
  BLINDADOS: 'BLI',
};

/** Status "ativos" exibidos em "Veículos em Serviço" / Dashboard. */
const ACTIVE_STATUSES = ['IN_SERVICE', 'WAITING_PARTS', 'READY'];

/** Placa comparável: sem separadores, maiúscula. "abc-1234" → "ABC1234". */
const normPlate = (p?: string | null) =>
  (p ?? '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

/** Documento comparável: só dígitos. */
const normDoc = (d?: string | null) => (d ?? '').replace(/\D/g, '');

@Injectable()
export class ChecklistsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  /**
   * Próxima sequência de protocolo do ano corrente. Baseada no maior
   * `protocolSeq` existente; sem contador transacional dedicado (volume baixo).
   */
  private async nextProtocol(unit?: string) {
    const last = await this.prisma.checklist.findFirst({
      where: { protocolSeq: { not: null } },
      orderBy: { protocolSeq: 'desc' },
      select: { protocolSeq: true },
    });
    const seq = (last?.protocolSeq ?? 0) + 1;
    const code = (unit && UNIT_CODE[unit]) || 'MEC';
    const yy = String(new Date().getFullYear()).slice(-2);
    const protocol = `CL-${code}-${String(seq).padStart(4, '0')}/${yy}`;
    return { seq, protocol };
  }

  /**
   * Resolve — ou cadastra — Cliente e Veículo a partir dos campos do próprio
   * check-list. É o que permite que "Novo Check-list" seja o único ponto de
   * entrada de cadastro: sem isso o registro nasceria órfão (`clientId` nulo),
   * invisível em /clients e /vehicles e sem link no Dashboard.
   *
   * Reaproveitamento (nada de duplicar cadastro a cada vistoria):
   *   - veículo casado pela placa normalizada;
   *   - cliente casado pelo CPF/CNPJ (só dígitos) ou, na falta, pelo nome;
   *   - se a placa já existe, herda o dono dela em vez de criar outro cliente.
   *
   * Sem placa não há como identificar o veículo — nesse caso mantém o
   * comportamento antigo (checklist avulso) em vez de criar lixo no cadastro.
   */
  private async resolveOrCreateVehicle(
    overrides: Omit<CreateChecklistDto, 'vehicleId'>,
  ) {
    const plate = normPlate(overrides.vPlate);
    if (!plate) return null;

    // Sem @unique em `plate`, a comparação normalizada é feita em memória.
    // Volume baixo, mesma premissa já adotada em `nextProtocol`.
    const candidates = await this.prisma.vehicle.findMany({
      select: { id: true, plate: true },
    });
    const hit = candidates.find((v) => normPlate(v.plate) === plate);
    if (hit) {
      return this.prisma.vehicle.findUnique({
        where: { id: hit.id },
        include: { client: true },
      });
    }

    const name = overrides.clientName?.trim();
    if (!name) return null; // sem dono identificável, não cadastra veículo

    const doc = normDoc(overrides.clientCpfCnpj);
    const clientPool = await this.prisma.client.findMany({
      select: { id: true, name: true, cpfcnpj: true },
    });
    const existing =
      (doc && clientPool.find((c) => normDoc(c.cpfcnpj) === doc)) ||
      clientPool.find(
        (c) => c.name.trim().toLowerCase() === name.toLowerCase(),
      );

    const clientId =
      existing?.id ??
      (
        await this.prisma.client.create({
          data: {
            name,
            // `phone` é obrigatório no schema; celular tem precedência.
            phone: overrides.clientMobile ?? overrides.clientPhone ?? '',
            email: overrides.clientEmail,
            cpfcnpj: overrides.clientCpfCnpj,
            whatsapp: overrides.clientMobile,
            zip: overrides.clientZip,
            neighborhood: overrides.clientNeighborhood,
            city: overrides.clientCity,
            state: overrides.clientState,
            notes: overrides.clientNotes,
          },
          select: { id: true },
        })
      ).id;

    const created = await this.prisma.vehicle.create({
      data: {
        plate: overrides.vPlate!.trim(),
        brand: overrides.vBrand ?? '',
        model: overrides.vModel ?? '',
        year: overrides.vYear ?? 0,
        color: overrides.vColor,
        chassis: overrides.vChassis,
        mileage: overrides.kmIn,
        clientId,
      },
      select: { id: true },
    });

    return this.prisma.vehicle.findUnique({
      where: { id: created.id },
      include: { client: true },
    });
  }

  /**
   * Cria um checklist. Se `vehicleId` for enviado (fluxo do ClientProfile),
   * resolve veículo + cliente e grava os snapshots; caso contrário tenta
   * resolver/cadastrar cliente e veículo pelos campos do formulário
   * (fluxo "Novo Check-list"). Gera protocolo a partir da unidade.
   */
  async create(dto: CreateChecklistDto) {
    const { vehicleId, ...overrides } = dto;

    let vehicle: Prisma.VehicleGetPayload<{
      include: { client: true };
    }> | null = null;

    if (vehicleId) {
      vehicle = await this.prisma.vehicle.findUnique({
        where: { id: vehicleId },
        include: { client: true },
      });
      if (!vehicle) throw new NotFoundException('Veículo não encontrado');
    } else {
      // "Novo Check-list": cadastra (ou reaproveita) cliente + veículo.
      vehicle = await this.resolveOrCreateVehicle(overrides);
    }

    const client = vehicle?.client ?? null;
    const { seq, protocol } = await this.nextProtocol(overrides.unit);

    const data: Prisma.ChecklistCreateInput = {
      ...(vehicle ? { vehicle: { connect: { id: vehicle.id } } } : {}),
      ...(client ? { client: { connect: { id: client.id } } } : {}),

      unit: overrides.unit,
      protocol,
      protocolSeq: seq,

      status: overrides.status ?? 'IN_SERVICE',
      entryDate: overrides.entryDate ?? new Date().toISOString(),
      expectedDate: overrides.expectedDate,
      exitDate: overrides.exitDate,
      responsible: overrides.responsible,

      // Snapshot cliente
      clientName: overrides.clientName ?? client?.name ?? '',
      clientPhone: overrides.clientPhone ?? client?.phone,
      clientMobile: overrides.clientMobile,
      clientPhone2: overrides.clientPhone2,
      clientEmail: overrides.clientEmail ?? client?.email,
      clientCpfCnpj: overrides.clientCpfCnpj ?? client?.cpfcnpj,
      clientRg: overrides.clientRg,
      clientNotes: overrides.clientNotes,
      clientAddress: overrides.clientAddress,
      clientNeighborhood: overrides.clientNeighborhood,
      clientCity: overrides.clientCity,
      clientState: overrides.clientState,
      clientZip: overrides.clientZip,

      // Snapshot veículo
      vBrand: overrides.vBrand ?? vehicle?.brand,
      vModel: overrides.vModel ?? vehicle?.model,
      vYear: overrides.vYear ?? vehicle?.year,
      vPlate: overrides.vPlate ?? vehicle?.plate,
      vColor: overrides.vColor,
      vChassis: overrides.vChassis,
      kmIn: overrides.kmIn,
      kmOut: overrides.kmOut,

      // Combustível
      fuelType: overrides.fuelType,
      fuelLevel: overrides.fuelLevel,

      // Seções item → condição
      externalAccessories: overrides.externalAccessories,
      safetyEquipment: overrides.safetyEquipment,
      interiorTech: overrides.interiorTech,

      // Mapeamento de avarias
      damageMarks: overrides.damageMarks as Prisma.InputJsonValue | undefined,

      // Diagnóstico e prazos
      diagnosis: overrides.diagnosis,
      requestedServices: overrides.requestedServices,
      observations: overrides.observations,

      // Assinaturas
      signCompanyName: overrides.signCompanyName,
      signClientName: overrides.signClientName,
      signCompanyImage: overrides.signCompanyImage,
      signClientImage: overrides.signClientImage,
      signedAt: overrides.signedAt,
    };

    // Assinaturas base64 (dataURL) → storage; guarda só a chave (P4).
    data.signCompanyImage =
      (await this.storage.persistDataUrl(
        data.signCompanyImage,
        'checklists',
      )) ?? undefined;
    data.signClientImage =
      (await this.storage.persistDataUrl(data.signClientImage, 'checklists')) ??
      undefined;
    return this.prisma.checklist.create({ data });
  }

  /**
   * Lista de "Veículos em Serviço": checklists ativos (não entregues), com
   * filtro por texto (protocolo, cliente, placa, marca/modelo). Retorna apenas
   * os campos usados na Home e no Dashboard de Entregas.
   */
  async listActive(search?: string) {
    const term = search?.trim();
    const where: Prisma.ChecklistWhereInput = {
      status: { in: ACTIVE_STATUSES },
      ...(term
        ? {
            OR: [
              { protocol: { contains: term } },
              { clientName: { contains: term } },
              { vPlate: { contains: term } },
              { vBrand: { contains: term } },
              { vModel: { contains: term } },
            ],
          }
        : {}),
    };

    const items = await this.prisma.checklist.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        protocol: true,
        unit: true,
        status: true,
        clientName: true,
        vBrand: true,
        vModel: true,
        vPlate: true,
        expectedDate: true,
        createdAt: true,
      },
    });
    return { items };
  }

  findOne(id: string) {
    return this.prisma.checklist.findUnique({ where: { id } });
  }

  async update(id: string, dto: UpdateChecklistDto) {
    const exists = await this.prisma.checklist.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Checklist não encontrado');

    // `whitelist` já removeu chaves desconhecidas; repassamos o DTO direto.
    // Json fields aceitam objeto ou undefined; demais campos aceitam null p/ limpar.
    // Assinaturas: dataURL → storage (só a chave vai ao banco); null/undefined
    // e chaves já existentes passam direto (retrocompatível — P4).
    const data = {
      ...dto,
      signCompanyImage: await this.storage.persistDataUrl(
        dto.signCompanyImage,
        'checklists',
      ),
      signClientImage: await this.storage.persistDataUrl(
        dto.signClientImage,
        'checklists',
      ),
    } as Prisma.ChecklistUpdateInput;

    // Transferência de unidade (ex.: Mecânica → Funilaria): o protocolo
    // acompanha a nova sigla, preservando sequência e ano — o atendimento
    // continua rastreável pelo mesmo número (CL-MEC-0054/26 → CL-FUN-0054/26).
    const newCode = dto.unit ? UNIT_CODE[dto.unit] : undefined;
    if (newCode && dto.unit !== exists.unit && exists.protocol) {
      data.protocol = exists.protocol.replace(/^CL-[A-Z]+-/, `CL-${newCode}-`);
    }

    return this.prisma.checklist.update({ where: { id }, data });
  }

  /** Histórico de checklists de um veículo, paginado (cursor por id, desc por data). */
  async findByVehicle(vehicleId: string, take = 20, cursor?: string) {
    const items = await this.prisma.checklist.findMany({
      where: { vehicleId },
      orderBy: { createdAt: 'desc' },
      take: take + 1, // +1 para saber se há próxima página
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        status: true,
        createdAt: true,
        entryDate: true,
        expectedDate: true,
        exitDate: true,
        responsible: true,
        observations: true,
      },
    });

    const hasMore = items.length > take;
    const page = hasMore ? items.slice(0, take) : items;
    return {
      items: page,
      nextCursor: hasMore ? page[page.length - 1].id : null,
    };
  }
}
