import { Body, Controller, Get, Param, Post, HttpCode } from '@nestjs/common';
import { DiagnosticsService } from './diagnostics.service';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';
import { DiagnosticsAiService } from './ai/diagnostics-ai.service';
import type { AnalyzeInput } from './ai/diagnostics-ai.service';

@Controller('diagnostics')
export class DiagnosticsController {
  constructor(
    private diagnosticsService: DiagnosticsService,
    private aiService: DiagnosticsAiService,
  ) {}

  @Post()
  create(@Body() body: CreateDiagnosticDto) {
    return this.diagnosticsService.create(body);
  }

  @Get()
  findAll() {
    return this.diagnosticsService.findAll();
  }

  // ── Diagnóstico por IA (Gemini) ──────────────────────────────────────────

  /** GET /diagnostics/ai/status — IA configurada? */
  @Get('ai/status')
  aiStatus() {
    return this.aiService.getStatus();
  }

  /** POST /diagnostics/ai/vin — decodifica um chassis (VIN) */
  @Post('ai/vin')
  @HttpCode(200)
  decodeVin(@Body('vin') vin: string) {
    return this.aiService.decodeVin(vin);
  }

  /** POST /diagnostics/ai/analyze — diagnóstico completo + cotações */
  @Post('ai/analyze')
  @HttpCode(200)
  analyze(@Body() body: AnalyzeInput) {
    return this.aiService.analyze(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.diagnosticsService.findOne(id);
  }
}
