import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ServiceOrdersService } from './service-orders.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';

@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private serviceOrdersService: ServiceOrdersService) {}

  @Post()
  create(@Body() body: CreateServiceOrderDto) {
    return this.serviceOrdersService.create(body);
  }

  @Get()
  findAll() {
    return this.serviceOrdersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceOrdersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateServiceOrderDto) {
    return this.serviceOrdersService.update(id, body);
  }
}
