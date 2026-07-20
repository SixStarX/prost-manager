import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
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
 * Consumida pelo AppHeader (menu horizontal) — evita duplicação e mantém
 * rótulos sempre sincronizados.
 */
export const NAV_ITEMS: NavItem[] = [
  { to: '/',               label: 'Dashboard',         icon: LayoutDashboard, end: true },
  { to: '/clients',        label: 'Clientes',          icon: Users, end: true },
  { to: '/checklist/new',  label: 'Novo Check-list',   icon: ClipboardCheck },
  { to: '/vehicles',       label: 'Veículos',          icon: Car },
  { to: '/diagnostics',    label: 'Diagnósticos',      icon: Stethoscope },
  { to: '/diagnostico-ia', label: 'Diagnóstico IA',    icon: Bot },
  { to: '/service-orders', label: 'Ordens de Serviço', icon: ClipboardList },
  { to: '/integrations',   label: 'Integrações',       icon: Plug },
];

/**
 * Rota do Perfil do Cliente, ponto de convergência do app: veículo, checklist
 * e histórico abrem inline a partir dela. Fonte única para as ligações
 * cruzadas entre Dashboard, Veículos, Diagnósticos e Ordens de Serviço.
 */
export function clientProfilePath(
  clientId: string,
  opts?: { vehicleId?: string | null; checklistId?: string | null },
): string {
  const params = new URLSearchParams();
  if (opts?.vehicleId) params.set('vehicle', opts.vehicleId);
  if (opts?.checklistId) params.set('checklist', opts.checklistId);
  const qs = params.toString();
  return `/clients/${clientId}${qs ? `?${qs}` : ''}`;
}

/**
 * Itens da barra lateral. Subconjunto deliberado do NAV_ITEMS — as demais
 * rotas seguem acessíveis por URL direta, conforme definido para o chrome.
 */
export const SIDEBAR_ITEMS: NavItem[] = NAV_ITEMS.filter((i) =>
  ['/clients', '/vehicles', '/integrations'].includes(i.to),
);

/** Rotas em que o cabeçalho mostra o menu (e não a seta de voltar). */
export const SIDEBAR_ROOTS = ['/', '/clients', '/vehicles', '/integrations'];

/**
 * Legenda exibida sob a marca no cabeçalho. As três primeiras reproduzem
 * literalmente os textos do app antigo; as demais seguem o mesmo padrão.
 */
const TAGLINES: Array<[string, string]> = [
  ['/',               'Sistema de Check-list'],
  ['/dashboard',      'Dashboard de Entregas'],
  ['/checklist/new',  'Novo Check-list'],
  ['/overview',       'Visão Geral'],
  ['/clients',        'Clientes'],
  ['/vehicles',       'Veículos'],
  ['/diagnostics',    'Diagnósticos'],
  ['/diagnostico-ia', 'Diagnóstico IA'],
  ['/service-orders', 'Ordens de Serviço'],
  ['/integrations',   'Integrações'],
];

export function taglineForPath(pathname: string): string {
  const exact = TAGLINES.find(([p]) => p === pathname);
  if (exact) return exact[1];

  const prefix = TAGLINES
    .filter(([p]) => p !== '/' && pathname.startsWith(p + '/'))
    .sort((a, b) => b[0].length - a[0].length)[0];
  return prefix?.[1] ?? 'Sistema de Check-list';
}

/**
 * Resolve o título da página a partir do pathname atual.
 * Prioriza match exato (ex.: `/clients/new` → "Adicionar Cliente") e, na
 * ausência, usa o prefixo mais específico (ex.: `/clients/:id` → "Clientes").
 */
export function titleForPath(pathname: string): string {
  const exact = NAV_ITEMS.find((i) => i.to === pathname);
  if (exact) return exact.label;

  const prefix = NAV_ITEMS
    .filter((i) => i.to !== '/' && pathname.startsWith(i.to + '/'))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return prefix?.label ?? 'PROST Manager';
}
