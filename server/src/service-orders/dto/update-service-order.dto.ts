import { IsOptional, IsString } from 'class-validator';

export class UpdateServiceOrderDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
