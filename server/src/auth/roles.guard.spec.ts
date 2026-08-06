import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import type { AppRole } from './roles.decorator';

function makeGuard(required: AppRole[] | undefined): RolesGuard {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(required),
  } as unknown as Reflector;
  return new RolesGuard(reflector);
}

function ctxWith(user: unknown): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('libera quando a rota não exige papel', () => {
    expect(makeGuard(undefined).canActivate(ctxWith(undefined))).toBe(true);
    expect(makeGuard([]).canActivate(ctxWith(undefined))).toBe(true);
  });

  it('libera ADMIN quando a rota exige ADMIN', () => {
    expect(makeGuard(['ADMIN']).canActivate(ctxWith({ role: 'ADMIN' }))).toBe(
      true,
    );
  });

  it('bloqueia USER quando a rota exige ADMIN (403)', () => {
    expect(() =>
      makeGuard(['ADMIN']).canActivate(ctxWith({ role: 'USER' })),
    ).toThrow(ForbiddenException);
  });

  it('bloqueia quando não há usuário ou papel', () => {
    expect(() =>
      makeGuard(['ADMIN']).canActivate(ctxWith(undefined)),
    ).toThrow(ForbiddenException);
    expect(() => makeGuard(['ADMIN']).canActivate(ctxWith({}))).toThrow(
      ForbiddenException,
    );
  });
});
