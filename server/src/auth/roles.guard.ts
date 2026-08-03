import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, type AppRole } from './roles.decorator';

interface RequestUser {
  id: string;
  email: string;
  role?: AppRole;
}

/**
 * Autorização por papel. Roda DEPOIS do `JwtAuthGuard` global (que já garantiu
 * autenticação e anexou `req.user`): se não houver `@Roles(...)` na rota, libera;
 * caso contrário exige que o papel do usuário esteja entre os permitidos.
 *
 *   sem token           → 401 (barrado antes, pelo JwtAuthGuard)
 *   token de papel errado → 403 (aqui)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AppRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Rota sem exigência de papel: nada a fazer aqui.
    if (!required || required.length === 0) return true;

    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: RequestUser }>();

    if (user?.role && required.includes(user.role)) return true;

    throw new ForbiddenException(
      'Acesso restrito: esta ação exige perfil de administrador.',
    );
  }
}
