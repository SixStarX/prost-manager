/**
 * Catálogo e tipos do Checklist (Vistoria de veículo).
 *
 * Fonte única para render (detalhe) e edição (form): listas de itens por seção,
 * estados de condição, tipos de combustível e mapas de status. Mantido sem
 * dependência de UI para ser reutilizável e testável.
 */

import type { BadgeProps } from '@/components/ui/badge';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

/* ── Status do veículo (abas do checklist) ─────────────────────────────── */

export const CHECKLIST_STATUS_LABEL: Record<string, string> = {
  IN_SERVICE: 'Em Serviço',
  WAITING_PARTS: 'Aguardando Peças',
  READY: 'Pronto p/ Entrega',
  DELIVERED: 'Entregue',
};

export const CHECKLIST_STATUS_VARIANT: Record<string, BadgeVariant> = {
  IN_SERVICE: 'open',
  WAITING_PARTS: 'in-progress',
  READY: 'brand',
  DELIVERED: 'done',
};

/** Ordem das abas de status (segue os prints). */
export const CHECKLIST_STATUSES = [
  'IN_SERVICE',
  'WAITING_PARTS',
  'READY',
  'DELIVERED',
] as const;

export const checklistStatusLabel = (s?: string | null) =>
  (s && CHECKLIST_STATUS_LABEL[s]) || '—';
export const checklistStatusVariant = (s?: string | null): BadgeVariant =>
  (s && CHECKLIST_STATUS_VARIANT[s]) || 'default';

/* ── Condição de um item vistoriado ────────────────────────────────────── */

export type Condition = 'OK' | 'DAMAGED' | 'ABSENT';

export const CONDITION_LABEL: Record<Condition, string> = {
  OK: 'OK',
  DAMAGED: 'Danificado',
  ABSENT: 'Ausente',
};

export const CONDITION_VARIANT: Record<Condition, BadgeVariant> = {
  OK: 'done',
  DAMAGED: 'in-progress',
  ABSENT: 'destructive',
};

export const CONDITIONS: Condition[] = ['OK', 'DAMAGED', 'ABSENT'];

/* ── Itens por seção (rótulos exibidos = chaves no JSON) ────────────────── */

export const EXTERNAL_ACCESSORIES = [
  'Emblemas',
  'Para-brisas',
  'Pneus',
  'Calotas/Rodas',
  'Antena',
  'Retrovisores',
  'Faróis',
  'Lanternas',
  'Tampa Traseira',
] as const;

export const SAFETY_EQUIPMENT = [
  'Estepe',
  'Extintor',
  'Macaco',
  'Chave de Roda',
  'Triângulo',
] as const;

export const INTERIOR_TECH = [
  'Manuais',
  'Rádio/Multi-mídia',
  'Câmera de Ré',
  'Sensores',
  'Teto Solar',
  'Documentos',
  'Tapetes',
  'Acendedor',
  'Auto-Falantes',
  'Vidro Elétrico',
  'Chaveiro',
] as const;

export const FUEL_TYPES = ['Gasolina', 'Diesel', 'Etanol', 'Outro'] as const;

/** Mapa item → condição, como persistido no backend. */
export type ConditionMap = Record<string, Condition>;

/* ── Unidade de atendimento (protocolo) ────────────────────────────────── */

export type UnitCode = 'MECANICA' | 'FUNILARIA' | 'BLINDADOS';

export interface UnitDef {
  code: UnitCode;
  label: string;
  description: string;
}

export const UNITS: UnitDef[] = [
  { code: 'MECANICA', label: 'Mecânica', description: 'Serviços mecânicos gerais' },
  { code: 'FUNILARIA', label: 'Funilaria', description: 'Reparos de funilaria e pintura' },
  { code: 'BLINDADOS', label: 'Blindados', description: 'Serviços de blindagem veicular' },
];

export const unitLabel = (u?: string | null) =>
  (u && UNITS.find((x) => x.code === u)?.label) || '—';

/* ── Mapeamento de avarias ─────────────────────────────────────────────── */

export type DamageType = 'RISCO' | 'AMASSADO' | 'QUEBRA';

export interface DamageMark {
  x: number; // 0..1 (relativo à largura do diagrama)
  y: number; // 0..1 (relativo à altura)
  type: DamageType;
}

export interface DamageTypeDef {
  type: DamageType;
  label: string;
  color: string; // hex — usado no marcador e na legenda
}

export const DAMAGE_TYPES: DamageTypeDef[] = [
  { type: 'RISCO', label: 'Risco', color: '#f59e0b' },
  { type: 'AMASSADO', label: 'Amassado', color: '#3b82f6' },
  { type: 'QUEBRA', label: 'Quebra', color: '#ef4444' },
];

export const damageColor = (t: DamageType) =>
  DAMAGE_TYPES.find((d) => d.type === t)?.color ?? '#a1a1aa';

/* ── Tipos de dados (espelham o backend) ───────────────────────────────── */

export interface ChecklistListItem {
  id: string;
  status: string;
  createdAt: string;
  entryDate: string | null;
  expectedDate: string | null;
  exitDate: string | null;
  responsible: string | null;
  observations: string | null;
}

/** Item da lista "Veículos em Serviço" / Dashboard de Entregas. */
export interface ChecklistSummary {
  id: string;
  protocol: string | null;
  unit: string | null;
  status: string;
  clientName: string;
  vBrand: string | null;
  vModel: string | null;
  vPlate: string | null;
  expectedDate: string | null;
  createdAt: string;
  /** Presentes no resumo do Dashboard (para deep-link ao perfil). */
  clientId?: string | null;
  vehicleId?: string | null;
}

export interface Checklist {
  id: string;
  vehicleId: string | null;
  clientId: string | null;
  unit: string | null;
  protocol: string | null;
  status: string;
  entryDate: string | null;
  expectedDate: string | null;
  exitDate: string | null;
  responsible: string | null;

  clientName: string;
  clientPhone: string | null;
  clientMobile: string | null;
  clientPhone2: string | null;
  clientEmail: string | null;
  clientCpfCnpj: string | null;
  clientRg: string | null;
  clientNotes: string | null;
  clientAddress: string | null;
  clientNeighborhood: string | null;
  clientCity: string | null;
  clientState: string | null;
  clientZip: string | null;

  vBrand: string | null;
  vModel: string | null;
  vYear: number | null;
  vPlate: string | null;
  vColor: string | null;
  vChassis: string | null;
  kmIn: number | null;
  kmOut: number | null;

  fuelType: string | null;
  fuelLevel: number | null;

  externalAccessories: ConditionMap | null;
  safetyEquipment: ConditionMap | null;
  interiorTech: ConditionMap | null;

  damageMarks: DamageMark[] | null;

  diagnosis: string | null;
  requestedServices: string | null;
  observations: string | null;

  signCompanyName: string | null;
  signClientName: string | null;
  signCompanyImage: string | null;
  signClientImage: string | null;
  signedAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface VehicleSummary {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  createdAt: string;
  checklistCount: number;
  currentStatus: string | null;
  lastChecklistAt: string | null;
}

export interface ClientProfileData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  cpfcnpj: string | null;
  createdAt: string;
  totalChecklists: number;
  vehicleCount: number;
  lastVisit: string | null;
  vehicles: VehicleSummary[];
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

const timeFmt = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
});

/** Formata o horário (HH:mm) de uma data ISO. */
export function formatTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : timeFmt.format(d);
}
