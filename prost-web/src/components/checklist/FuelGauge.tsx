import { cn } from '@/lib/utils';

const TICKS = [
  { at: 0, label: 'E' },
  { at: 25, label: '1/4' },
  { at: 50, label: '1/2' },
  { at: 75, label: '3/4' },
  { at: 100, label: 'F' },
];

/**
 * Medidor de combustível (read-only). Track com gradiente vermelho→verde e um
 * marcador na posição do nível (0..100). Espelha o visual dos prints.
 */
export function FuelGauge({ level }: { level: number | null }) {
  const pct = level == null ? null : Math.max(0, Math.min(100, level));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-[.08em] text-t4">
          Nível do Tanque
        </span>
        <span className="text-[13px] font-bold text-t1">
          {pct == null ? <span className="text-t3">—</span> : `${pct}%`}
        </span>
      </div>

      <div className="relative h-3 rounded-full overflow-hidden border border-white/[.1]"
        style={{
          background:
            'linear-gradient(90deg,#ef4444 0%,#f59e0b 30%,#eab308 50%,#84cc16 70%,#10b981 100%)',
        }}
      >
        {/* Área não preenchida escurece o restante do track. */}
        {pct != null && pct < 100 && (
          <div
            className="absolute inset-y-0 right-0 bg-base/80"
            style={{ width: `${100 - pct}%` }}
          />
        )}
        {/* Marcador do nível. */}
        {pct != null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-5 rounded-full bg-white shadow-[0_0_6px_rgba(0,0,0,.7)]"
            style={{ left: `${pct}%` }}
          />
        )}
      </div>

      <div className="flex justify-between mt-1.5">
        {TICKS.map((t) => (
          <span
            key={t.at}
            className={cn(
              'text-[10px] font-semibold',
              pct != null && Math.abs(pct - t.at) <= 12 ? 'text-t1' : 'text-t4',
            )}
          >
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}
