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
      recentServiceOrders,
    };
  }
}
