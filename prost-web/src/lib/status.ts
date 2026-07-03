import type { BadgeProps } from '@/components/ui/badge';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

/**
 * Mapas de status compartilhados (rótulo + variante de Badge).
 * Centralizados aqui para eliminar a duplicação que existia em Dashboard,
 * Diagnostics e ServiceOrders.
 */
export const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Aberta',
  IN_PROGRESS: 'Em andamento',
  DONE: 'Concluída',
  PENDING: 'Pendente',
};

export const STATUS_VARIANT: Record<string, BadgeVariant> = {
  OPEN: 'open',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
  PENDING: 'pending',
};

/** Rótulo de status de diagnóstico (Pendente / Concluído). */
export const DIAGNOSTIC_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  DONE: 'Concluído',
};

export const statusLabel = (s: string) => STATUS_LABEL[s] ?? s;
export const statusVariant = (s: string): BadgeVariant => STATUS_VARIANT[s] ?? 'default';
