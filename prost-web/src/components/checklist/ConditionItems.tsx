import { Badge } from '@/components/ui/badge';
import {
  CONDITION_LABEL,
  CONDITION_VARIANT,
  type ConditionMap,
} from '@/lib/checklist';

/**
 * Grade read-only de itens vistoriados → condição. Itens sem registro aparecem
 * como "Não verificado". `items` define a ordem e o conjunto exibido.
 */
export function ConditionItems({
  items,
  values,
}: {
  items: readonly string[];
  values: ConditionMap | null | undefined;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
      {items.map((item) => {
        const cond = values?.[item];
        return (
          <div
            key={item}
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-sm bg-raised border border-white/[.06]"
          >
            <span className="text-[12.5px] font-medium text-t1">{item}</span>
            {cond ? (
              <Badge variant={CONDITION_VARIANT[cond]}>
                {CONDITION_LABEL[cond]}
              </Badge>
            ) : (
              <span className="text-[11px] text-t4 font-medium">Não verif.</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
