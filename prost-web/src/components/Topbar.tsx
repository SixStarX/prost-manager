import { useLocation } from 'react-router-dom';

const TITLES: Record<string, string> = {
  '/':               'Dashboard',
  '/clients':        'Clientes',
  '/vehicles':       'Veículos',
  '/diagnostics':    'Diagnósticos',
  '/service-orders': 'Ordens de Serviço',
};

export default function Topbar() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? 'Prost Manager';

  return (
    <div className="h-14 flex items-center gap-4 px-6 shrink-0 bg-surface border-b border-white/[.05]"
         style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)' }}>
      <span className="flex-1 text-sm font-bold text-t1 tracking-tight">{title}</span>
      <div className="w-[7px] h-[7px] rounded-full bg-ok animate-pulse-dot"
           style={{ boxShadow: '0 0 8px rgba(16,212,142,.5)' }} />
      <span className="text-[10px] font-bold tracking-[.08em] uppercase px-[10px] py-[3px] rounded-full
                       bg-brand/[.15] text-brand border border-brand/40">
        Admin
      </span>
    </div>
  );
}
