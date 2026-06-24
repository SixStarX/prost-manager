import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';

const fullInclude = {
  diagnostic: {
    include: {
      vehicle: {
        include: { client: true },
      },
    },
  },
};

@Injectable()
export class ServiceOrdersService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateServiceOrderDto) {
    return this.prisma.serviceOrder.create({
      data,
      include: fullInclude,
    });
  }

  findAll() {
    return this.prisma.serviceOrder.findMany({
      include: fullInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.serviceOrder.findUnique({
      where: { id },
      include: fullInclude,
    });
  }

  async update(id: string, data: UpdateServiceOrderDto) {
    const exists = await this.prisma.serviceOrder.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Ordem de serviço não encontrada');

    return this.prisma.serviceOrder.update({
      where: { id },
      data,
      include: fullInclude,
    });
  }
}
