import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Topbar from './Topbar';

const links = [
  { to: '/',               label: 'Dashboard',        icon: '📊' },
  { to: '/clients',        label: 'Clientes',          icon: '👥' },
  { to: '/vehicles',       label: 'Veículos',          icon: '🚗' },
  { to: '/diagnostics',    label: 'Diagnósticos',      icon: '🔍' },
  { to: '/service-orders', label: 'Ordens de Serviço', icon: '📋' },
  { to: '/integrations',   label: 'Integrações',       icon: '🔗' },
];

export default function Layout() {
  const { logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-[244px] min-w-[244px] bg-surface flex flex-col border-r border-white/[.05] relative"
             style={{ backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,.025) 0%, transparent 30%)' }}>

        {/* Brand */}
        <div className="flex items-center gap-[11px] px-[18px] py-5 border-b border-white/[.05]">
          <div className="brand-ring w-9 h-9 bg-brand rounded-sm flex items-center justify-center text-[17px] shrink-0 relative
                          shadow-[0_0_24px_rgba(230,57,70,.25)]">
            🔧
          </div>
          <div>
            <div className="text-sm font-black text-t1 tracking-tight uppercase">Prost Manager</div>
            <div className="text-[10px] font-medium text-t4 tracking-[.08em] uppercase mt-px">Sistema de Gestão</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-1.5 overflow-y-auto">
          <div className="px-[18px] pt-[18px] pb-1.5 text-[10px] font-bold tracking-[.12em] uppercase text-t4">Menu</div>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `nav-icon-parent flex items-center gap-2.5 mx-2.5 my-px px-2.5 py-[9px] rounded-sm text-[13px] font-medium
                 transition-all duration-150 relative cursor-pointer
                 ${isActive ? 'nav-active' : 'text-t2 hover:bg-white/[.04] hover:text-t1'}`
              }
            >
              <span className="nav-icon w-[30px] h-[30px] rounded-xs flex items-center justify-center text-sm shrink-0 bg-white/[.04] transition-all duration-150">
                {l.icon}
              </span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2.5 border-t border-white/[.05]">
          <div className="flex items-center gap-2.5 px-2 py-[9px] rounded-sm cursor-pointer transition-all duration-150 hover:bg-white/[.04]"
               onClick={logout} title="Sair">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0
                            shadow-[0_0_10px_rgba(230,57,70,.15)]"
                 style={{ background: 'linear-gradient(135deg,#e63946,#7c3aed)' }}>
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-semibold text-t1 truncate">Administrador</div>
              <div className="text-[10.5px] text-t3 mt-px">Clique para sair</div>
            </div>
            <button className="p-1 rounded-xs text-t3 text-[15px] leading-none transition-all duration-150 hover:text-brand hover:bg-brand/[.07]">
              ↩
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-base">
        <Topbar />
        <div className="flex-1 overflow-y-auto p-7 pb-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
