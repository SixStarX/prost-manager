import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createHash, randomBytes } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { REFRESH_TTL_MS } from './cookies';

import * as bcrypt from 'bcrypt';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (userExists) {
      throw new ConflictException('Usuário já existe');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        // Papel sempre explícito: sem isso, cairia no default do schema.
        // Omitido pelo admin → usuário comum (menor privilégio).
        role: data.role ?? 'USER',
      },
    });

    // Nunca devolver o hash da senha na resposta.
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordValid = await bcrypt.compare(data.password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.issueSession(user);
  }

  /**
   * Rotaciona a sessão a partir do refresh token do cookie: valida, revoga o
   * atual e emite novos (access + refresh). Um refresh inválido/expirado/já
   * usado é rejeitado.
   */
  async refresh(refreshRaw: string | undefined) {
    if (!refreshRaw) throw new UnauthorizedException('Sessão inválida.');

    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashToken(refreshRaw) },
      include: { user: true },
    });

    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Sessão expirada. Faça login novamente.');
    }

    // Rotação: revoga o refresh atual antes de emitir o novo.
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    return this.issueSession(record.user);
  }

  /** Revoga o refresh do cookie (logout). Idempotente. */
  async logout(refreshRaw: string | undefined) {
    if (refreshRaw) {
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash: this.hashToken(refreshRaw), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return { ok: true };
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Emite access (JWT curto) + refresh (opaco, persistido como hash). */
  private async issueSession(user: SessionUser) {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = randomBytes(32).toString('hex');
    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  /** Remove refresh tokens expirados/revogados (evita crescimento indefinido). */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async pruneRefreshTokens() {
    const { count } = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { lt: new Date(Date.now() - REFRESH_TTL_MS) } },
        ],
      },
    });
    if (count > 0) this.logger.log(`Prune de ${count} refresh token(s).`);
  }
}
