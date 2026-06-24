import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Post()
  create(@Body() body: CreateVehicleDto) {
    return this.vehiclesService.create(body);
  }

  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }
}
