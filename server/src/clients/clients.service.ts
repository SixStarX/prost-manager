import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.ClientCreateInput) {
    return this.prisma.client.create({ data });
  }

  findAll() {
    return this.prisma.client.findMany();
  }

  findOne(id: string) {
    return this.prisma.client.findUnique({
      where: { id },
    });
  }

  /**
   * Perfil completo do cliente: dados cadastrais + veículos (com contagem de
   * checklists, status e data do último) + agregados. Consultas em paralelo,
   * sem N+1 (o último checklist por veículo é resolvido em uma única query).
   */
  async profile(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        vehicles: {
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { checklists: true } } },
        },
        _count: { select: { checklists: true, vehicles: true } },
      },
    });
    if (!client) throw new NotFoundException('Cliente não encontrado');

    // Último checklist de cada veículo do cliente (uma query só).
    const latestByVehicle = new Map<
      string,
      { status: string; createdAt: Date }
    >();
    const checklists = await this.prisma.checklist.findMany({
      where: { clientId: id },
      orderBy: { createdAt: 'desc' },
      select: { vehicleId: true, status: true, createdAt: true },
    });
    for (const c of checklists) {
      // checklists "avulsos" (nova seção) não têm vehicleId — ignorados aqui.
      if (c.vehicleId && !latestByVehicle.has(c.vehicleId)) {
        latestByVehicle.set(c.vehicleId, {
          status: c.status,
          createdAt: c.createdAt,
        });
      }
    }

    const vehicles = client.vehicles.map((v) => {
      const latest = latestByVehicle.get(v.id) ?? null;
      return {
        id: v.id,
        plate: v.plate,
        brand: v.brand,
        model: v.model,
        year: v.year,
        createdAt: v.createdAt,
        checklistCount: v._count.checklists,
        currentStatus: latest?.status ?? null,
        lastChecklistAt: latest?.createdAt ?? null,
      };
    });

    return {
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      cpfcnpj: client.cpfcnpj,
      createdAt: client.createdAt,
      totalChecklists: client._count.checklists,
      vehicleCount: client._count.vehicles,
      lastVisit: checklists[0]?.createdAt ?? null,
      vehicles,
    };
  }
}
