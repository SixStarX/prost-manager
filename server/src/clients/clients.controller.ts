import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Post()
  create(@Body() body: CreateClientDto) {
    return this.clientsService.create(body);
  }

  @Get()
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id/profile')
  profile(@Param('id') id: string) {
    return this.clientsService.profile(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }
}
