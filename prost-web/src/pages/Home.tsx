import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Car,
  ClipboardList,
  LayoutDashboard,
  Plus,
  Search,
} from 'lucide-react';
import api from '@/api';
import { checklistStatusLabel, type ChecklistSummary } from '@/lib/checklist';
import { clientProfilePath } from '@/lib/nav';

/** Cor do pill de status — idêntica ao app antigo (sólida, texto branco). */
const STATUS_PILL: Record<string, string> = {
  IN_SERVICE: 'bg-blue-500',
  WAITING_PARTS: 'bg-yellow-500',
  READY: 'bg-green-500',
  DELIVERED: 'bg-secondary',
};

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

/**
 * Tela inicial — réplica do app antigo: dois cartões de ação e a lista de
 * "Veículos em Serviço" com busca por protocolo, cliente, placa ou veículo.
 */
export default function Home() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ChecklistSummary[] | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get('/dashboard')
      .then((r) => active && setItems(r.data.activeChecklists ?? []))
      .catch(() => active && setItems([]));
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const list = items ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) =>
      [c.protocol, c.clientName, c.vPlate, c.vBrand, c.vModel]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [items, query]);

  const openChecklist = useCallback(
    (c: ChecklistSummary) => {
      if (!c.clientId) return;
      navigate(clientProfilePath(c.clientId, { vehicleId: c.vehicleId, checklistId: c.id }));
    },
    [navigate],
  );

  return (
    <main className="flex justify-center px-4 py-8">
      <div className="w-full max-w-5xl">
        {/* ── Ações principais ─────────────────────────────────────────── */}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <button
            onClick={() => navigate('/checklist/new')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-left transition-all hover:scale-[1.02] hover:shadow-2xl"
          >
            <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10" />
            <div className="relative z-10">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-white">Novo Check-list</h2>
              <p className="text-sm text-white/80">
                Iniciar uma nova inspeção de entrada de veículo
              </p>
              <ArrowRight className="mt-4 h-6 w-6 text-white transition-transform group-hover:translate-x-2" />
            </div>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-left transition-all hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl"
          >
            <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5" />
            <div className="relative z-10">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <LayoutDashboard className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-foreground">Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                Acompanhar entregas da semana e status dos veículos
              </p>
              <ArrowRight className="mt-4 h-6 w-6 text-primary transition-transform group-hover:translate-x-2" />
            </div>
          </button>
        </div>

        {/* ── Veículos em Serviço ──────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Veículos em Serviço</h3>
            </div>
            <span className="text-sm text-muted-foreground">
              {items === null ? '—' : `${filtered.length} veículo(s)`}
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por protocolo, cliente, placa ou veículo..."
              className="flex h-10 w-full rounded-md border border-border bg-card py-2 pl-10 pr-3 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
            />
          </div>

          <div className="grid gap-3">
            {items === null ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-[98px] rounded-xl" />
              ))
            ) : filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nenhum veículo encontrado
              </p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openChecklist(c)}
                  className="group w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-card/80"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-primary">
                          {c.protocol ?? '—'}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                            STATUS_PILL[c.status] ?? 'bg-secondary'
                          }`}
                        >
                          {checklistStatusLabel(c.status)}
                        </span>
                      </div>
                      <p className="truncate font-medium text-foreground">
                        {c.clientName || '—'}
                      </p>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Car className="h-4 w-4" />
                          {[c.vBrand, c.vModel].filter(Boolean).join(' ') || '—'}
                        </span>
                        <span className="font-mono">{c.vPlate ?? '—'}</span>
                      </div>
                      {c.expectedDate && (
                        <div className="mt-1 text-sm text-muted-foreground">
                          Previsão: {dateFmt.format(new Date(c.expectedDate))}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
