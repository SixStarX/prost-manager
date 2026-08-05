import { createHmac } from 'crypto';
import { WebhooksService } from './webhooks.service';
import { PrismaService } from '../prisma/prisma.service';

function makeService(prisma: unknown) {
  return new WebhooksService(prisma as PrismaService);
}

describe('WebhooksService.verifySignature', () => {
  const prevEnv = process.env.NODE_ENV;
  const prevSecret = process.env.OI_WEBHOOK_SECRET;
  const svc = makeService({});

  afterEach(() => {
    process.env.NODE_ENV = prevEnv;
    if (prevSecret === undefined) delete process.env.OI_WEBHOOK_SECRET;
    else process.env.OI_WEBHOOK_SECRET = prevSecret;
  });

  it('sem segredo: libera fora de produção', () => {
    delete process.env.OI_WEBHOOK_SECRET;
    process.env.NODE_ENV = 'development';
    expect(svc.verifySignature(Buffer.from('{}'), undefined)).toBe(true);
  });

  it('sem segredo: recusa em produção (fail-closed)', () => {
    delete process.env.OI_WEBHOOK_SECRET;
    process.env.NODE_ENV = 'production';
    expect(svc.verifySignature(Buffer.from('{}'), 'sha256=x')).toBe(false);
  });

  it('valida a assinatura HMAC (com e sem prefixo) e rejeita a errada', () => {
    process.env.OI_WEBHOOK_SECRET = 'segredo';
    const body = Buffer.from('{"a":1}');
    const sig = createHmac('sha256', 'segredo').update(body).digest('hex');
    expect(svc.verifySignature(body, `sha256=${sig}`)).toBe(true);
    expect(svc.verifySignature(body, sig)).toBe(true);
    expect(svc.verifySignature(body, 'sha256=deadbeef')).toBe(false);
    expect(svc.verifySignature(body, undefined)).toBe(false);
  });
});

describe('WebhooksService.getStats', () => {
  it('agrega contagens e calcula received', async () => {
    const count = jest
      .fn()
      .mockResolvedValueOnce(10) // total
      .mockResolvedValueOnce(6) // processed
      .mockResolvedValueOnce(1) // failed
      .mockResolvedValueOnce(2) // ignored
      .mockResolvedValueOnce(1); // dead
    const svc = makeService({ webhookEvent: { count } });
    expect(await svc.getStats()).toEqual({
      total: 10,
      processed: 6,
      failed: 1,
      ignored: 2,
      dead: 1,
      received: 0,
    });
  });
});

describe('WebhooksService.retryEvent (backoff + dead-letter)', () => {
  function makePrisma(attemptsBefore: number, handlerFails: boolean) {
    const update = jest.fn().mockResolvedValue({});
    const findUnique = jest
      .fn()
      .mockImplementation((args: { select?: Record<string, boolean> }) => {
        const sel = args.select;
        if (!sel) {
          return Promise.resolve({
            id: 'e1',
            event: 'client.created',
            payload: '{"nome":"X"}',
          });
        }
        if (sel.attempts && !sel.status) {
          return Promise.resolve({ attempts: attemptsBefore });
        }
        return Promise.resolve({ status: 'x', attempts: attemptsBefore + 1 });
      });
    const client = {
      findFirst: jest.fn().mockResolvedValue(null),
      create: handlerFails
        ? jest.fn().mockRejectedValue(new Error('boom'))
        : jest.fn().mockResolvedValue({ id: 'c1' }),
    };
    return { prisma: { webhookEvent: { findUnique, update }, client }, update };
  }

  function dataOf(update: jest.Mock): Record<string, unknown> {
    return (update.mock.calls[0][0] as { data: Record<string, unknown> }).data;
  }

  it('sucesso: marca PROCESSED', async () => {
    const { prisma, update } = makePrisma(0, false);
    await makeService(prisma).retryEvent('e1');
    expect(dataOf(update).status).toBe('PROCESSED');
  });

  it('falha: marca FAILED com backoff (attempts=1, nextRetryAt setado)', async () => {
    const { prisma, update } = makePrisma(0, true);
    await makeService(prisma).retryEvent('e1');
    const data = dataOf(update);
    expect(data.status).toBe('FAILED');
    expect(data.attempts).toBe(1);
    expect(data.nextRetryAt).toBeInstanceOf(Date);
  });

  it('esgota tentativas: move para DEAD (sem próximo retry)', async () => {
    const { prisma, update } = makePrisma(4, true); // 4 -> 5 = MAX_ATTEMPTS
    await makeService(prisma).retryEvent('e1');
    const data = dataOf(update);
    expect(data.status).toBe('DEAD');
    expect(data.attempts).toBe(5);
    expect(data.nextRetryAt).toBeNull();
  });
});
