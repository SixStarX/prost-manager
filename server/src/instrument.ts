// Instrumentação do Sentry — DEVE ser o primeiro import do main.ts, antes de
// qualquer módulo do Nest, para instrumentar o runtime corretamente.
// No-op se SENTRY_DSN não estiver configurado.
//
// Carrega o .env aqui porque este arquivo roda ANTES do ConfigModule. Em
// produção as variáveis já vêm do ambiente (container), então o dotenv é inócuo.
import 'dotenv/config';
import * as Sentry from '@sentry/nestjs';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0),
  });
}
