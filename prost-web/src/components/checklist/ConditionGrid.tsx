import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Condition, ConditionMap } from '@/lib/checklist';

/**
 * Grade editável de itens vistoriados com toggle de 2 estados (✓ OK / ✗ Avaria),
 * como na referência. Mapeia para o `ConditionMap` (`OK` | `DAMAGED`); clicar no
 * estado ativo o remove (não verificado).
 */
export function ConditionGrid({
  items,
  values,
  onChange,
}: {
  items: readonly string[];
  values: ConditionMap;
  onChange: (next: ConditionMap) => void;
}) {
  const set = (item: string, cond: Condition | undefined) => {
    const next = { ...values };
    if (cond) next[item] = cond;
    else delete next[item];
    onChange(next);
  };

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2">
      {items.map((item) => {
        const cur = values[item];
        return (
          <div
            key={item}
            className="flex items-center justify-between gap-2 rounded-sm border border-white/[.06] bg-raised px-3 py-2"
          >
            <span className="text-[12.5px] font-medium text-t1">{item}</span>
            <div className="flex items-center gap-1.5">
              <IconToggle
                active={cur === 'OK'}
                tone="ok"
                onClick={() => set(item, cur === 'OK' ? undefined : 'OK')}
              >
                <Check className="h-4 w-4" />
              </IconToggle>
              <IconToggle
                active={cur === 'DAMAGED'}
                tone="bad"
                onClick={() => set(item, cur === 'DAMAGED' ? undefined : 'DAMAGED')}
              >
                <X className="h-4 w-4" />
              </IconToggle>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IconToggle({
  active,
  tone,
  onClick,
  children,
}: {
  active: boolean;
  tone: 'ok' | 'bad';
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-150',
        active && tone === 'ok' && 'border-ok/50 bg-ok/[.15] text-[#34d399]',
        active && tone === 'bad' && 'border-destructive/50 bg-destructive/[.15] text-[#f87171]',
        !active && 'border-white/[.08] bg-overlay text-t4 hover:text-t2 hover:border-white/20',
      )}
    >
      {children}
    </button>
  );
}
