import { cn } from '@/lib/utils';
import {
  DAMAGE_TYPES,
  damageColor,
  type DamageMark,
  type DamageType,
} from '@/lib/checklist';
import { CarDiagram } from './CarDiagram';

/**
 * Mapeamento de Avarias: clique no diagrama para adicionar um marcador do tipo
 * selecionado (Risco / Amassado / Quebra); clique num marcador para removê-lo.
 * Coordenadas normalizadas (0..1) para escalar em qualquer tamanho / impressão.
 */
export function DamageMap({
  marks,
  onChange,
  activeType,
  onActiveType,
}: {
  marks: DamageMark[];
  onChange: (next: DamageMark[]) => void;
  activeType: DamageType;
  onActiveType: (t: DamageType) => void;
}) {
  const addMark = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onChange([...marks, { x, y, type: activeType }]);
  };

  const removeMark = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(marks.filter((_, i) => i !== idx));
  };

  const countOf = (t: DamageType) => marks.filter((m) => m.type === t).length;

  return (
    <div className="flex flex-col gap-3">
      {/* Seletor de tipo de avaria. */}
      <div className="flex flex-wrap gap-2">
        {DAMAGE_TYPES.map((d) => {
          const active = activeType === d.type;
          return (
            <button
              key={d.type}
              type="button"
              onClick={() => onActiveType(d.type)}
              className={cn(
                'flex items-center gap-2 rounded-sm border px-3 py-1.5 text-[12px] font-semibold transition-all duration-150',
                active
                  ? 'border-white/25 bg-overlay text-t1'
                  : 'border-white/[.08] bg-raised text-t3 hover:text-t1 hover:border-white/20',
              )}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Diagrama clicável. */}
      <div
        onClick={addMark}
        className="relative w-full max-w-[460px] cursor-crosshair select-none self-center rounded-md border border-white/[.08] bg-raised p-4"
      >
        <div className="relative aspect-[2/1] text-t4">
          <CarDiagram />
          {marks.map((m, i) => (
            <button
              key={i}
              type="button"
              title={`${DAMAGE_TYPES.find((d) => d.type === m.type)?.label} — remover`}
              onClick={(e) => removeMark(i, e)}
              className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 shadow-[0_0_6px_rgba(0,0,0,.6)] transition-transform hover:scale-125"
              style={{
                left: `${m.x * 100}%`,
                top: `${m.y * 100}%`,
                background: damageColor(m.type),
              }}
            />
          ))}
        </div>
      </div>

      {/* Ajuda + contadores. */}
      <div className="text-center text-[11.5px] text-t3">
        Toque na imagem para marcar avarias. Total: {marks.length} marcação(ões)
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {DAMAGE_TYPES.map((d) => (
          <span key={d.type} className="flex items-center gap-1.5 text-[12px] text-t2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            {d.label}: <span className="font-bold text-t1">{countOf(d.type)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
