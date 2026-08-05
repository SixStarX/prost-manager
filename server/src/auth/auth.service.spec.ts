import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: { findUnique: jest.Mock; create: jest.Mock };
    refreshToken: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      deleteMany: jest.Mock;
    };
  };
  let jwt: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn(), create: jest.fn() },
      refreshToken: {
        create: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    jwt = { sign: jest.fn().mockReturnValue('access.jwt.token') };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('login', () => {
    const user = {
      id: 'u1',
      name: 'Ana',
      email: 'a@x.com',
      password: 'hash',
      role: 'ADMIN',
    };

    it('emite sessão com credenciais válidas', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const res = await service.login({ email: 'a@x.com', password: 'secret' });

      expect(res.user).toEqual({
        id: 'u1',
        name: 'Ana',
        email: 'a@x.com',
        role: 'ADMIN',
      });
      expect(res.accessToken).toBe('access.jwt.token');
      expect(res.refreshToken).toHaveLength(64); // 32 bytes em hex
      expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: 'u1',
        email: 'a@x.com',
        role: 'ADMIN',
      });
    });

    it('rejeita e-mail inexistente', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'x@x.com', password: 'p' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejeita senha inválida e não emite tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.login({ email: 'a@x.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    const user = { id: 'u1', name: 'Ana', email: 'a@x.com', role: 'USER' };

    it('rotaciona: revoga o token atual e emite um novo', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt1',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 10_000),
        user,
      });

      const res = await service.refresh('rawtoken');

      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'rt1' },
        data: { revokedAt: expect.any(Date) },
      });
      expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
      expect(res.user.id).toBe('u1');
      expect(res.refreshToken).toHaveLength(64);
    });

    it('rejeita quando não há refresh', async () => {
      await expect(service.refresh(undefined)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejeita refresh inexistente', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);
      await expect(service.refresh('x')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejeita refresh revogado', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt1',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 10_000),
        user,
      });
      await expect(service.refresh('x')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    });

    it('rejeita refresh expirado', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt1',
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1_000),
        user,
      });
      await expect(service.refresh('x')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('revoga o refresh do cookie', async () => {
      const res = await service.logout('rawtoken');
      expect(res).toEqual({ ok: true });
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledTimes(1);
    });

    it('é idempotente sem token', async () => {
      const res = await service.logout(undefined);
      expect(res).toEqual({ ok: true });
      expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();
    });
  });
});
