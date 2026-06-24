import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';

@Injectable()
export class DiagnosticsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateDiagnosticDto) {
    return this.prisma.diagnostic.create({
      data,
      include: {
        vehicle: {
          include: { client: true },
        },
      },
    });
  }

  findAll() {
    return this.prisma.diagnostic.findMany({
      include: {
        vehicle: {
          include: { client: true },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.diagnostic.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: { client: true },
        },
      },
    });
  }
}
