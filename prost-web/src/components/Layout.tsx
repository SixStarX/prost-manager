import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from './layout/AppHeader';
import Sidebar from './layout/Sidebar';
import GlobalSearch from './search/GlobalSearch';
import { taglineForPath, SIDEBAR_ROOTS } from '@/lib/nav';

/** Permite que uma página injete ações no slot direito do cabeçalho. */
const HeaderActionsContext = createContext<(node: ReactNode) => void>(() => {});

/**
 * Registra ações no cabeçalho enquanto a página estiver montada.
 * Uso: `useHeaderActions(<HeaderIconButton … />, [deps])`.
 */
export function useHeaderActions(node: ReactNode, deps: unknown[] = []) {
  const setActions = useContext(HeaderActionsContext);
  useEffect(() => {
    setActions(node);
    return () => setActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Shell global — réplica do app antigo: cabeçalho fixo com a marca centralizada
 * e nada mais. Cada página monta o próprio <main> com o container que lhe cabe.
 */
export default function Layout() {
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [actions, setActions] = useState<ReactNode>(null);

  /* Nas raízes o slot esquerdo abre o menu; nas demais, volta. */
  const isRoot = SIDEBAR_ROOTS.includes(pathname);

  /* Busca global permanece acessível por Ctrl+K, sem ocupar espaço no chrome. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* Troca de rota limpa as ações da página anterior. */
  useEffect(() => setActions(null), [pathname]);

  const ctx = useMemo(() => setActions, []);

  return (
    <HeaderActionsContext.Provider value={ctx}>
      <div className="flex min-h-screen flex-col">
        <AppHeader
          tagline={taglineForPath(pathname)}
          back={!isRoot}
          actions={actions}
          onMenu={() => setMenuOpen(true)}
        />

        <div className="flex-1 animate-fade-in">
          <Outlet />
        </div>

        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </div>
    </HeaderActionsContext.Provider>
  );
}
