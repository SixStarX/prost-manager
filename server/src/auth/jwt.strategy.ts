import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
  type JwtFromRequestFunction,
} from 'passport-jwt';
import type { Request } from 'express';
import { jwtSecret } from './jwt.secret';
import { ACCESS_COOKIE } from './cookies';

interface JwtPayload {
  sub: string;
  email: string;
  role?: 'ADMIN' | 'USER';
}

/** Extrai o access token do cookie httpOnly; fallback para o header Bearer. */
const cookieExtractor: JwtFromRequestFunction = (req: Request) => {
  const cookies = req?.cookies as Record<string, string> | undefined;
  return cookies?.[ACCESS_COOKIE] ?? null;
};

/**
 * Valida o access token (cookie ou Bearer). O payload retornado por `validate`
 * é anexado em `req.user` — disponível para os controllers protegidos.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret(),
    });
  }

  validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
