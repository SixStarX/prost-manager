import * as Sentry from '@sentry/react';

/**
 * Inicializa o Sentry no cliente. Carregado via import dinâmico apenas quando
 * VITE_SENTRY_DSN existe (mantém o bundle enxuto quando não há monitoramento).
 */
export function initSentry() {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0),
  });
}
