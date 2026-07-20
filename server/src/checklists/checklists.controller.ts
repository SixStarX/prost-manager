import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ChecklistsService } from './checklists.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';

@Controller()
export class ChecklistsController {
  constructor(private checklistsService: ChecklistsService) {}

  @Post('checklists')
  create(@Body() body: CreateChecklistDto) {
    return this.checklistsService.create(body);
  }

  /** "Veículos em Serviço" — checklists ativos, com busca opcional. */
  @Get('checklists')
  listActive(@Query('search') search?: string) {
    return this.checklistsService.listActive(search);
  }

  @Get('checklists/:id')
  findOne(@Param('id') id: string) {
    return this.checklistsService.findOne(id);
  }

  @Patch('checklists/:id')
  update(@Param('id') id: string, @Body() body: UpdateChecklistDto) {
    return this.checklistsService.update(id, body);
  }

  /** Histórico de checklists de um veículo. */
  @Get('vehicles/:id/checklists')
  findByVehicle(
    @Param('id') vehicleId: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
  ) {
    const takeNum = take ? Math.min(Math.max(Number(take), 1), 100) : 20;
    return this.checklistsService.findByVehicle(vehicleId, takeNum, cursor);
  }
}
