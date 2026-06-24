import {
  Controller, Post, Get, Query, Body, HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { OiService } from './oi.service';
import { OiScrapeService } from './oi-scrape.service';
import type { ScrapePayload } from './oi-scrape.service';

@Controller('oi')
export class OiController {
  constructor(
    private readonly svc: OiService,
    private readonly scrape: OiScrapeService,
  ) {}

  /**
   * POST /oi/scrape — recebe os dados de uma tabela coletada pelo
   * bookmarklet dentro do painel da Oficina Inteligente.
   */
  @Post('scrape')
  @HttpCode(200)
  ingestScrape(@Body() payload: ScrapePayload) {
    return this.scrape.ingest(payload);
  }

  /** GET /oi/status — token configurado + última sync */
  @Get('status')
  getStatus() {
    return this.svc.getStatus();
  }

  /**
   * POST /oi/sync?date=dd/MM/yyyy
   * Busca as OS da Oficina Inteligente para a data informada (padrão: hoje)
   * e as importa/atualiza no Prost.
   */
  @Post('sync')
  @HttpCode(200)
  async sync(@Query('date') date?: string) {
    const dateStr = date?.trim() || this.todayBR();

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      throw new BadRequestException('Formato de data inválido. Use dd/MM/yyyy.');
    }

    return this.svc.syncByDate(dateStr);
  }

  /** GET /oi/history?limit=20 */
  @Get('history')
  getHistory(@Query('limit') limit?: string) {
    return this.svc.getSyncHistory(limit ? parseInt(limit, 10) : 20);
  }

  /** GET /oi/produtos — lista produtos/peças da OI (não persiste) */
  @Get('produtos')
  getProdutos(@Query('ativos') ativos?: string) {
    const somenteAtivo = ativos === '0' ? 0 : 1;
    return this.svc.fetchProdutos(somenteAtivo);
  }

  private todayBR(): string {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
  }
}
