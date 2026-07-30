/** Formatação de datas da área de Integrações. */

/** ISO → dd/MM/yy HH:mm (pt-BR), com traço para valores ausentes. */
export function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Data de hoje como yyyy-MM-dd (para `<input type="date">`). */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/** yyyy-MM-dd → dd/MM/yyyy. */
export function isoToBR(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
