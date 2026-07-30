/**
 * Estado e transformações do formulário de checklist — lógica pura, sem UI.
 *
 * Separado de `ChecklistForm.tsx` para manter o componente focado na
 * apresentação: aqui ficam o shape do estado, os construtores (vazio, a partir
 * de um checklist existente, a partir de um prefill) e a montagem do payload da
 * API. Nenhuma dependência de React — facilmente testável.
 */
import { toDateInput, toIsoOrNull } from '@/lib/format';
import type { Checklist, ConditionMap, DamageMark, UnitCode } from '@/lib/checklist';

/** Dados mínimos do veículo/cliente para pré-preencher um novo checklist. */
export interface ChecklistPrefill {
  vehicle: { brand: string; model: string; year: number; plate: string };
  client: {
    name: string;
    phone?: string | null;
    email?: string | null;
    cpfcnpj?: string | null;
  };
}

export interface FormState {
  unit: UnitCode | null;
  status: string;
  entryDate: string;
  expectedDate: string;
  exitDate: string;
  responsible: string;
  // Cliente
  clientName: string;
  clientCpfCnpj: string;
  clientRg: string;
  clientAddress: string;
  clientNeighborhood: string;
  clientCity: string;
  clientState: string;
  clientZip: string;
  clientPhone: string;
  clientMobile: string;
  clientPhone2: string;
  clientEmail: string;
  clientNotes: string;
  // Veículo
  vBrand: string;
  vModel: string;
  vYear: string;
  vChassis: string;
  vPlate: string;
  vColor: string;
  kmIn: string;
  kmOut: string;
  // Combustível
  fuelType: string;
  fuelLevel: number;
  // Seções
  externalAccessories: ConditionMap;
  safetyEquipment: ConditionMap;
  interiorTech: ConditionMap;
  damageMarks: DamageMark[];
  // Diagnóstico
  diagnosis: string;
  observations: string;
  // Assinaturas
  signCompanyName: string;
  signCompanyImage: string | null;
  signClientName: string;
  signClientImage: string | null;
}

export function emptyState(): FormState {
  return {
    unit: 'MECANICA',
    status: 'IN_SERVICE',
    entryDate: toDateInput(new Date().toISOString()),
    expectedDate: '',
    exitDate: '',
    responsible: '',
    clientName: '',
    clientCpfCnpj: '',
    clientRg: '',
    clientAddress: '',
    clientNeighborhood: '',
    clientCity: '',
    clientState: '',
    clientZip: '',
    clientPhone: '',
    clientMobile: '',
    clientPhone2: '',
    clientEmail: '',
    clientNotes: '',
    vBrand: '',
    vModel: '',
    vYear: '',
    vChassis: '',
    vPlate: '',
    vColor: '',
    kmIn: '',
    kmOut: '',
    fuelType: 'Gasolina',
    fuelLevel: 50,
    externalAccessories: {},
    safetyEquipment: {},
    interiorTech: {},
    damageMarks: [],
    diagnosis: '',
    observations: '',
    signCompanyName: '',
    signCompanyImage: null,
    signClientName: '',
    signClientImage: null,
  };
}

export function fromChecklist(c: Checklist): FormState {
  return {
    unit: (c.unit as UnitCode) ?? 'MECANICA',
    status: c.status,
    entryDate: toDateInput(c.entryDate),
    expectedDate: toDateInput(c.expectedDate),
    exitDate: toDateInput(c.exitDate),
    responsible: c.responsible ?? '',
    clientName: c.clientName ?? '',
    clientCpfCnpj: c.clientCpfCnpj ?? '',
    clientRg: c.clientRg ?? '',
    clientAddress: c.clientAddress ?? '',
    clientNeighborhood: c.clientNeighborhood ?? '',
    clientCity: c.clientCity ?? '',
    clientState: c.clientState ?? '',
    clientZip: c.clientZip ?? '',
    clientPhone: c.clientPhone ?? '',
    clientMobile: c.clientMobile ?? '',
    clientPhone2: c.clientPhone2 ?? '',
    clientEmail: c.clientEmail ?? '',
    clientNotes: c.clientNotes ?? '',
    vBrand: c.vBrand ?? '',
    vModel: c.vModel ?? '',
    vYear: c.vYear != null ? String(c.vYear) : '',
    vChassis: c.vChassis ?? '',
    vPlate: c.vPlate ?? '',
    vColor: c.vColor ?? '',
    kmIn: c.kmIn != null ? String(c.kmIn) : '',
    kmOut: c.kmOut != null ? String(c.kmOut) : '',
    fuelType: c.fuelType ?? 'Gasolina',
    fuelLevel: c.fuelLevel ?? 50,
    externalAccessories: c.externalAccessories ?? {},
    safetyEquipment: c.safetyEquipment ?? {},
    interiorTech: c.interiorTech ?? {},
    damageMarks: c.damageMarks ?? [],
    diagnosis: c.diagnosis ?? '',
    observations: c.observations ?? '',
    signCompanyName: c.signCompanyName ?? '',
    signCompanyImage: c.signCompanyImage ?? null,
    signClientName: c.signClientName ?? '',
    signClientImage: c.signClientImage ?? null,
  };
}

export function fromPrefill(p: ChecklistPrefill): FormState {
  const s = emptyState();
  s.clientName = p.client.name ?? '';
  s.clientPhone = p.client.phone ?? '';
  s.clientEmail = p.client.email ?? '';
  s.clientCpfCnpj = p.client.cpfcnpj ?? '';
  s.vBrand = p.vehicle.brand ?? '';
  s.vModel = p.vehicle.model ?? '';
  s.vYear = p.vehicle.year != null ? String(p.vehicle.year) : '';
  s.vPlate = p.vehicle.plate ?? '';
  return s;
}

/** Estado do form → payload da API (edit envia null p/ limpar; create omite). */
export function buildPayload(s: FormState, mode: 'create' | 'edit') {
  const empty = mode === 'edit' ? null : undefined;
  const txt = (v: string) => (v.trim() ? v.trim() : empty);
  const num = (v: string) => (v.trim() ? Number(v) : empty);
  const date = (v: string) => (v ? toIsoOrNull(v) : empty);
  const map = (m: ConditionMap) => (Object.keys(m).length ? m : empty);

  const signedAt =
    s.signCompanyImage || s.signClientImage || s.signCompanyName || s.signClientName
      ? new Date().toISOString()
      : empty;

  return {
    unit: s.unit ?? undefined,
    status: s.status,
    entryDate: date(s.entryDate),
    expectedDate: date(s.expectedDate),
    exitDate: date(s.exitDate),
    responsible: txt(s.responsible),
    clientName: txt(s.clientName),
    clientCpfCnpj: txt(s.clientCpfCnpj),
    clientRg: txt(s.clientRg),
    clientAddress: txt(s.clientAddress),
    clientNeighborhood: txt(s.clientNeighborhood),
    clientCity: txt(s.clientCity),
    clientState: txt(s.clientState),
    clientZip: txt(s.clientZip),
    clientPhone: txt(s.clientPhone),
    clientMobile: txt(s.clientMobile),
    clientPhone2: txt(s.clientPhone2),
    clientEmail: txt(s.clientEmail),
    clientNotes: txt(s.clientNotes),
    vBrand: txt(s.vBrand),
    vModel: txt(s.vModel),
    vYear: num(s.vYear),
    vChassis: txt(s.vChassis),
    vPlate: txt(s.vPlate),
    vColor: txt(s.vColor),
    kmIn: num(s.kmIn),
    kmOut: num(s.kmOut),
    fuelType: txt(s.fuelType),
    fuelLevel: s.fuelLevel,
    externalAccessories: map(s.externalAccessories),
    safetyEquipment: map(s.safetyEquipment),
    interiorTech: map(s.interiorTech),
    damageMarks: s.damageMarks.length ? s.damageMarks : empty,
    diagnosis: txt(s.diagnosis),
    observations: txt(s.observations),
    signCompanyName: txt(s.signCompanyName),
    signCompanyImage: s.signCompanyImage ?? empty,
    signClientName: txt(s.signClientName),
    signClientImage: s.signClientImage ?? empty,
    signedAt,
  };
}
