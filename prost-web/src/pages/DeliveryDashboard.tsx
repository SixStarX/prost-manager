import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer } from 'lucide-react';
import api from '@/api';
import { useHeaderActions } from '@/components/layout/header-actions';
import { HeaderIconButton } from '@/components/layout/AppHeader';
import { DeliveryBoard } from '@/components/dashboard/DeliveryBoard';
import type { ChecklistSummary } from '@/lib/checklist';
import type { DashboardSummary } from '@/api/types';
import { usePollingResource } from '@/hooks/usePollingResource';
import { clientProfilePath } from '@/lib/nav';

/** Intervalo de atualização automática do quadro (ms). */
const REFRESH_MS = 30_000;

/**
 * Dashboard de Entregas — réplica do app antigo. Todo o conteúdo vive no
 * `DeliveryBoard`; esta página cuida de carregar os dados e do botão de
 * impressão no cabeçalho.
 */
export default function DeliveryDashboard() {
  const navigate = useNavigate();

  useHeaderActions(
    <HeaderIconButton icon={Printer} title="Imprimir Semana" onClick={() => window.print()} />,
    [],
  );

  const fetchItems = useCallback(
    () => api.get<DashboardSummary>('/dashboard').then((r) => r.data.activeChecklists ?? []),
    [],
  );
  const { data: items } = usePollingResource(fetchItems, { intervalMs: REFRESH_MS });

  const openChecklist = useCallback(
    (c: ChecklistSummary) => {
      if (!c.clientId) return;
      navigate(clientProfilePath(c.clientId, { vehicleId: c.vehicleId, checklistId: c.id }));
    },
    [navigate],
  );

  return (
    <main className="flex justify-center px-4 py-6">
      <div className="w-full max-w-6xl">
        <DeliveryBoard items={items} onOpen={openChecklist} />
      </div>
    </main>
  );
}
