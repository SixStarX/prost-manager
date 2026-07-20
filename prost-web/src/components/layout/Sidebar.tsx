import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SIDEBAR_ITEMS } from '@/lib/nav';
import { ProstLogotype } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Navegação lateral em drawer sobreposto.
 *
 * Deliberadamente em overlay (e não em coluna fixa): as telas de Home,
 * Dashboard e Check-list têm métrica fiel ao original, e uma coluna
 * persistente deslocaria o conteúdo. Sobreposto, nenhuma tela muda de
 * geometria — aberto ou fechado.
 */
export default function Sidebar({ open, onClose }: SidebarProps) {
  const { logout } = useAuth();

  /* Esc fecha; trava o scroll do fundo enquanto aberto. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        aria-hidden={!open}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-border bg-card',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Marca */}
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <ProstLogotype className="h-9" />
          <button
            onClick={onClose}
            aria-label="Fechar menu"
            className="rounded-lg p-2 transition-colors hover:bg-secondary"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Menu
          </p>
          {SIDEBAR_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sair */}
        <div className="border-t border-border p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-secondary"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              A
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                Administrador
              </span>
              <span className="block text-xs text-muted-foreground">Clique para sair</span>
            </span>
            <LogOut className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </div>
      </aside>
    </>
  );
}
