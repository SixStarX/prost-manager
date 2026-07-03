/**
 * Lógica pura da Tabela Temporal de Veículos.
 *
 * Mantida separada de qualquer componente React para ser facilmente testável,
 * reutilizável e memoizável. Nenhuma dependência de UI aqui.
 */

/** Item cru vindo do backend (`GET /dashboard` → `timeline`). */
export interface TimelineItem {
  id: string;
  status: string; // OPEN | IN_PROGRESS | DONE
  entryDate: string; // ISO — data de entrada na oficina (createdAt da OS)
  expectedDeliveryDate: string | null; // ISO — previsão de saída (opcional)
  plate: string | null;
  brand: string | null;
  model: string | null;
  clientName: string | null;
}

/** Situação temporal derivada de um veículo. */
export type Urgency = 'overdue' | 'today' | 'soon' | 'upcoming' | 'fresh' | 'done';

/** Item com os campos calculados (dias na oficina, dias restantes, situação). */
export interface DerivedRow extends TimelineItem {
  daysInShop: number;
  /** Dias até a previsão de saída. Negativo = atrasado. `null` = sem previsão. */
  daysRemaining: number | null;
  urgency: Urgency;
}

export type TimelineFilter = 'all' | 'active' | 'today' | 'next7' | 'overdue' | 'done';

const MS_DAY = 86_400_000;

/** Meia-noite local — permite comparar dias de calendário, ignorando horas. */
function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Diferença em dias de calendário (to - from). Ex.: 01/07 → 05/07 = 4. */
export function diffInDays(from: Date, to: Date): number {
  return Math.round((startOfDay(to) - startOfDay(from)) / MS_DAY);
}

/** Classifica a situação a partir do status e dos dias restantes. */
function classify(status: string, daysRemaining: number | null): Urgency {
  if (status === 'DONE') return 'done';
  if (daysRemaining === null) return 'fresh'; // recém-entrada / sem previsão
  if (daysRemaining < 0) return 'overdue';
  if (daysRemaining === 0) return 'today';
  if (daysRemaining <= 7) return 'soon';
  return 'upcoming';
}

/** Calcula os campos derivados de um item para o instante `now`. */
export function deriveRow(item: TimelineItem, now: Date = new Date()): DerivedRow {
  const entry = new Date(item.entryDate);
  const daysInShop = Number.isNaN(entry.getTime()) ? 0 : Math.max(0, diffInDays(entry, now));

  let daysRemaining: number | null = null;
  if (item.expectedDeliveryDate) {
    const dd = new Date(item.expectedDeliveryDate);
    if (!Number.isNaN(dd.getTime())) daysRemaining = diffInDays(now, dd);
  }

  return { ...item, daysInShop, daysRemaining, urgency: classify(item.status, daysRemaining) };
}

/**
 * Prioridade da ordenação cronológica (menor = mais urgente / topo da tabela):
 * 1. Atrasado → 2. Sai hoje → 3. Próximos dias → 4. Entrega distante →
 * 5. Recém-entrada (sem previsão) → 6. Finalizado.
 */
const URGENCY_ORDER: Record<Urgency, number> = {
  overdue: 0,
  today: 1,
  soon: 2,
  upcoming: 3,
  fresh: 4,
  done: 5,
};

/** Ordenação inteligente padrão (buckets de urgência + critério interno). */
export function smartCompare(a: DerivedRow, b: DerivedRow): number {
  const byBucket = URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency];
  if (byBucket !== 0) return byBucket;

  // Dentro do mesmo bucket com previsão: entrega mais próxima/atrasada primeiro.
  if (a.daysRemaining !== null && b.daysRemaining !== null && a.daysRemaining !== b.daysRemaining) {
    return a.daysRemaining - b.daysRemaining;
  }

  // Sem previsão (recém/finalizado) ou empate: entrada mais recente primeiro.
  return new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
}

/** Verifica se a linha pertence ao filtro rápido selecionado. */
export function matchesFilter(r: DerivedRow, f: TimelineFilter): boolean {
  switch (f) {
    case 'all':
      return true;
    case 'active':
      return r.status !== 'DONE';
    case 'today':
      return r.urgency === 'today';
    case 'next7':
      return r.urgency === 'soon';
    case 'overdue':
      return r.urgency === 'overdue';
    case 'done':
      return r.status === 'DONE';
    default:
      return true;
  }
}

/** Busca textual por cliente, placa ou modelo (marca inclusa). */
export function matchesSearch(r: DerivedRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [r.clientName, r.plate, r.brand, r.model].some((v) => v?.toLowerCase().includes(q));
}

/** Rótulo curto da situação, com o contador de dias quando aplicável. */
export function urgencyLabel(r: DerivedRow): string {
  const dr = r.daysRemaining;
  switch (r.urgency) {
    case 'overdue':
      return `Atrasado ${Math.abs(dr as number)}d`;
    case 'today':
      return 'Sai hoje';
    case 'soon':
    case 'upcoming':
      return `Faltam ${dr}d`;
    case 'fresh':
      return 'Recém-entrada';
    case 'done':
      return 'Finalizado';
    default:
      return '—';
  }
}

/** Rótulo humano do tempo total na oficina (contador automático). */
export function shopTimeLabel(days: number): string {
  if (days <= 0) return 'Entrou hoje';
  return `${days} ${days === 1 ? 'dia' : 'dias'}`;
}
