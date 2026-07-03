import { useLocation } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { titleForPath } from '@/lib/nav';

interface TopbarProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
}

export default function Topbar({ onMenuClick, onSearchClick }: TopbarProps) {
  const { pathname } = useLocation();
  const title = titleForPath(pathname);

  return (
    <header
      className="h-14 flex items-center gap-3 px-4 sm:px-6 shrink-0 bg-surface border-b border-white/[.05]"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)' }}
    >
      {/* Hamburger — apenas mobile */}
      <button
        onClick={onMenuClick}
        aria-label="Abrir menu"
        className="lg:hidden -ml-1 p-2 rounded-sm text-t2 hover:text-t1 hover:bg-white/[.05] transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <span className="text-sm font-bold text-t1 tracking-tight truncate">{title}</span>

      {/* Busca global — campo (desktop) / ícone (mobile) */}
      <button
        onClick={onSearchClick}
        aria-label="Buscar (Ctrl+K)"
        className="ml-auto flex items-center gap-2 h-9 rounded-sm text-t3 transition-colors
                   sm:w-64 sm:px-3 sm:bg-raised sm:border sm:border-white/[.08] sm:hover:border-white/[.15] sm:hover:bg-overlay
                   p-2 hover:text-t1 hover:bg-white/[.05] sm:hover:text-t2"
      >
        <Search className="w-[15px] h-[15px] shrink-0" />
        <span className="hidden sm:inline text-[13px]">Buscar…</span>
        <kbd className="hidden sm:inline-flex ml-auto items-center gap-0.5 text-[10px] font-semibold bg-base border border-white/[.1] rounded px-1.5 py-0.5">
          Ctrl K
        </kbd>
      </button>

      <div
        className="w-[7px] h-[7px] rounded-full bg-ok animate-pulse-dot"
        style={{ boxShadow: '0 0 8px rgba(16,185,129,.5)' }}
      />
      <span className="text-[10px] font-bold tracking-[.08em] uppercase px-[10px] py-[3px] rounded-full bg-brand/[.15] text-brand border border-brand/40">
        Admin
      </span>
    </header>
  );
}
