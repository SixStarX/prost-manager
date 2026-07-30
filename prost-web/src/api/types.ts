/**
 * Tipos de domínio da API — espelham o schema Prisma do backend
 * (server/prisma/schema.prisma), limitados aos campos que o frontend consome.
 *
 * As relações aninhadas são opcionais de propósito: cada endpoint inclui um
 * subconjunto diferente (ex.: `/vehicles` traz `client`; `/service-orders` traz
 * `diagnostic.vehicle.client`). O acesso defensivo (`?.`) nas páginas cobre os
 * casos em que a relação não veio.
 */
import type { ChecklistSummary } from '@/lib/checklist';
import type { TimelineItem } from '@/lib/timeline';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  cpfcnpj?: string | null;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color?: string | null;
  mileage?: number | null;
  chassis?: string | null;
  renavam?: string | null;
  clientId: string;
  client?: Client | null;
  createdAt: string;
}

export interface Diagnostic {
  id: string;
  description: string;
  status: string;
  source?: string;
  vehicleId: string;
  vehicle?: Vehicle | null;
  createdAt: string;
}

export interface ServiceOrder {
  id: string;
  status: string;
  notes?: string | null;
  expectedDeliveryDate?: string | null;
  oiTotal?: number | null;
  diagnosticId: string;
  diagnostic?: Diagnostic | null;
  createdAt: string;
  updatedAt: string;
}

/** Contagem agregada por status (`groupBy` do backend). */
export interface StatusCount {
  status: string;
  count: number;
}

/** Resposta de `GET /dashboard`. */
export interface DashboardSummary {
  totals: {
    clients: number;
    vehicles: number;
    diagnostics: number;
    serviceOrders: number;
  };
  diagnosticsByStatus: StatusCount[];
  serviceOrdersByStatus: StatusCount[];
  checklistsByStatus: StatusCount[];
  activeChecklists: ChecklistSummary[];
  recentServiceOrders: ServiceOrder[];
  timeline: TimelineItem[];
}
