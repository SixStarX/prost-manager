import { Wrench, SprayCan, Shield, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UNITS, type UnitCode } from '@/lib/checklist';

const ICONS: Record<UnitCode, LucideIcon> = {
  MECANICA: Wrench,
  FUNILARIA: SprayCan,
  BLINDADOS: Shield,
};

/**
 * Seletor de "Unidade de Atendimento" (Mecânica / Funilaria / Blindados).
 * Define o prefixo do protocolo. Reproduz os cards da referência.
 */
export function UnitSelector({
  value,
  onChange,
}: {
  value?: UnitCode | null;
  onChange: (u: UnitCode) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
      {UNITS.map((u) => {
        const Icon = ICONS[u.code];
        const active = value === u.code;
        return (
          <button
            key={u.code}
            type="button"
            onClick={() => onChange(u.code)}
            className={cn(
              'flex items-start gap-3 rounded-md border p-3.5 text-left transition-all duration-150',
              active
                ? 'border-brand/50 bg-brand/[.10]'
                : 'border-white/[.08] bg-raised hover:border-white/20',
            )}
          >
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border',
                active
                  ? 'border-brand/40 bg-brand/[.15] text-[#b3a8ff]'
                  : 'border-white/[.08] bg-overlay text-t2',
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>
            <div>
              <div className={cn('text-[13.5px] font-bold', active ? 'text-t1' : 'text-t1')}>
                {u.label}
              </div>
              <div className="mt-0.5 text-[11.5px] leading-tight text-t3">{u.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
