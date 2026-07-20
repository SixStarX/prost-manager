import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateServiceOrderDto {
  @IsString()
  diagnosticId!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  status?: string;

  /** Previsão de saída/entrega (ISO 8601). Opcional. */
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;
}
