import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  plate!: string;

  @IsString()
  brand!: string;

  @IsString()
  model!: string;

  @IsInt()
  year!: number;

  @IsString()
  clientId!: string;

  // ── Campos adicionais (cadastro completo) ──
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsInt() mileage?: number;
  @IsOptional() @IsString() chassis?: string;
  @IsOptional() @IsString() renavam?: string;
}
