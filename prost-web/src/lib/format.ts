/** Utilitários de formatação compartilhados. */

const dateFmt = new Intl.DateTimeFormat('pt-BR');

/** Formata uma data ISO/Date no padrão brasileiro (dd/mm/aaaa). */
export function formatDate(value: string | number | Date | null | undefined): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : dateFmt.format(d);
}

/** ISO → valor de `<input type="date">` (yyyy-mm-dd) no fuso local. */
export function toDateInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** yyyy-mm-dd → ISO ao meio-dia local (evita deslocar o dia por fuso). */
export function toIsoOrNull(value: string): string | null {
  return value ? new Date(`${value}T12:00:00`).toISOString() : null;
}
