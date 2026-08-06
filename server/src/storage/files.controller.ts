import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { StorageService } from './storage.service';

@Controller('files')
export class FilesController {
  constructor(private readonly storage: StorageService) {}

  /**
   * GET /files/:key — serve um arquivo do storage (ex.: assinatura).
   * Exige JWT (guard global); o navegador envia o cookie httpOnly no <img>.
   */
  @Get(':key')
  async get(@Param('key') key: string, @Res() res: Response) {
    const { buf, contentType } = await this.storage.read(key);
    res.setHeader('Content-Type', contentType);
    // Chaves são imutáveis (UUID no nome) — cache longo é seguro.
    res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
    res.send(buf);
  }
}
