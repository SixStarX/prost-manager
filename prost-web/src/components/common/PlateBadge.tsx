import { cn } from '@/lib/utils';

/** Placa de veículo com aparência de etiqueta (mono, tracking largo). */
export function PlateBadge({ plate, className }: { plate?: string | null; className?: string }) {
  if (!plate) return <span className="text-t3">—</span>;
  return (
    <span
      className={cn(
        'inline-flex items-center bg-overlay text-t1 font-mono text-[11px] font-bold',
        'px-2 py-0.5 rounded-xs tracking-[.1em] uppercase border border-white/[.12]',
        className,
      )}
    >
      {plate}
    </span>
  );
}
