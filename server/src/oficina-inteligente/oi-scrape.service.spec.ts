import {
  OiScrapeService,
  normalize,
  buildIndex,
  cell,
  parseMoney,
  parseYear,
  mapStatus,
} from './oi-scrape.service';
import { PrismaService } from '../prisma/prisma.service';

describe('oi-scrape helpers', () => {
  it('normalize: minúsculas, sem acentos, só alfanumérico', () => {
    expect(normalize('Razão Social')).toBe('razaosocial');
    expect(normalize('CPF/CNPJ')).toBe('cpfcnpj');
    expect(normalize('  Ano  ')).toBe('ano');
    expect(normalize('')).toBe('');
  });

  it('parseMoney: formato pt-BR', () => {
    expect(parseMoney('R$ 1.234,56')).toBe(1234.56);
    expect(parseMoney('1.000,00')).toBe(1000);
    expect(parseMoney('50,5')).toBe(50.5);
    expect(parseMoney('')).toBe(0);
    expect(parseMoney('abc')).toBe(0);
  });

  it('parseYear: extrai o ano de vários formatos', () => {
    expect(parseYear('2012')).toBe(2012);
    expect(parseYear('2012/2013')).toBe(2012);
    expect(parseYear('2012 - GASOLINA')).toBe(2012);
    expect(parseYear('sem ano')).toBe(new Date().getFullYear());
  });

  it('mapStatus: situação da OI → status do Prost', () => {
    expect(mapStatus('Aprovado Total')).toBe('DONE');
    expect(mapStatus('Gerado O.S.')).toBe('DONE');
    expect(mapStatus('Aprovado Parcial')).toBe('IN_PROGRESS');
    expect(mapStatus('Em andamento')).toBe('IN_PROGRESS');
    expect(mapStatus('Em aberto')).toBe('OPEN');
    expect(mapStatus('Reprovado')).toBe('OPEN');
    expect(mapStatus('')).toBe('OPEN');
  });

  it('buildIndex + cell: mapeia colunas por aliases normalizados', () => {
    const idx = buildIndex(['Nome do Cliente', 'CPF/CNPJ', 'Valor Total']);
    const row = ['João Silva', '123.456.789-00', 'R$ 500,00'];
    expect(cell(row, idx, 'nome', 'nomedocliente')).toBe('João Silva');
    expect(cell(row, idx, 'cpf', 'cpfcnpj')).toBe('123.456.789-00');
    expect(cell(row, idx, 'valortotal')).toBe('R$ 500,00');
    expect(cell(row, idx, 'inexistente')).toBe('');
  });
});

describe('OiScrapeService.isCollectorTokenValid', () => {
  const svc = new OiScrapeService({} as unknown as PrismaService);
  const prevEnv = process.env.NODE_ENV;
  const prevToken = process.env.COLLECTOR_TOKEN;

  afterEach(() => {
    process.env.NODE_ENV = prevEnv;
    if (prevToken === undefined) delete process.env.COLLECTOR_TOKEN;
    else process.env.COLLECTOR_TOKEN = prevToken;
  });

  it('sem token configurado: libera fora de produção', () => {
    delete process.env.COLLECTOR_TOKEN;
    process.env.NODE_ENV = 'development';
    expect(svc.isCollectorTokenValid(undefined)).toBe(true);
  });

  it('sem token configurado: recusa em produção (fail-closed)', () => {
    delete process.env.COLLECTOR_TOKEN;
    process.env.NODE_ENV = 'production';
    expect(svc.isCollectorTokenValid('qualquer')).toBe(false);
  });

  it('com token configurado: valida corretamente', () => {
    process.env.COLLECTOR_TOKEN = 'segredo-do-coletor';
    expect(svc.isCollectorTokenValid('segredo-do-coletor')).toBe(true);
    expect(svc.isCollectorTokenValid('errado')).toBe(false);
    expect(svc.isCollectorTokenValid(undefined)).toBe(false);
  });
});
