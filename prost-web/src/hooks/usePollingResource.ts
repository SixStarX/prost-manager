import { useEffect, useState } from 'react';

interface PollingOptions {
  /** Intervalo de atualização automática em ms. Omitido/0 = sem polling. */
  intervalMs?: number;
  /** Refaz a busca quando a aba volta ao foco/visibilidade. */
  refetchOnFocus?: boolean;
}

interface PollingResult<T> {
  data: T | null;
  /** `true` apenas quando a primeira carga falha (refetches são silenciosos). */
  error: boolean;
}

/**
 * Busca um recurso e o mantém atualizado (polling opcional + refetch ao focar).
 *
 * - Refetches são silenciosos: preservam os dados visíveis e só marcam `error`
 *   se a **primeira** carga falhar — a tela não pisca nem perde dados válidos.
 * - Uma guarda de montagem (`active`) descarta respostas que chegam após o
 *   desmonte, evitando setState em componente desmontado.
 *
 * O fetch roda numa função local dentro do effect (não num `useCallback`), o
 * que também mantém a regra `react-hooks/set-state-in-effect` satisfeita.
 *
 * `fetcher` deve ser estável (envolva em `useCallback`) para não reiniciar o
 * ciclo a cada render.
 */
export function usePollingResource<T>(
  fetcher: () => Promise<T>,
  { intervalMs, refetchOnFocus }: PollingOptions = {},
): PollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let hasData = false;

    const run = async () => {
      try {
        const result = await fetcher();
        if (!active) return;
        hasData = true;
        setData(result);
        setError(false);
      } catch {
        // Só sinaliza erro se nunca carregou; não apaga dados já visíveis.
        if (active && !hasData) setError(true);
      }
    };

    void run();

    const timer = intervalMs ? window.setInterval(() => void run(), intervalMs) : undefined;
    const onFocus = () => {
      if (document.visibilityState === 'visible') void run();
    };
    if (refetchOnFocus) {
      window.addEventListener('focus', onFocus);
      document.addEventListener('visibilitychange', onFocus);
    }

    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
      if (refetchOnFocus) {
        window.removeEventListener('focus', onFocus);
        document.removeEventListener('visibilitychange', onFocus);
      }
    };
  }, [fetcher, intervalMs, refetchOnFocus]);

  return { data, error };
}
