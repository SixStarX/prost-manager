/** Utilitários de formatação compartilhados. */

const dateFmt = new Intl.DateTimeFormat('pt-BR');

/** Formata uma data ISO/Date no padrão brasileiro (dd/mm/aaaa). */
export function formatDate(value: string | number | Date | null | undefined): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : dateFmt.format(d);
}
