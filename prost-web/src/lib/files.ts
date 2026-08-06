/**
 * Resolve o valor de um campo de imagem (assinatura) para o `src` de um <img>.
 * Retrocompatível: dataURLs legados (base64 no banco) são usados direto; os
 * novos valores são chaves de storage servidas por GET /api/files/<chave>
 * (o navegador envia o cookie httpOnly de sessão no <img>).
 */
export function fileSrc(value?: string | null): string | undefined {
  if (!value) return undefined;
  return value.startsWith('data:') ? value : `/api/files/${value}`;
}
