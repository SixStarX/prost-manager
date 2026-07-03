import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  CarFront,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardTitleIcon, CardCount } from '@/components/ui/card';
import { TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PlateBadge } from '@/components/common/PlateBadge';
import { statusLabel, statusVariant } from '@/lib/status';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  deriveRow,
  matchesFilter,
  matchesSearch,
  smartCompare,
  urgencyLabel,
  shopTimeLabel,
  type DerivedRow,
  type TimelineItem,
  type TimelineFilter,
  type Urgency,
} from '@/lib/timeline';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

/** Metadados visuais de cada situação temporal. */
const URGENCY_META: Record<Urgency, { icon: LucideIcon; badge: BadgeVariant; rowClass: string }> = {
  overdue: { icon: AlertTriangle, badge: 'overdue', rowClass: 'bg-destructive/[.06]' },
  today: { icon: BellRing, badge: 'duetoday', rowClass: 'bg-caution/[.07]' },
  soon: { icon: CalendarClock, badge: 'soon', rowClass: 'bg-sky/[.06]' },
  upcoming: { icon: CalendarClock, badge: 'soon', rowClass: 'bg-sky/[.035]' },
  fresh: { icon: Sparkles, badge: 'fresh', rowClass: 'bg-ok/[.05]' },
  done: { icon: CheckCircle2, badge: 'done', rowClass: '' },
};

const FILTERS: { key: TimelineFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Em andamento' },
  { key: 'today', label: 'Sai hoje' },
  { key: 'next7', label: 'Próximos 7 dias' },
  { key: 'overdue', label: 'Atrasados' },
  { key: 'done', label: 'Finalizados' },
];

type SortKey = 'client' | 'vehicle' | 'plate' | 'entry' | 'delivery' | 'shop' | 'remaining' | 'status';

const deliveryTime = (r: DerivedRow) =>
  r.expectedDeliveryDate ? new Date(r.expectedDeliveryDate).getTime() : Number.POSITIVE_INFINITY;
const remainingVal = (r: DerivedRow) => r.daysRemaining ?? Number.POSITIVE_INFINITY;

function compareBy(key: SortKey, a: DerivedRow, b: DerivedRow): number {
  switch (key) {
    case 'client':
      return (a.clientName ?? '').localeCompare(b.clientName ?? '', 'pt-BR');
    case 'vehicle':
      return `${a.brand ?? ''} ${a.model ?? ''}`.localeCompare(`${b.brand ?? ''} ${b.model ?? ''}`, 'pt-BR');
    case 'plate':
      return (a.plate ?? '').localeCompare(b.plate ?? '');
    case 'entry':
      return new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime();
    case 'delivery':
      return deliveryTime(a) - deliveryTime(b);
    case 'shop':
      return a.daysInShop - b.daysInShop;
    case 'remaining':
      return remainingVal(a) - remainingVal(b);
    case 'status':
      return a.status.localeCompare(b.status);
    default:
      return 0;
  }
}

interface Props {
  /** `null` = carregando. */
  items: TimelineItem[] | null;
}

export function VehicleTimelineTable({ items }: Props) {
  const [filter, setFilter] = useState<TimelineFilter>('active');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' } | null>(null);

  // Deriva campos (dias na oficina, dias restantes, situação) uma única vez.
  const rows = useMemo(() => (items ?? []).map((i) => deriveRow(i)), [items]);

  // Contadores por filtro (para os chips e o cabeçalho do card).
  const counts = useMemo(
    () => ({
      all: rows.length,
      active: rows.filter((r) => r.status !== 'DONE').length,
      today: rows.filter((r) => r.urgency === 'today').length,
      next7: rows.filter((r) => r.urgency === 'soon').length,
      overdue: rows.filter((r) => r.urgency === 'overdue').length,
      done: rows.filter((r) => r.status === 'DONE').length,
    }),
    [rows],
  );

  // Filtra → busca → ordena (memoizado; recomputa só quando algo muda).
  const visible = useMemo(() => {
    const list = rows.filter((r) => matchesFilter(r, filter) && matchesSearch(r, query));
    if (sort) {
      const factor = sort.dir === 'asc' ? 1 : -1;
      list.sort((a, b) => compareBy(sort.key, a, b) * factor);
    } else {
      list.sort(smartCompare);
    }
    return list;
  }, [rows, filter, query, sort]);

  const loading = items === null;

  const toggleSort = (key: SortKey) =>
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return null; // terceiro clique volta à ordenação inteligente
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <CardTitleIcon icon={CarFront} />
          Veículos em andamento
        </CardTitle>
        {!loading && <CardCount>{counts.active} na oficina</CardCount>}
      </CardHeader>

      {/* Filtros rápidos + busca */}
      <div className="flex flex-col gap-3 px-5 py-4 border-b border-white/[.06] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <FilterChip
              key={f.key}
              label={f.label}
              count={counts[f.key]}
              active={filter === f.key}
              disabled={loading}
              onClick={() => setFilter(f.key)}
            />
          ))}
        </div>
        <div className="relative sm:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-t3 pointer-events-none" strokeWidth={2} />
          <input
            type="search"
            value={query}
            disabled={loading}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente, placa ou modelo…"
            className={cn(
              'w-full pl-9 pr-3 py-[9px] bg-raised border border-white/[.08] rounded-sm',
              'text-[13px] text-t1 outline-none transition-all duration-150 placeholder:text-t4',
              'hover:border-white/[.12] focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,108,255,.18)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          />
        </div>
      </div>

      {/* ── Tabela (desktop / tablet) ── */}
      <div className="hidden md:block max-h-[560px] overflow-auto">
        <table className="w-full border-collapse caption-bottom text-sm">
          <TableHeader className="sticky top-0 z-10">
            <TableRow>
              <SortHead label="Cliente" col="client" sort={sort} onSort={toggleSort} />
              <SortHead label="Veículo" col="vehicle" sort={sort} onSort={toggleSort} />
              <SortHead label="Placa" col="plate" sort={sort} onSort={toggleSort} />
              <SortHead label="Entrada" col="entry" sort={sort} onSort={toggleSort} />
              <SortHead label="Previsão" col="delivery" sort={sort} onSort={toggleSort} />
              <SortHead label="Na oficina" col="shop" sort={sort} onSort={toggleSort} align="right" />
              <SortHead label="Situação" col="remaining" sort={sort} onSort={toggleSort} />
              <SortHead label="Status" col="status" sort={sort} onSort={toggleSort} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TimelineSkeleton cols={8} />
            ) : visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-14">
                  <TimelineEmpty total={rows.length} onClear={() => { setFilter('all'); setQuery(''); }} />
                </TableCell>
              </TableRow>
            ) : (
              visible.map((r) => {
                const meta = URGENCY_META[r.urgency];
                const Icon = meta.icon;
                return (
                  <TableRow key={r.id} className={meta.rowClass}>
                    <TableCell className="font-semibold text-t1">{r.clientName ?? '—'}</TableCell>
                    <TableCell className="text-t2 whitespace-nowrap">
                      {[r.brand, r.model].filter(Boolean).join(' ') || '—'}
                    </TableCell>
                    <TableCell>
                      <PlateBadge plate={r.plate} />
                    </TableCell>
                    <TableCell className="font-mono text-[11.5px] text-t3 whitespace-nowrap tracking-[.03em]">
                      {formatDate(r.entryDate)}
                    </TableCell>
                    <TableCell className="font-mono text-[11.5px] text-t3 whitespace-nowrap tracking-[.03em]">
                      {formatDate(r.expectedDeliveryDate)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap text-t2 tabular-nums">
                      {shopTimeLabel(r.daysInShop)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={meta.badge} className="before:hidden">
                        <Icon className="w-3 h-3" strokeWidth={2.4} />
                        {urgencyLabel(r)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(r.status)}>{statusLabel(r.status)}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </table>
      </div>

      {/* ── Cartões (celular) ── */}
      <div className="md:hidden divide-y divide-white/[.05]">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4">
              <Skeleton className="h-4 w-40 mb-3" />
              <Skeleton className="h-3 w-28 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))
        ) : visible.length === 0 ? (
          <div className="py-12">
            <TimelineEmpty total={rows.length} onClear={() => { setFilter('all'); setQuery(''); }} />
          </div>
        ) : (
          visible.map((r) => <TimelineCard key={r.id} row={r} />)
        )}
      </div>
    </Card>
  );
}

/* ─────────────────────────── Subcomponentes ─────────────────────────── */

function FilterChip({
  label,
  count,
  active,
  disabled,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[12px] font-semibold',
        'border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
        active
          ? 'bg-brand/[.15] text-[#b3a8ff] border-brand/30'
          : 'bg-raised text-t2 border-white/[.06] hover:bg-overlay hover:text-t1 hover:border-white/[.12]',
      )}
    >
      {label}
      <span
        className={cn(
          'min-w-[18px] px-1 text-center rounded-full text-[10.5px] font-bold tabular-nums',
          active ? 'bg-brand/25 text-[#c9c1ff]' : 'bg-overlay text-t3',
        )}
      >
        {count}
      </span>
    </button>
  );
}

function SortHead({
  label,
  col,
  sort,
  onSort,
  align = 'left',
}: {
  label: string;
  col: SortKey;
  sort: { key: SortKey; dir: 'asc' | 'desc' } | null;
  onSort: (col: SortKey) => void;
  align?: 'left' | 'right';
}) {
  const active = sort?.key === col;
  const Icon = !active ? ChevronsUpDown : sort!.dir === 'asc' ? ChevronUp : ChevronDown;
  return (
    <TableHead className={cn('bg-raised', align === 'right' && 'text-right')}>
      <button
        type="button"
        onClick={() => onSort(col)}
        className={cn(
          'inline-flex items-center gap-1 group transition-colors hover:text-t1',
          active && 'text-t1',
          align === 'right' && 'flex-row-reverse',
        )}
      >
        {label}
        <Icon className={cn('w-3 h-3', active ? 'text-brand' : 'text-t4 group-hover:text-t3')} strokeWidth={2.4} />
      </button>
    </TableHead>
  );
}

function TimelineCard({ row: r }: { row: DerivedRow }) {
  const meta = URGENCY_META[r.urgency];
  const Icon = meta.icon;
  return (
    <div className={cn('p-4', meta.rowClass)}>
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0">
          <div className="font-semibold text-t1 truncate">{r.clientName ?? '—'}</div>
          <div className="text-[12.5px] text-t3 truncate">
            {[r.brand, r.model].filter(Boolean).join(' ') || '—'}
          </div>
        </div>
        <Badge variant={meta.badge} className="shrink-0 before:hidden">
          <Icon className="w-3 h-3" strokeWidth={2.4} />
          {urgencyLabel(r)}
        </Badge>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <PlateBadge plate={r.plate} />
        <Badge variant={statusVariant(r.status)}>{statusLabel(r.status)}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-[12px]">
        <Field label="Entrada" value={formatDate(r.entryDate)} />
        <Field label="Previsão" value={formatDate(r.expectedDeliveryDate)} />
        <Field label="Na oficina" value={shopTimeLabel(r.daysInShop)} />
        <Field
          label="Restantes"
          value={r.daysRemaining === null ? '—' : r.daysRemaining < 0 ? `${Math.abs(r.daysRemaining)}d atrás` : `${r.daysRemaining}d`}
        />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[.08em] text-t4">{label}</div>
      <div className="text-t2 font-mono text-[12px] tracking-[.02em]">{value}</div>
    </div>
  );
}

function TimelineSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-[14px] border-b border-white/[.05]">
              <Skeleton className="h-3.5" style={{ width: `${55 + ((r + c) % 4) * 12}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function TimelineEmpty({ total, onClear }: { total: number; onClear: () => void }) {
  if (total === 0) {
    return (
      <EmptyState
        icon={CarFront}
        text="Nenhum veículo em atendimento"
        sub="Crie ordens de serviço para acompanhar os veículos aqui."
      />
    );
  }
  return (
    <EmptyState
      icon={Search}
      text="Nenhum veículo corresponde aos filtros"
      sub="Ajuste a busca ou os filtros para ver mais resultados."
      action={
        <button
          type="button"
          onClick={onClear}
          className="text-[12.5px] font-semibold text-brand hover:underline underline-offset-4"
        >
          Limpar filtros
        </button>
      }
    />
  );
}
