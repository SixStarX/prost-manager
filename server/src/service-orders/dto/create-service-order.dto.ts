import { IsOptional, IsString } from 'class-validator';

export class CreateServiceOrderDto {
  @IsString()
  diagnosticId!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
