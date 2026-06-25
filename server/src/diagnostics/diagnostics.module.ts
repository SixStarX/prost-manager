import { Module } from '@nestjs/common';
import { DiagnosticsController } from './diagnostics.controller';
import { DiagnosticsService } from './diagnostics.service';
import { DiagnosticsAiService } from './ai/diagnostics-ai.service';

@Module({
  controllers: [DiagnosticsController],
  providers: [DiagnosticsService, DiagnosticsAiService],
})
export class DiagnosticsModule {}
