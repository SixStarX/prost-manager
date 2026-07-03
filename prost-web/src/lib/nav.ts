import {
  LayoutDashboard,
  Users,
  Car,
  Stethoscope,
  Bot,
  ClipboardList,
  Plug,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Rota índice (match exato). */
  end?: boolean;
}

/**
 * Fonte única de verdade da navegação.
 * Consumida pela Sidebar e pela Topbar (título da página) — evita duplicação
 * e mantém rótulos sempre sincronizados.
 */
export const NAV_ITEMS: NavItem[] = [
  { to: '/',               label: 'Dashboard',         icon: LayoutDashboard, end: true },
  { to: '/clients',        label: 'Clientes',          icon: Users },
  { to: '/vehicles',       label: 'Veículos',          icon: Car },
  { to: '/diagnostics',    label: 'Diagnósticos',      icon: Stethoscope },
  { to: '/diagnostico-ia', label: 'Diagnóstico IA',    icon: Bot },
  { to: '/service-orders', label: 'Ordens de Serviço', icon: ClipboardList },
  { to: '/integrations',   label: 'Integrações',       icon: Plug },
];

/** Resolve o título da página a partir do pathname atual. */
export function titleForPath(pathname: string): string {
  const match = NAV_ITEMS.find((i) =>
    i.end ? pathname === i.to : pathname.startsWith(i.to),
  );
  return match?.label ?? 'PROST Manager';
}
