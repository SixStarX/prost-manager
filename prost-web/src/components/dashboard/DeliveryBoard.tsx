import { useMemo, useState } from 'react';
import {
  Calendar,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Package,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UNITS, type ChecklistSummary } from '@/lib/checklist';

/* ── Helpers de data ──────────────────────────────────────────────────── */
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
/** Segunda-feira da semana de `d`. */
function mondayOf(d: Date) {
  const x = startOfDay(d);
  const dow = (x.getDay() + 6) % 7; // 0 = segunda
  x.setDate(x.getDate() - dow);
  return x;
}
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const WEEKDAYS = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const dm = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });
/** "20 jul" — dia + mês abreviado. */
const dMon = (d: Date) => `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}`;

/** Tratamento visual por status — cores sólidas do Tailwind, como no original. */
const STATUS_STYLE: Record<string, { card: string; icon: string; Icon: LucideIcon }> = {
  IN_SERVICE:    { card: 'bg-blue-500/10 border-blue-500/30',     icon: 'text-blue-400',   Icon: Clock },
  WAITING_PARTS: { card: 'bg-yellow-500/10 border-yellow-500/30', icon: 'text-yellow-400', Icon: Package },
  READY:         { card: 'bg-green-500/10 border-green-500/30',   icon: 'text-green-400',  Icon: CheckCircle2 },
};

/**
 * Dashboard de Entregas — réplica do app antigo: indicadores da semana,
 * navegação de semana com filtro de unidade, quadro Seg–Sex e legenda.
 * `null` em `items` representa carregamento.
 */
export function DeliveryBoard({
  items,
  onOpen,
}: {
  items: ChecklistSummary[] | null;
  onOpen?: (item: ChecklistSummary) => void;
}) {
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [unit, setUnit] = useState('');

  const days = useMemo(() => Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const weekEnd = days[4];
  const today = startOfDay(new Date());

  const inWeek = useMemo(() => {
    const list = (items ?? []).filter((c) => (unit ? c.unit === unit : true));
    return list.filter((c) => {
      if (!c.expectedDate) return false;
      const d = startOfDay(new Date(c.expectedDate));
      return d >= weekStart && d <= weekEnd;
    });
  }, [items, unit, weekStart, weekEnd]);

  const count = (s: string) => inWeek.filter((c) => c.status === s).length;

  const forDay = (day: Date) =>
    inWeek.filter((c) => c.expectedDate && sameDay(new Date(c.expectedDate), day));

  return (
    <>
      {/* ── Indicadores ─────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile icon={Calendar}     tint="primary" value={inWeek.length}          label="Esta semana" />
        <StatTile icon={Clock}        tint="blue"    value={count('IN_SERVICE')}    label="Em serviço"  />
        <StatTile icon={AlertCircle}  tint="yellow"  value={count('WAITING_PARTS')} label="Aguardando"  />
        <StatTile icon={CheckCircle2} tint="green"   value={count('READY')}         label="Prontos"     />
      </div>

      {/* ── Navegação de semana + filtro ────────────────────────────────── */}
      <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="rounded-lg p-2 transition-colors hover:bg-secondary"
            aria-label="Semana anterior"
          >
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="min-w-[180px] text-center">
            <p className="font-semibold text-foreground">
              {dMon(weekStart)} - {dMon(weekEnd)} {weekEnd.getFullYear()}
            </p>
            <button
              type="button"
              onClick={() => setWeekStart(mondayOf(new Date()))}
              className="text-sm text-primary hover:underline"
            >
              Ir para esta semana
            </button>
          </div>
          <button
            type="button"
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="rounded-lg p-2 transition-colors hover:bg-secondary"
            aria-label="Próxima semana"
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="sel flex h-10 w-[180px] items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">Todas as Unidades</option>
            {UNITS.map((u) => (
              <option key={u.code} value={u.code}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Quadro semanal ──────────────────────────────────────────────── */}
      <div className="print-area">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {days.map((day, i) => {
            const dayItems = forDay(day);
            const isToday = sameDay(day, today);
            return (
              <div
                key={i}
                className={cn(
                  'overflow-hidden rounded-xl border bg-card',
                  isToday ? 'border-primary ring-2 ring-primary/20' : 'border-border',
                )}
              >
                <div className={cn('px-3 py-2', isToday ? 'bg-primary/10' : 'bg-secondary/50')}>
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    {WEEKDAYS[i]}
                  </p>
                  <p
                    className={cn(
                      'text-lg font-bold',
                      isToday ? 'text-primary' : 'text-foreground',
                    )}
                  >
                    {dm.format(day)}
                  </p>
                </div>

                <div className="min-h-[120px] space-y-2 p-2">
                  {items === null ? (
                    <div className="skeleton h-16 rounded-lg" />
                  ) : dayItems.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      Nenhuma entrega
                    </p>
                  ) : (
                    dayItems.map((c) => {
                      const st = STATUS_STYLE[c.status];
                      const Icon = st?.Icon ?? Clock;
                      const clickable = !!(onOpen && c.clientId);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          disabled={!clickable}
                          onClick={() => clickable && onOpen!(c)}
                          className={cn(
                            'w-full rounded-lg border p-2 text-left transition-transform',
                            st?.card ?? 'border-border bg-secondary/50',
                            clickable ? 'hover:scale-[1.02]' : 'cursor-default',
                          )}
                        >
                          <div className="mb-1 flex items-center gap-1.5">
                            <span className={st?.icon ?? 'text-muted-foreground'}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="truncate font-mono text-xs text-muted-foreground">
                              {c.protocol?.replace(/^CL-[A-Z]+-/, '') ?? '—'}
                            </span>
                          </div>
                          <p className="truncate text-sm font-medium text-foreground">
                            {c.clientName || '—'}
                          </p>
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Car className="h-3 w-3" />
                            <span className="truncate">{c.vBrand || '—'}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Legenda ─────────────────────────────────────────────────────── */}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Legend color="bg-blue-500" label="Em Serviço" />
        <Legend color="bg-yellow-500" label="Aguardando Peças" />
        <Legend color="bg-green-500" label="Pronto p/ Entrega" />
      </div>
    </>
  );
}

/* Classes estáticas — o scanner do Tailwind não resolve nomes construídos. */
const TILE_TINT: Record<string, { box: string; icon: string }> = {
  primary: { box: 'bg-primary/10',      icon: 'text-primary'      },
  blue:    { box: 'bg-blue-500/10',     icon: 'text-blue-400'     },
  yellow:  { box: 'bg-yellow-500/10',   icon: 'text-yellow-400'   },
  green:   { box: 'bg-green-500/10',    icon: 'text-green-400'    },
};

/** Indicador do topo — ícone em caixa translúcida + valor + rótulo. */
function StatTile({
  icon: Icon,
  tint,
  value,
  label,
}: {
  icon: LucideIcon;
  tint: keyof typeof TILE_TINT;
  value: number;
  label: string;
}) {
  const t = TILE_TINT[tint];
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', t.box)}>
          <Icon className={cn('h-5 w-5', t.icon)} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className={cn('h-3 w-3 rounded-full', color)} />
      {label}
    </span>
  );
}
