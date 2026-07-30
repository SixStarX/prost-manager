/**
 * Segredo de assinatura do JWT. Sem fallback: se `JWT_SECRET` não estiver
 * configurada, o servidor não deve subir — um default previsível permitiria
 * forjar tokens válidos em produção.
 */
export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET não configurada. Defina-a no server/.env antes de iniciar o servidor.',
    );
  }
  return secret;
}
