import { IsOptional, IsString } from 'class-validator';

export class CreateDiagnosticDto {
  @IsString()
  description!: string;

  @IsString()
  vehicleId!: string;

  @IsOptional()
  @IsString()
  status?: string;
}
