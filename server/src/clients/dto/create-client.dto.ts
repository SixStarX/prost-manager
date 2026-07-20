import { IsDateString, IsOptional, IsString } from 'class-validator';

/**
 * Cadastro de cliente (tela "Adicionar Novo Cliente"). `name` e `phone` são
 * obrigatórios; os demais campos são opcionais. `ValidationPipe({whitelist:true})`
 * remove chaves não declaradas — os dados do veículo vão por `POST /vehicles`.
 */
export class CreateClientDto {
  @IsString() name!: string;
  @IsString() phone!: string;

  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() cpfcnpj?: string;
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsDateString() birthDate?: string;

  // Endereço
  @IsOptional() @IsString() zip?: string;
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsString() number?: string;
  @IsOptional() @IsString() complement?: string;
  @IsOptional() @IsString() neighborhood?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;

  // Informações adicionais
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() preferences?: string;
  @IsOptional() @IsString() initialHistory?: string;
  @IsOptional() @IsString() responsible?: string;

  // Assinaturas (dataURL)
  @IsOptional() @IsString() clientSignature?: string;
  @IsOptional() @IsString() responsibleSignature?: string;
}
