import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtSecret } from './jwt.secret';

interface JwtPayload {
  sub: string;
  email: string;
}

/**
 * Valida o Bearer token das requisições. O payload retornado por `validate`
 * é anexado em `req.user` — disponível para os controllers protegidos.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret(),
    });
  }

  validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email };
  }
}
