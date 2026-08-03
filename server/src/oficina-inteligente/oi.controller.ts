import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  Headers,
  HttpCode,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { OiService } from './oi.service';
import { OiScrapeService } from './oi-scrape.service';
import type { ScrapePayload } from './oi-scrape.service';
import { Public } from '../auth/public.decorator';

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
  // Recebido do bookmarklet, que roda no painel da OI (origem externa, sem JWT).
  // Autenticado por um token compartilhado (X-Collector-Token), embutido no
  // bookmarklet gerado por um usuário já logado — bloqueia escrita anônima.
  @Public()
  @Post('scrape')
  @HttpCode(200)
  ingestScrape(
    @Body() payload: ScrapePayload,
    @Headers('x-collector-token') token?: string,
  ) {
    if (!this.scrape.isCollectorTokenValid(token)) {
      throw new UnauthorizedException(
        'Coletor não autorizado: token ausente ou inválido.',
      );
    }
    return this.scrape.ingest(payload);
  }

  /**
   * GET /oi/collector-token — devolve o token compartilhado do coletor.
   * Exige login (não é `@Public`): só um usuário autenticado gera o bookmarklet.
   */
  @Get('collector-token')
  getCollectorToken() {
    const token = process.env.COLLECTOR_TOKEN ?? '';
    return { token, configured: token.length > 0 };
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
      throw new BadRequestException(
        'Formato de data inválido. Use dd/MM/yyyy.',
      );
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
