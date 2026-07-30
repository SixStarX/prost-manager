/** Tipos das respostas da área de Integrações (Oficina Inteligente, CSV, webhooks). */

export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: string[];
}

export interface WebhookEvent {
  id: string;
  source: string;
  event: string;
  status: string;
  error: string | null;
  createdAt: string;
  processedAt: string | null;
}

export interface WebhookStats {
  total: number;
  processed: number;
  failed: number;
  ignored: number;
  received: number;
}

export interface SyncResult {
  date: string;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface OiSyncJob {
  id: string;
  source: string;
  kind: string;
  date: string;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string | null;
  status: string;
  createdAt: string;
}

export interface OiStatus {
  configured: boolean;
  lastSync: OiSyncJob | null;
}

/** Abas da página de Integrações. */
export type IntegrationsTab = 'collector' | 'sync' | 'import' | 'export' | 'webhooks';

export const INTEGRATIONS_TABS: { id: IntegrationsTab; label: string; icon: string }[] = [
  { id: 'collector', label: 'Coletor OI', icon: '🤖' },
  { id: 'sync', label: 'Sincronizar API', icon: '🔄' },
  { id: 'import', label: 'Importar CSV', icon: '📥' },
  { id: 'export', label: 'Exportar CSV', icon: '📤' },
  { id: 'webhooks', label: 'Webhooks', icon: '🔗' },
];
