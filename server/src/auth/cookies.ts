import type { Response } from 'express';

/** Nomes e TTLs dos cookies de sessão. */
export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';
export const ACCESS_TTL_MS = 15 * 60 * 1000; // 15 min
export const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

const isProd = () => process.env.NODE_ENV === 'production';
const domain = () => process.env.COOKIE_DOMAIN || undefined;

/**
 * Cookies httpOnly + SameSite=Lax (mitiga CSRF) + Secure em produção.
 * Path=`/` nos dois: o frontend acessa a API sob o prefixo `/api` (proxy), então
 * um path restrito (ex.: `/auth`) não casaria com `/api/auth/refresh`. A proteção
 * vem de httpOnly + SameSite, não do path.
 */
export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd(),
    path: '/',
    maxAge: ACCESS_TTL_MS,
    domain: domain(),
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd(),
    path: '/',
    maxAge: REFRESH_TTL_MS,
    domain: domain(),
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { path: '/', domain: domain() });
  res.clearCookie(REFRESH_COOKIE, { path: '/', domain: domain() });
}
