import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NAV_ITEMS } from '@/lib/nav';
import Logo from '@/components/brand/Logo';
import { cn } from '@/lib/utils';

interface SidebarProps {
  /** Aberta no mobile (drawer). No desktop fica sempre visível. */
  open: boolean;
  onNavigate: () => void;
}

export default function Sidebar({ open, onNavigate }: SidebarProps) {
  const { logout } = useAuth();

  return (
    <>
      {/* Backdrop (apenas mobile) */}
      <div
        aria-hidden
        onClick={onNavigate}
        className={cn(
          'fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-200 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[244px] flex flex-col bg-surface border-r border-white/[.05]',
          'transition-transform duration-300 ease-out lg:static lg:translate-x-0 lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,.025) 0%, transparent 30%)' }}
      >
        {/* Brand */}
        <div className="flex items-center px-[18px] py-5 border-b border-white/[.05]">
          <Logo tagline="Manager" markSize={36} />
        </div>

        {/* Nav */}
        <nav className="flex-1 py-1.5 overflow-y-auto">
          <div className="px-[18px] pt-[18px] pb-1.5 text-[10px] font-bold tracking-[.12em] uppercase text-t4">
            Menu
          </div>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 mx-2.5 my-px px-2.5 py-[9px] rounded-sm text-[13px] font-medium',
                  'transition-all duration-150 relative cursor-pointer',
                  isActive ? 'nav-active' : 'text-t2 hover:bg-white/[.04] hover:text-t1',
                )
              }
            >
              <span className="nav-icon w-[30px] h-[30px] rounded-xs flex items-center justify-center shrink-0 bg-white/[.04] text-t2 transition-all duration-150">
                <Icon className="w-[15px] h-[15px]" strokeWidth={2} />
              </span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer / user */}
        <div className="p-2.5 border-t border-white/[.05]">
          <button
            onClick={logout}
            title="Sair"
            className="group w-full flex items-center gap-2.5 px-2 py-[9px] rounded-sm cursor-pointer transition-all duration-150 hover:bg-white/[.04] text-left"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg,#7c6cff,#a855f7)' }}
            >
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-semibold text-t1 truncate">Administrador</div>
              <div className="text-[10.5px] text-t3 mt-px">Clique para sair</div>
            </div>
            <LogOut className="w-4 h-4 text-t3 transition-colors duration-150 group-hover:text-brand" />
          </button>
        </div>
      </aside>
    </>
  );
}
