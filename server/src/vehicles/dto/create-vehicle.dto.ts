import { IsInt, IsString } from 'class-validator';

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
}
