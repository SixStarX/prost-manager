import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/register — criação de usuários.
   *
   * NÃO é público. O `JwtAuthGuard` global exige um Bearer token válido
   * (401 se ausente/expirado) e o `RolesGuard` exige o papel ADMIN
   * (403 para qualquer outro perfil).
   */
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  /** POST /auth/login — único endpoint de autenticação aberto. */
  @Public()
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
