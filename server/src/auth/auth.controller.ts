import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { REFRESH_COOKIE, setAuthCookies, clearAuthCookies } from './cookies';

function readRefresh(req: Request): string | undefined {
  const cookies = req.cookies as Record<string, string> | undefined;
  return cookies?.[REFRESH_COOKIE];
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/register — criação de usuários (restrita a ADMIN autenticado).
   * JwtAuthGuard exige token (401); RolesGuard exige o papel ADMIN (403).
   */
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  /**
   * POST /auth/login — autentica e grava os cookies httpOnly de sessão.
   * Limite estrito (8/min por IP) contra brute-force. Não devolve token no corpo.
   */
  @Public()
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.login(body);
    setAuthCookies(res, accessToken, refreshToken);
    return { user };
  }

  /** POST /auth/refresh — rotaciona a sessão a partir do refresh cookie. */
  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } = await this.authService.refresh(
      readRefresh(req),
    );
    setAuthCookies(res, accessToken, refreshToken);
    return { user };
  }

  /** POST /auth/logout — revoga o refresh e limpa os cookies. */
  @Public()
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(readRefresh(req));
    clearAuthCookies(res);
    return { ok: true };
  }

  /** GET /auth/me — usuário atual (exige access token válido). */
  @Get('me')
  me(@Req() req: Request) {
    return { user: req.user };
  }
}
