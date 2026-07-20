import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [
      totalClients,
      totalVehicles,
      totalDiagnostics,
      totalServiceOrders,
      diagnosticsByStatus,
      serviceOrdersByStatus,
      recentServiceOrders,
      timelineOrders,
      checklistsByStatus,
      activeChecklists,
    ] = await Promise.all([
      this.prisma.client.count(),
      this.prisma.vehicle.count(),
      this.prisma.diagnostic.count(),
      this.prisma.serviceOrder.count(),

      this.prisma.diagnostic.groupBy({
        by: ['status'],
        _count: { status: true },
      }),

      this.prisma.serviceOrder.groupBy({
        by: ['status'],
        _count: { status: true },
      }),

      this.prisma.serviceOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          diagnostic: {
            include: {
              vehicle: {
                include: { client: true },
              },
            },
          },
        },
      }),

      // Linha do tempo de veículos (para a Tabela Temporal do Dashboard).
      // Limita a um teto seguro; a ordenação/derivação fica no frontend.
      this.prisma.serviceOrder.findMany({
        take: 300,
        orderBy: { createdAt: 'desc' },
        include: {
          diagnostic: {
            include: {
              vehicle: {
                include: { client: true },
              },
            },
          },
        },
      }),

      // Checklists agregados por status (inclui DELIVERED) — indicadores do Dashboard.
      this.prisma.checklist.groupBy({
        by: ['status'],
        _count: { status: true },
      }),

      // Checklists ativos (não entregues) — quadro semanal + lista no Dashboard.
      this.prisma.checklist.findMany({
        where: { status: { in: ['IN_SERVICE', 'WAITING_PARTS', 'READY'] } },
        orderBy: { createdAt: 'desc' },
        take: 200,
        select: {
          id: true,
          clientId: true,
          vehicleId: true,
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
      }),
    ]);

    return {
      totals: {
        clients: totalClients,
        vehicles: totalVehicles,
        diagnostics: totalDiagnostics,
        serviceOrders: totalServiceOrders,
      },
      diagnosticsByStatus: diagnosticsByStatus.map((d) => ({
        status: d.status,
        count: d._count.status,
      })),
      serviceOrdersByStatus: serviceOrdersByStatus.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
      checklistsByStatus: checklistsByStatus.map((c) => ({
        status: c.status,
        count: c._count.status,
      })),
      activeChecklists,
      recentServiceOrders,
      timeline: timelineOrders.map((o) => {
        const vehicle = o.diagnostic?.vehicle;
        return {
          id: o.id,
          status: o.status,
          entryDate: o.createdAt,
          expectedDeliveryDate: o.expectedDeliveryDate,
          plate: vehicle?.plate ?? null,
          brand: vehicle?.brand ?? null,
          model: vehicle?.model ?? null,
          clientName: vehicle?.client?.name ?? null,
        };
      }),
    };
  }
}
