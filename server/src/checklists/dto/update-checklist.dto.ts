import {
  IsArray,
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

/** Nulável: aceita o valor tipado OU `null` (para limpar o campo). */
const Nullable = () => ValidateIf((_, value) => value !== null);

/**
 * Atualização de checklist ("Atualizar Checklist"). Todos os campos são opcionais;
 * datas e imagens aceitam `null` para limpar. `vehicleId`/`clientId` não são editáveis.
 */
export class UpdateChecklistDto {
  // ── Unidade de atendimento ──
  @IsOptional() @Nullable() @IsString() unit?: string | null;

  // ── Status do veículo ──
  @IsOptional() @IsString() status?: string;
  @IsOptional() @Nullable() @IsDateString() entryDate?: string | null;
  @IsOptional() @Nullable() @IsDateString() expectedDate?: string | null;
  @IsOptional() @Nullable() @IsDateString() exitDate?: string | null;
  @IsOptional() @Nullable() @IsString() responsible?: string | null;

  // ── Snapshot cliente ──
  @IsOptional() @IsString() clientName?: string;
  @IsOptional() @Nullable() @IsString() clientPhone?: string | null;
  @IsOptional() @Nullable() @IsString() clientMobile?: string | null;
  @IsOptional() @Nullable() @IsString() clientPhone2?: string | null;
  @IsOptional() @Nullable() @IsString() clientEmail?: string | null;
  @IsOptional() @Nullable() @IsString() clientCpfCnpj?: string | null;
  @IsOptional() @Nullable() @IsString() clientRg?: string | null;
  @IsOptional() @Nullable() @IsString() clientNotes?: string | null;
  @IsOptional() @Nullable() @IsString() clientAddress?: string | null;
  @IsOptional() @Nullable() @IsString() clientNeighborhood?: string | null;
  @IsOptional() @Nullable() @IsString() clientCity?: string | null;
  @IsOptional() @Nullable() @IsString() clientState?: string | null;
  @IsOptional() @Nullable() @IsString() clientZip?: string | null;

  // ── Snapshot veículo ──
  @IsOptional() @Nullable() @IsString() vBrand?: string | null;
  @IsOptional() @Nullable() @IsString() vModel?: string | null;
  @IsOptional() @Nullable() @IsInt() vYear?: number | null;
  @IsOptional() @Nullable() @IsString() vPlate?: string | null;
  @IsOptional() @Nullable() @IsString() vColor?: string | null;
  @IsOptional() @Nullable() @IsString() vChassis?: string | null;
  @IsOptional() @Nullable() @IsInt() @Min(0) kmIn?: number | null;
  @IsOptional() @Nullable() @IsInt() @Min(0) kmOut?: number | null;

  // ── Combustível ──
  @IsOptional() @Nullable() @IsString() fuelType?: string | null;
  @IsOptional() @Nullable() @IsInt() @Min(0) @Max(100) fuelLevel?: number | null;

  // ── Seções item → condição ──
  @IsOptional() @IsObject() externalAccessories?: Record<string, string>;
  @IsOptional() @IsObject() safetyEquipment?: Record<string, string>;
  @IsOptional() @IsObject() interiorTech?: Record<string, string>;

  // ── Mapeamento de avarias ──
  @IsOptional() @Nullable() @IsArray() damageMarks?: unknown[] | null;

  // ── Diagnóstico e prazos ──
  @IsOptional() @Nullable() @IsString() diagnosis?: string | null;
  @IsOptional() @Nullable() @IsString() requestedServices?: string | null;
  @IsOptional() @Nullable() @IsString() observations?: string | null;

  // ── Assinaturas ──
  @IsOptional() @Nullable() @IsString() signCompanyName?: string | null;
  @IsOptional() @Nullable() @IsString() signClientName?: string | null;
  @IsOptional() @Nullable() @IsString() signCompanyImage?: string | null;
  @IsOptional() @Nullable() @IsString() signClientImage?: string | null;
  @IsOptional() @Nullable() @IsDateString() signedAt?: string | null;
}
