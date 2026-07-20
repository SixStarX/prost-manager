import { DAMAGE_TYPES, damageColor, type DamageMark } from '@/lib/checklist';
import { CarDiagram } from './CarDiagram';
import { EmptyState } from '@/components/ui/empty-state';
import { AlertTriangle } from 'lucide-react';

/**
 * Visualização read-only do Mapeamento de Avarias: diagrama do veículo com os
 * marcadores posicionados + contadores por tipo. Usado no detalhe do checklist.
 */
export function DamageView({ marks }: { marks: DamageMark[] | null | undefined }) {
  const list = marks ?? [];
  if (list.length === 0) {
    return <EmptyState icon={AlertTriangle} text="Sem avarias registradas" />;
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full max-w-[460px] self-center rounded-md border border-white/[.08] bg-raised p-4">
        <div className="relative aspect-[2/1] text-t4">
          <CarDiagram />
          {list.map((m, i) => (
            <span
              key={i}
              className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 shadow-[0_0_6px_rgba(0,0,0,.6)]"
              style={{
                left: `${m.x * 100}%`,
                top: `${m.y * 100}%`,
                background: damageColor(m.type),
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {DAMAGE_TYPES.map((d) => (
          <span key={d.type} className="flex items-center gap-1.5 text-[12px] text-t2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            {d.label}:{' '}
            <span className="font-bold text-t1">{list.filter((m) => m.type === d.type).length}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
