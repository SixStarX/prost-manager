import { SetMetadata } from '@nestjs/common';

/** Papéis reconhecidos pelo sistema. */
export type AppRole = 'ADMIN' | 'USER';

export const ROLES_KEY = 'roles';

/**
 * Restringe uma rota (ou controller) a determinados papéis. Depende do
 * `RolesGuard` estar aplicado e do JWT já ter sido validado (o `JwtAuthGuard`
 * global anexa `req.user`, incluindo o `role`).
 *
 * Ex.: `@Roles('ADMIN')`
 */
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
