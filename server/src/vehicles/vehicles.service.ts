import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data,
      include: { client: true },
    });
  }

  findAll() {
    return this.prisma.vehicle.findMany({
      include: { client: true },
    });
  }

  findOne(id: string) {
    return this.prisma.vehicle.findUnique({
      where: { id },
      include: { client: true },
    });
  }
}
