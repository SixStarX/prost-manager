import { Badge } from '@/components/ui/badge';

/** Badge de status de uma coleta/sincronização (DONE | FAILED). */
export function SyncStatusBadge({ status }: { status: string }) {
  const map: Record<string, 'done' | 'destructive'> = {
    DONE: 'done',
    FAILED: 'destructive',
  };
  return (
    <Badge variant={map[status] ?? 'default'}>
      {status === 'DONE' ? 'Concluído' : 'Falhou'}
    </Badge>
  );
}

/** Badge de status de um evento de webhook. */
export function WebhookStatusBadge({ status }: { status: string }) {
  const map: Record<string, 'done' | 'pending' | 'in-progress' | 'destructive'> = {
    PROCESSED: 'done',
    RECEIVED: 'in-progress',
    IGNORED: 'pending',
    FAILED: 'destructive',
  };
  const labels: Record<string, string> = {
    PROCESSED: 'Processado',
    RECEIVED: 'Recebido',
    IGNORED: 'Ignorado',
    FAILED: 'Falhou',
  };
  return <Badge variant={map[status] ?? 'default'}>{labels[status] ?? status}</Badge>;
}

/** Número + rótulo empilhados (usado nos painéis de resultado). */
export function Stat({
  label,
  value,
  color = 'text-t1',
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-xl font-black tabular-nums ${color}`}>{value}</span>
      <span className="text-[10px] font-medium text-t4 uppercase tracking-wider">{label}</span>
    </div>
  );
}

/** Spinner de carregamento (SVG inline). */
export function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-brand"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
