import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Car, User, CornerDownLeft, Loader2 } from 'lucide-react';
import api from '@/api';
import { PlateBadge } from '@/components/common/PlateBadge';
import { EmptyState } from '@/components/ui/empty-state';
import { matches, highlightParts } from '@/lib/search';
import { cn } from '@/lib/utils';

interface ClientLite {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}
interface VehicleLite {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year?: number;
  client?: ClientLite | null;
}

type Result =
  | { type: 'vehicle'; item: VehicleLite }
  | { type: 'client'; item: ClientLite };

const MAX_PER_GROUP = 8;

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [vehicles, setVehicles] = useState<VehicleLite[]>([]);
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [active, setActive] = useState(0);

  // Atalho global ⌘K / Ctrl+K para abrir.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onOpenChange]);

  // Carrega os dados na primeira abertura e trava o scroll do fundo.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';

    if (!loaded && !loading) {
      setLoading(true);
      setError(false);
      Promise.all([api.get('/vehicles'), api.get('/clients')])
        .then(([v, c]) => {
          setVehicles(v.data);
          setClients(c.data);
          setLoaded(true);
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, loaded, loading]);

  // Filtragem em memória (memoizada) — nenhuma consulta repetida ao servidor.
  const { vehicleHits, clientHits, flat } = useMemo(() => {
    const q = query.trim();
    if (!q) return { vehicleHits: [], clientHits: [], flat: [] as Result[] };

    const vh = vehicles
      .filter((v) =>
        matches(
          `${v.plate} ${v.brand} ${v.model} ${v.year ?? ''} ${v.client?.name ?? ''} ${v.client?.phone ?? ''} ${v.client?.email ?? ''}`,
          q,
        ),
      )
      .slice(0, MAX_PER_GROUP);

    const ch = clients
      .filter((c) => matches(`${c.name} ${c.phone ?? ''} ${c.email ?? ''}`, q))
      .slice(0, MAX_PER_GROUP);

    const flat: Result[] = [
      ...vh.map((item) => ({ type: 'vehicle' as const, item })),
      ...ch.map((item) => ({ type: 'client' as const, item })),
    ];
    return { vehicleHits: vh, clientHits: ch, flat };
  }, [query, vehicles, clients]);

  // Mantém o índice ativo dentro dos limites quando os resultados mudam.
  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, flat.length - 1)));
  }, [flat.length]);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const select = useCallback(
    (r: Result | undefined) => {
      if (!r) return;
      navigate(r.type === 'vehicle' ? '/vehicles' : '/clients');
      close();
    },
    [navigate, close],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select(flat[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  if (!open) return null;

  const hasQuery = query.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh] bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Busca global"
    >
      <div
        className="w-full max-w-[600px] bg-overlay border border-white/[.12] rounded-lg shadow-[0_16px_48px_rgba(0,0,0,.6)] overflow-hidden animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Campo de busca */}
        <div className="flex items-center gap-3 px-4 border-b border-white/[.08]">
          {loading ? (
            <Loader2 className="w-[18px] h-[18px] text-t3 animate-spin shrink-0" />
          ) : (
            <Search className="w-[18px] h-[18px] text-t3 shrink-0" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            autoFocus
            placeholder="Buscar por placa, carro ou cliente…"
            className="flex-1 h-14 bg-transparent outline-none text-[15px] text-t1 placeholder:text-t3"
          />
          <kbd className="text-[10px] font-semibold text-t3 bg-raised border border-white/[.1] rounded px-1.5 py-0.5">
            Esc
          </kbd>
        </div>

        {/* Resultados */}
        <div className="max-h-[52vh] overflow-y-auto py-2">
          {error ? (
            <div className="py-10">
              <EmptyState text="Erro ao carregar dados" sub="Verifique sua conexão e tente novamente." />
            </div>
          ) : !hasQuery ? (
            <div className="py-10">
              <EmptyState
                icon={Search}
                text="Busque em qualquer direção"
                sub="Placa → carro e dono · Nome → veículos · Carro → placa. Acentos e traços são ignorados."
              />
            </div>
          ) : flat.length === 0 ? (
            <div className="py-10">
              <EmptyState text={`Nada encontrado para "${query.trim()}"`} sub="Tente outra placa, modelo ou nome." />
            </div>
          ) : (
            <>
              {vehicleHits.length > 0 && (
                <Group label="Veículos">
                  {vehicleHits.map((v, i) => (
                    <VehicleRow
                      key={v.id}
                      vehicle={v}
                      query={query}
                      activeState={active === i}
                      onHover={() => setActive(i)}
                      onSelect={() => select({ type: 'vehicle', item: v })}
                    />
                  ))}
                </Group>
              )}
              {clientHits.length > 0 && (
                <Group label="Clientes">
                  {clientHits.map((c, i) => {
                    const idx = vehicleHits.length + i;
                    return (
                      <ClientRow
                        key={c.id}
                        client={c}
                        vehicleCount={vehicles.filter((v) => v.client?.id === c.id).length}
                        query={query}
                        activeState={active === idx}
                        onHover={() => setActive(idx)}
                        onSelect={() => select({ type: 'client', item: c })}
                      />
                    );
                  })}
                </Group>
              )}
            </>
          )}
        </div>

        {/* Rodapé com dicas */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-white/[.08] text-[11px] text-t3">
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navegar
          </span>
          <span className="flex items-center gap-1">
            <Kbd>
              <CornerDownLeft className="w-3 h-3" />
            </Kbd>{' '}
            abrir
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Subcomponentes ─────────────────────────────────────────────────────── */

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <div className="px-4 pt-2 pb-1 text-[10px] font-bold tracking-[.1em] uppercase text-t4">{label}</div>
      {children}
    </div>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightParts(text, query).map((p, i) =>
        p.match ? (
          <mark key={i} className="bg-brand/25 text-t1 rounded-[2px]">
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

interface RowProps {
  query: string;
  activeState: boolean;
  onHover: () => void;
  onSelect: () => void;
}

function VehicleRow({ vehicle: v, query, activeState, onHover, onSelect }: RowProps & { vehicle: VehicleLite }) {
  return (
    <button
      type="button"
      onMouseMove={onHover}
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
        activeState ? 'bg-brand/[.12]' : 'hover:bg-white/[.03]',
      )}
    >
      <span className="w-8 h-8 rounded-sm bg-raised border border-white/[.08] flex items-center justify-center shrink-0">
        <Car className="w-4 h-4 text-t2" strokeWidth={2} />
      </span>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <PlateBadge plate={v.plate} />
        <span className="text-[13.5px] font-semibold text-t1 truncate">
          <Highlight text={`${v.brand} ${v.model}`} query={query} />
          {v.year ? <span className="text-t3 font-normal"> · {v.year}</span> : null}
        </span>
      </div>
      {v.client?.name && (
        <span className="text-[12px] text-t3 truncate max-w-[38%] flex items-center gap-1 shrink-0">
          <User className="w-3 h-3" />
          <Highlight text={v.client.name} query={query} />
        </span>
      )}
    </button>
  );
}

function ClientRow({
  client: c,
  vehicleCount,
  query,
  activeState,
  onHover,
  onSelect,
}: RowProps & { client: ClientLite; vehicleCount: number }) {
  return (
    <button
      type="button"
      onMouseMove={onHover}
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
        activeState ? 'bg-brand/[.12]' : 'hover:bg-white/[.03]',
      )}
    >
      <span className="w-8 h-8 rounded-sm bg-raised border border-white/[.08] flex items-center justify-center shrink-0">
        <User className="w-4 h-4 text-t2" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-semibold text-t1 truncate">
          <Highlight text={c.name} query={query} />
        </div>
        {c.phone && (
          <div className="text-[12px] text-t3 truncate">
            <Highlight text={c.phone} query={query} />
          </div>
        )}
      </div>
      <span className="text-[11px] text-t3 shrink-0">
        {vehicleCount} {vehicleCount === 1 ? 'veículo' : 'veículos'}
      </span>
    </button>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-t3 bg-raised border border-white/[.1] rounded">
      {children}
    </kbd>
  );
}
