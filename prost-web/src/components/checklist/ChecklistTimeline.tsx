import { ChevronRight, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';
import {
  checklistStatusLabel,
  checklistStatusVariant,
  formatTime,
  type ChecklistListItem,
} from '@/lib/checklist';
import { cn } from '@/lib/utils';

/**
 * Timeline do histórico de checklists de um veículo (mais recente no topo).
 * Cada item é clicável e abre o detalhe.
 */
export function ChecklistTimeline({
  items,
  selectedId,
  onSelect,
}: {
  items: ChecklistListItem[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <ol className="relative flex flex-col gap-2 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-white/[.08]">
      {items.map((c) => {
        const active = c.id === selectedId;
        return (
          <li key={c.id} className="relative pl-7">
            <span
              className={cn(
                'absolute left-0 top-3 w-3.5 h-3.5 rounded-full border-2 bg-surface',
                active ? 'border-brand' : 'border-white/20',
              )}
            />
            <button
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                'group w-full text-left rounded-sm border px-3.5 py-3 transition-all duration-150',
                active
                  ? 'bg-overlay border-brand/40'
                  : 'bg-raised border-white/[.06] hover:bg-overlay hover:border-white/[.12]',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[12.5px] font-semibold text-t1">
                  {formatDate(c.createdAt)}
                  <span className="text-t3 font-normal">{formatTime(c.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant={checklistStatusVariant(c.status)}>
                    {checklistStatusLabel(c.status)}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-t4 group-hover:text-t2" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[11.5px] text-t3">
                <span className="inline-flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {c.responsible || 'Sem responsável'}
                </span>
                {c.observations && (
                  <span className="truncate max-w-[280px]">{c.observations}</span>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
