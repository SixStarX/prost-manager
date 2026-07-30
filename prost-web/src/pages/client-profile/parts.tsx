import { ArrowLeft, History, Plus, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlateBadge } from '@/components/common/PlateBadge';
import { formatDate } from '@/lib/format';
import {
  checklistStatusLabel,
  checklistStatusVariant,
  type VehicleSummary,
} from '@/lib/checklist';
import { cn } from '@/lib/utils';

/** Cabeçalho de página com voltar + título/subtítulo. */
export function PageHeader({
  title,
  subtitle,
  onBack,
  backLabel = 'Voltar',
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <Button variant="secondary" size="icon" onClick={onBack} title={backLabel}>
        <ArrowLeft />
      </Button>
      <div>
        <h1 className="text-[17px] font-bold text-t1 leading-tight">{title}</h1>
        {subtitle && <p className="text-[12px] text-t3 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

/** Indicador compacto (ícone + valor + rótulo) do cabeçalho do perfil. */
export function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 bg-raised border border-white/[.06] rounded-md">
      <span className="w-8 h-8 rounded-sm bg-brand/[.10] border border-brand/30 text-brand flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </span>
      <div>
        <div className="text-[17px] font-bold text-t1 leading-none">{value}</div>
        <div className="text-[11px] text-t3 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

/** Cartão de veículo do perfil — seleciona o histórico ou abre novo checklist. */
export function VehicleCard({
  vehicle: v,
  active,
  onSelect,
  onNew,
}: {
  vehicle: VehicleSummary;
  active: boolean;
  onSelect: () => void;
  onNew: () => void;
}) {
  return (
    <div
      className={cn(
        'rounded-md border p-3.5 transition-all duration-150',
        active ? 'bg-overlay border-brand/40' : 'bg-raised border-white/[.06] hover:border-white/[.14]',
      )}
    >
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13.5px] font-bold text-t1">
            {v.brand} {v.model}
          </span>
          <span className="text-[12px] text-t3">{v.year}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <PlateBadge plate={v.plate} />
          {v.currentStatus && (
            <Badge variant={checklistStatusVariant(v.currentStatus)}>
              {checklistStatusLabel(v.currentStatus)}
            </Badge>
          )}
        </div>
        <div className="mt-2.5 text-[11.5px] text-t3">
          {v.checklistCount} {v.checklistCount === 1 ? 'checklist' : 'checklists'}
          {v.lastChecklistAt && ` · último em ${formatDate(v.lastChecklistAt)}`}
        </div>
      </button>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={onSelect}>
          <History /> Histórico
        </Button>
        <Button size="sm" onClick={onNew}>
          <Plus /> Novo
        </Button>
      </div>
    </div>
  );
}
