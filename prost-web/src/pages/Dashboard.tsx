import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Car,
  Stethoscope,
  ClipboardList,
  ClipboardCheck,
  Wrench,
  PackageOpen,
  CheckCircle2,
  Truck,
  CalendarClock,
  ArrowRight,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { clientProfilePath } from '@/lib/nav';
import api from '../api';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardTitleIcon, CardCount } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton, SkeletonRows } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PlateBadge } from '@/components/common/PlateBadge';
import { statusLabel, statusVariant } from '@/lib/status';
import { formatDate } from '@/lib/format';
import { VehicleTimelineTable } from '@/components/dashboard/VehicleTimelineTable';
import { DeliveryBoard } from '@/components/dashboard/DeliveryBoard';
import { checklistStatusLabel, checklistStatusVariant, type ChecklistSummary } from '@/lib/checklist';
import type { TimelineItem } from '@/lib/timeline';

/** Intervalo de atualização automática da tabela temporal (ms). */
const REFRESH_MS = 30_000;

interface StatCard {
  label: string;
  value: number;
  icon: LucideIcon;
  tint: string;
  glow: string;
  sub: string;
  /** Rota aberta ao clicar (indicadores gerais). */
  to?: string;
  /** Status filtrado ao clicar (indicadores de checklist). */
  status?: string;
}

const buildStats = (data: any): StatCard[] => [
  { label: 'Clientes',          value: data.totals.clients,      icon: Users,         tint: 'bg-sky',     glow: 'rgba(59,130,246,.3)',  sub: 'cadastrados', to: '/clients'        },
  { label: 'Veículos',          value: data.totals.vehicles,     icon: Car,           tint: 'bg-ok',      glow: 'rgba(16,185,129,.3)',  sub: 'na frota',    to: '/vehicles'       },
  { label: 'Diagnósticos',      value: data.totals.diagnostics,  icon: Stethoscope,   tint: 'bg-caution', glow: 'rgba(245,158,11,.3)',  sub: 'registrados', to: '/diagnostics'    },
  { label: 'Ordens de Serviço', value: data.totals.serviceOrders,icon: ClipboardList, tint: 'bg-grape',   glow: 'rgba(168,85,247,.3)',  sub: 'no sistema',  to: '/service-orders' },
];

/** Indicadores de checklist (Em Atendimento / Aguardando / Prontos / Entregues). */
const buildChecklistStats = (data: any): StatCard[] => {
  const by: Record<string, number> = {};
  for (const c of data.checklistsByStatus ?? []) by[c.status] = c.count;
  return [
    { label: 'Em Atendimento',      value: by.IN_SERVICE ?? 0,    icon: Wrench,       tint: 'bg-sky',     glow: 'rgba(59,130,246,.3)', sub: 'em serviço',          status: 'IN_SERVICE'    },
    { label: 'Aguardando Peças',    value: by.WAITING_PARTS ?? 0, icon: PackageOpen,  tint: 'bg-caution', glow: 'rgba(245,158,11,.3)', sub: 'pendentes',           status: 'WAITING_PARTS' },
    { label: 'Prontos p/ Entrega',  value: by.READY ?? 0,         icon: CheckCircle2, tint: 'bg-ok',      glow: 'rgba(16,185,129,.3)', sub: 'aguardando retirada', status: 'READY'         },
    { label: 'Entregues',           value: by.DELIVERED ?? 0,     icon: Truck,        tint: 'bg-grape',   glow: 'rgba(168,85,247,.3)', sub: 'finalizados',         status: 'DELIVERED'     },
  ];
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  /** Status selecionado nos indicadores de check-list; filtra a lista abaixo. */
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const activeRef = useRef(true);
  const hasDataRef = useRef(false);

  // Abre um checklist no Perfil do Cliente (inline, sem página dedicada).
  const openChecklist = useCallback(
    (c: ChecklistSummary) => {
      if (!c.clientId) return;
      navigate(clientProfilePath(c.clientId, { vehicleId: c.vehicleId, checklistId: c.id }));
    },
    [navigate],
  );

  // Busca o resumo do dashboard. Silenciosa nos refetches (não pisca a tela).
  const load = useCallback(async () => {
    try {
      const r = await api.get('/dashboard');
      if (!activeRef.current) return;
      hasDataRef.current = true;
      setData(r.data);
      setError(false);
    } catch {
      // Só exibe erro se nunca carregou; evita apagar dados já visíveis.
      if (activeRef.current && !hasDataRef.current) setError(true);
    }
  }, []);

  // Carrega ao montar + polling periódico + refetch ao focar a aba,
  // mantendo a tabela atualizada sem recarregar a página manualmente.
  useEffect(() => {
    activeRef.current = true;
    load();

    const timer = window.setInterval(load, REFRESH_MS);
    const onFocus = () => {
      if (document.visibilityState === 'visible') load();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      activeRef.current = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [load]);

  if (error) {
    return (
      <Card>
        <div className="py-16">
          <EmptyState text="Não foi possível carregar o dashboard" sub="Verifique sua conexão e tente novamente." />
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[14px] mb-[22px]">
        {data
          ? buildStats(data).map((s) => (
              <StatCardView key={s.label} {...s} onClick={() => navigate(s.to!)} />
            ))
          : Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface border border-white/[.08] rounded-md px-5 py-[18px]">
                <Skeleton className="h-3 w-20 mb-4" />
                <Skeleton className="h-7 w-12 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
      </div>

      {/* ── Check-list — indicadores + entregas da semana + ativos ── */}
      <div className="mb-[22px] flex items-center gap-2">
        <ClipboardCheck className="h-4 w-4 text-brand" />
        <h2 className="text-[13px] font-bold uppercase tracking-[.08em] text-t2">Check-list</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[14px] mb-[22px]">
        {data
          ? buildChecklistStats(data).map((s) => (
              <StatCardView
                key={s.label}
                {...s}
                active={statusFilter === s.status}
                onClick={() =>
                  setStatusFilter((prev) => (prev === s.status ? null : s.status!))
                }
              />
            ))
          : Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface border border-white/[.08] rounded-md px-5 py-[18px]">
                <Skeleton className="h-3 w-20 mb-4" />
                <Skeleton className="h-7 w-12 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
      </div>

      <div className="mb-[22px]">
        <DeliveryBoard
          items={(data?.activeChecklists as ChecklistSummary[] | undefined) ?? null}
          onOpen={openChecklist}
        />
      </div>

      <ActiveChecklists
        items={(data?.activeChecklists as ChecklistSummary[] | undefined) ?? null}
        onOpen={openChecklist}
        statusFilter={statusFilter}
        onClearFilter={() => setStatusFilter(null)}
      />

      {/* Tabela Temporal de Veículos — área de destaque */}
      <VehicleTimelineTable items={(data?.timeline as TimelineItem[] | undefined) ?? null} />

      {/* Recent service orders */}
      <Card>
        <CardHeader>
          <CardTitle>
            <CardTitleIcon icon={ClipboardList} />
            Ordens de Serviço Recentes
          </CardTitle>
          {data && <CardCount>{data.recentServiceOrders.length} registros</CardCount>}
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Veículo</TableHead>
              <TableHead>Proprietário</TableHead>
              <TableHead>Diagnóstico</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data ? (
              <SkeletonRows rows={5} cols={5} />
            ) : data.recentServiceOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-14">
                  <EmptyState
                    icon={ClipboardList}
                    text="Nenhuma ordem de serviço ainda"
                    sub="Crie diagnósticos e gere OS para vê-las aqui"
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.recentServiceOrders.map((os: any) => (
                <TableRow
                  key={os.id}
                  onClick={() =>
                    os.diagnostic?.vehicle?.client?.id &&
                    navigate(
                      clientProfilePath(os.diagnostic.vehicle.client.id, {
                        vehicleId: os.diagnostic.vehicle.id,
                      }),
                    )
                  }
                  className={os.diagnostic?.vehicle?.client?.id ? 'cursor-pointer' : undefined}
                >
                  <TableCell>
                    <PlateBadge plate={os.diagnostic.vehicle.plate} />
                    <span className="ml-2 text-t2">
                      {os.diagnostic.vehicle.brand} {os.diagnostic.vehicle.model}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-t1">{os.diagnostic.vehicle.client.name}</TableCell>
                  <TableCell className="max-w-[260px] truncate">{os.diagnostic.description}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(os.status)}>{statusLabel(os.status)}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[11.5px] text-t3 tracking-[.03em]">
                    {formatDate(os.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

/**
 * Indicador. Quando recebe `onClick` vira atalho — mesma moldura, apenas
 * cursor e realce de seleção mudam, para não alterar a métrica do card.
 */
function StatCardView({
  label,
  value,
  icon: Icon,
  tint,
  glow,
  sub,
  onClick,
  active,
}: StatCard & { onClick?: () => void; active?: boolean }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      aria-pressed={onClick && active !== undefined ? active : undefined}
      className={cn(
        'bg-surface border rounded-md px-5 py-[18px] relative overflow-hidden w-full text-left transition-all duration-300 hover:border-white/[.12] hover:shadow-[0_4px_16px_rgba(0,0,0,.6)] hover:-translate-y-px',
        onClick ? 'cursor-pointer' : 'cursor-default',
        active ? 'border-primary/60 ring-2 ring-primary/20' : 'border-white/[.08]',
      )}
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)' }}
    >
      <div className={`absolute top-0 left-0 right-0 h-[2px] rounded-t-md ${tint}`} style={{ boxShadow: `0 0 12px ${glow}` }} />
      <div className={`absolute right-[-20px] top-[-20px] w-20 h-20 rounded-full opacity-[.04] ${tint}`} />
      <div className="flex items-center justify-between mb-[14px]">
        <span className="text-[11px] font-semibold text-t3 uppercase tracking-[.08em]">{label}</span>
        <span className="w-8 h-8 rounded-sm flex items-center justify-center bg-raised border border-white/[.08]">
          <Icon className="w-4 h-4 text-t2" strokeWidth={2} />
        </span>
      </div>
      <div className="text-[30px] font-black tracking-[-0.8px] text-t1 leading-none">{value}</div>
      <div className="text-[11px] text-t3 mt-[5px]">{sub}</div>
    </Comp>
  );
}

/** Lista compacta de checklists ativos ("Veículos em Serviço") — abre no perfil. */
function ActiveChecklists({
  items,
  onOpen,
  statusFilter,
  onClearFilter,
}: {
  items: ChecklistSummary[] | null;
  onOpen: (c: ChecklistSummary) => void;
  statusFilter?: string | null;
  onClearFilter?: () => void;
}) {
  const shown = statusFilter ? (items ?? []).filter((c) => c.status === statusFilter) : items;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <CardTitleIcon icon={ClipboardCheck} />
          Veículos em Serviço
        </CardTitle>
        <div className="flex items-center gap-2">
          {statusFilter && (
            <button
              type="button"
              onClick={onClearFilter}
              className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80"
            >
              {checklistStatusLabel(statusFilter)}
              <X className="h-3 w-3" />
            </button>
          )}
          {shown && <CardCount>{shown.length} ativos</CardCount>}
        </div>
      </CardHeader>
      <div className="flex flex-col gap-2.5 p-5">
        {!shown ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[74px]" />)
        ) : shown.length === 0 ? (
          <div className="py-10">
            <EmptyState
              icon={ClipboardCheck}
              text={
                statusFilter
                  ? `Nenhum veículo em "${checklistStatusLabel(statusFilter)}"`
                  : 'Nenhum veículo em serviço'
              }
              sub={
                statusFilter
                  ? 'Clique no indicador novamente para limpar o filtro.'
                  : 'Crie um check-list no perfil de um cliente para começar.'
              }
            />
          </div>
        ) : (
          shown.map((c) => {
            const clickable = !!c.clientId;
            return (
              <button
                key={c.id}
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onOpen(c)}
                className={
                  'group flex items-center justify-between gap-3 rounded-md border border-white/[.06] bg-raised px-4 py-3 text-left transition-all duration-150 ' +
                  (clickable ? 'hover:border-white/[.14] hover:bg-overlay' : 'cursor-default opacity-90')
                }
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12px] font-semibold tracking-[.03em] text-t2">
                      {c.protocol ?? '—'}
                    </span>
                    <Badge variant={checklistStatusVariant(c.status)}>
                      {checklistStatusLabel(c.status)}
                    </Badge>
                  </div>
                  <div className="mt-1.5 text-[14px] font-bold text-t1">{c.clientName || '—'}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-t3">
                    <span>{[c.vBrand, c.vModel].filter(Boolean).join(' ') || 'Veículo'}</span>
                    {c.vPlate && <PlateBadge plate={c.vPlate} />}
                    {c.expectedDate && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5" /> Previsão: {formatDate(c.expectedDate)}
                      </span>
                    )}
                  </div>
                </div>
                {clickable && (
                  <ArrowRight className="h-5 w-5 shrink-0 text-t4 transition-colors group-hover:text-t2" />
                )}
              </button>
            );
          })
        )}
      </div>
    </Card>
  );
}
