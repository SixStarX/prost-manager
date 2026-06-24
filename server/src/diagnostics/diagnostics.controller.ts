import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DiagnosticsService } from './diagnostics.service';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';

@Controller('diagnostics')
export class DiagnosticsController {
  constructor(private diagnosticsService: DiagnosticsService) {}

  @Post()
  create(@Body() body: CreateDiagnosticDto) {
    return this.diagnosticsService.create(body);
  }

  @Get()
  findAll() {
    return this.diagnosticsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.diagnosticsService.findOne(id);
  }
}
