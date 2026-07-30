import {
  IsDateString,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class UpdateServiceOrderDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  /** Previsão de saída/entrega (ISO 8601). Envie null para limpar. */
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  expectedDeliveryDate?: string | null;
}
