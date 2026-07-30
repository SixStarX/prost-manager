import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from './layout/AppHeader';
import Sidebar from './layout/Sidebar';
import GlobalSearch from './search/GlobalSearch';
import { HeaderActionsContext } from './layout/header-actions';
import { taglineForPath, SIDEBAR_ROOTS } from '@/lib/nav';

/**
 * Shell global — réplica do app antigo: cabeçalho fixo com a marca centralizada
 * e nada mais. Cada página monta o próprio <main> com o container que lhe cabe.
 */
export default function Layout() {
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [actions, setActions] = useState<ReactNode>(null);

  /* Troca de rota limpa as ações da página anterior — feito durante o render
     (padrão de reset por mudança de prop), não em effect. */
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setActions(null);
  }

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
