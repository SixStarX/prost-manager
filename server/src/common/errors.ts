/** Extrai uma mensagem legível de um valor capturado num `catch` (tipo `unknown`). */
export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
