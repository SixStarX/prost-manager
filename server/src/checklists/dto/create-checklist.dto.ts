import {
  IsArray,
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

/**
 * Criação de checklist. `vehicleId` é opcional: quando presente (fluxo do
 * ClientProfile) o serviço resolve o veículo + cliente e grava os snapshots;
 * quando ausente (nova seção de Check-list) usa-se os campos enviados direto.
 * Todos os demais campos são overrides opcionais preenchidos na vistoria.
 */
export class CreateChecklistDto {
  @IsOptional() @IsString() vehicleId?: string;

  // ── Unidade de atendimento ──
  @IsOptional() @IsString() unit?: string; // MECANICA | FUNILARIA | BLINDADOS

  // ── Status do veículo ──
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsDateString() entryDate?: string;
  @IsOptional() @IsDateString() expectedDate?: string;
  @IsOptional() @IsDateString() exitDate?: string;
  @IsOptional() @IsString() responsible?: string;

  // ── Snapshot cliente (override opcional) ──
  @IsOptional() @IsString() clientName?: string;
  @IsOptional() @IsString() clientPhone?: string;
  @IsOptional() @IsString() clientMobile?: string;
  @IsOptional() @IsString() clientPhone2?: string;
  @IsOptional() @IsString() clientEmail?: string;
  @IsOptional() @IsString() clientCpfCnpj?: string;
  @IsOptional() @IsString() clientRg?: string;
  @IsOptional() @IsString() clientNotes?: string;
  @IsOptional() @IsString() clientAddress?: string;
  @IsOptional() @IsString() clientNeighborhood?: string;
  @IsOptional() @IsString() clientCity?: string;
  @IsOptional() @IsString() clientState?: string;
  @IsOptional() @IsString() clientZip?: string;

  // ── Snapshot veículo (override opcional) ──
  @IsOptional() @IsString() vBrand?: string;
  @IsOptional() @IsString() vModel?: string;
  @IsOptional() @IsInt() vYear?: number;
  @IsOptional() @IsString() vPlate?: string;
  @IsOptional() @IsString() vColor?: string;
  @IsOptional() @IsString() vChassis?: string;
  @IsOptional() @IsInt() @Min(0) kmIn?: number;
  @IsOptional() @IsInt() @Min(0) kmOut?: number;

  // ── Combustível ──
  @IsOptional() @IsString() fuelType?: string;
  @IsOptional() @IsInt() @Min(0) @Max(100) fuelLevel?: number;

  // ── Seções item → condição ──
  @IsOptional() @IsObject() externalAccessories?: Record<string, string>;
  @IsOptional() @IsObject() safetyEquipment?: Record<string, string>;
  @IsOptional() @IsObject() interiorTech?: Record<string, string>;

  // ── Mapeamento de avarias ──
  @IsOptional() @IsArray() damageMarks?: unknown[];

  // ── Diagnóstico e prazos ──
  @IsOptional() @IsString() diagnosis?: string;
  @IsOptional() @IsString() requestedServices?: string;
  @IsOptional() @IsString() observations?: string;

  // ── Assinaturas ──
  @IsOptional() @IsString() signCompanyName?: string;
  @IsOptional() @IsString() signClientName?: string;
  @IsOptional() @IsString() signCompanyImage?: string;
  @IsOptional() @IsString() signClientImage?: string;
  @IsOptional() @IsDateString() signedAt?: string;
}
