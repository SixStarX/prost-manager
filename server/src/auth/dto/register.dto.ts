import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import type { AppRole } from '../roles.decorator';

export class RegisterDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'A senha deve ter ao menos 8 caracteres.' })
  password!: string;

  // Papel do novo usuário. Só o ADMIN autenticado chega a este endpoint; se
  // omitido, cria-se um usuário comum (menor privilégio por padrão).
  @IsOptional()
  @IsIn(['ADMIN', 'USER'])
  role?: AppRole;
}
