import { AxiosError } from 'axios';

/**
 * Extrai uma mensagem de erro legível de qualquer valor capturado num `catch`.
 *
 * Prioriza a mensagem que o backend (NestJS) devolve em `response.data.message`
 * — que pode ser uma string ou um array de strings (erros de validação) —,
 * caindo para a mensagem do próprio erro e, por fim, para o texto padrão.
 *
 * Substitui o padrão `catch (e: any)` espalhado pelas páginas por um tratamento
 * tipado e único (`catch (e) { toast.error(getErrorMessage(e, '…')) }`).
 */
export function getErrorMessage(err: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string | string[] } | undefined;
    const message = data?.message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (typeof message === 'string' && message) return message;
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
