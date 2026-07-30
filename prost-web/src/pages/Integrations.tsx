import { useState } from 'react';
import { INTEGRATIONS_TABS, type IntegrationsTab } from './integrations/types';
import { CollectorTab } from './integrations/CollectorTab';
import { SyncTab } from './integrations/SyncTab';
import { ImportTab } from './integrations/ImportTab';
import { ExportTab } from './integrations/ExportTab';
import { WebhooksTab } from './integrations/WebhooksTab';

/**
 * Integrações — shell de abas. Cada aba vive no próprio arquivo em
 * `./integrations/`, mantendo esta página como um índice enxuto.
 */
export default function Integrations() {
  const [tab, setTab] = useState<IntegrationsTab>('collector');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-black text-t1 tracking-tight">Integrações</h1>
        <p className="text-[13px] text-t3 mt-0.5">
          Traga os dados da Oficina Inteligente pelo Coletor, importe/exporte CSVs ou receba webhooks.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface border border-white/[.06] rounded-sm p-1 w-fit">
        {INTEGRATIONS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xs text-[13px] font-medium transition-all duration-150
              ${
                tab === t.id
                  ? 'bg-raised text-t1 shadow-[0_1px_3px_rgba(0,0,0,.4)]'
                  : 'text-t3 hover:text-t2 hover:bg-white/[.03]'
              }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'collector' && <CollectorTab />}
      {tab === 'sync' && <SyncTab />}
      {tab === 'import' && <ImportTab />}
      {tab === 'export' && <ExportTab />}
      {tab === 'webhooks' && <WebhooksTab />}
    </div>
  );
}
