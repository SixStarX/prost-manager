import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { FUEL_TYPES } from '@/lib/checklist';

const TICKS = [
  { at: 0, label: 'E' },
  { at: 25, label: '1/4' },
  { at: 50, label: '1/2' },
  { at: 75, label: '3/4' },
  { at: 100, label: 'F' },
];

/**
 * Combustível (editável): botões de tipo + medidor de nível clicável/arrastável.
 * Track com gradiente vermelho→verde; a área não preenchida escurece. Reproduz a
 * referência mantendo o visual do `FuelGauge` read-only.
 */
export function FuelGaugeInput({
  fuelType,
  onFuelType,
  level,
  onLevel,
}: {
  fuelType: string;
  onFuelType: (t: string) => void;
  level: number;
  onLevel: (n: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pct = Math.max(0, Math.min(100, level));

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    const stepped = Math.round(raw / 5) * 5; // passos de 5%
    onLevel(Math.max(0, Math.min(100, stepped)));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons === 1) setFromClientX(e.clientX);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tipo de combustível — botões segmentados. */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FUEL_TYPES.map((t) => {
          const active = fuelType === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onFuelType(t)}
              className={cn(
                'rounded-sm border py-2 text-[12.5px] font-semibold transition-all duration-150',
                active
                  ? 'border-white/25 bg-overlay text-t1'
                  : 'border-white/[.08] bg-raised text-t3 hover:text-t1 hover:border-white/20',
              )}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Nível do tanque. */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[.08em] text-t4">
            Nível do Tanque
          </span>
          <span className="text-[13px] font-bold text-t1">{pct}%</span>
        </div>

        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          role="slider"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') onLevel(Math.max(0, pct - 5));
            if (e.key === 'ArrowRight') onLevel(Math.min(100, pct + 5));
          }}
          className="relative h-4 cursor-pointer touch-none rounded-full border border-white/[.1] outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          style={{
            background:
              'linear-gradient(90deg,#ef4444 0%,#f59e0b 30%,#eab308 50%,#84cc16 70%,#10b981 100%)',
          }}
        >
          {pct < 100 && (
            <div
              className="absolute inset-y-0 right-0 rounded-r-full bg-base/80"
              style={{ width: `${100 - pct}%` }}
            />
          )}
          <div
            className="absolute top-1/2 h-6 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_6px_rgba(0,0,0,.7)]"
            style={{ left: `${pct}%` }}
          />
        </div>

        <div className="mt-1.5 flex justify-between">
          {TICKS.map((t) => (
            <span
              key={t.at}
              className={cn(
                'text-[10px] font-semibold',
                Math.abs(pct - t.at) <= 12 ? 'text-t1' : 'text-t4',
              )}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
