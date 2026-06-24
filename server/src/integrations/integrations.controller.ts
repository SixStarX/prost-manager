import {
  Controller, Post, Get, UploadedFile, UseInterceptors,
  Res, HttpCode, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { IntegrationsService } from './integrations.service';
import { memoryStorage } from 'multer';

const csvUpload = {
  storage: memoryStorage(),
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    if (!file.originalname.match(/\.(csv|txt)$/i)) {
      return cb(new BadRequestException('Apenas arquivos .csv são aceitos.'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
};

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly svc: IntegrationsService) {}

  // ── Importar ──────────────────────────────────────────────────

  @Post('import/clients')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file', csvUpload))
  importClients(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');
    return this.svc.importClients(file);
  }

  @Post('import/vehicles')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file', csvUpload))
  importVehicles(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');
    return this.svc.importVehicles(file);
  }

  // ── Exportar ──────────────────────────────────────────────────

  @Get('export/clients')
  async exportClients(@Res() res: Response) {
    const csv = await this.svc.exportClients();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="prost-clientes.csv"');
    res.send('﻿' + csv); // BOM para UTF-8 no Excel
  }

  @Get('export/vehicles')
  async exportVehicles(@Res() res: Response) {
    const csv = await this.svc.exportVehicles();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="prost-veiculos.csv"');
    res.send('﻿' + csv);
  }

  @Get('export/service-orders')
  async exportOrders(@Res() res: Response) {
    const csv = await this.svc.exportServiceOrders();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="prost-ordens-servico.csv"');
    res.send('﻿' + csv);
  }

  // ── Histórico ─────────────────────────────────────────────────

  @Get('import/history')
  getHistory() {
    return this.svc.getImportHistory();
  }
}
