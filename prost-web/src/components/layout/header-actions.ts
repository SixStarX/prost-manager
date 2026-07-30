import { createContext, useContext, useEffect, type ReactNode } from 'react';

/** Permite que uma página injete ações no slot direito do cabeçalho. */
export const HeaderActionsContext = createContext<(node: ReactNode) => void>(() => {});

/**
 * Registra ações no cabeçalho enquanto a página estiver montada.
 * Uso: `useHeaderActions(<HeaderIconButton … />, [deps])`.
 *
 * Vive fora de `Layout.tsx` para que aquele arquivo exporte apenas o componente
 * (requisito do Fast Refresh: um módulo de componente não deve exportar hooks).
 */
export function useHeaderActions(node: ReactNode, deps: unknown[] = []) {
  const setActions = useContext(HeaderActionsContext);
  useEffect(() => {
    setActions(node);
    return () => setActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
