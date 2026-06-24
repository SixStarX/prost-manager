import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
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
}
