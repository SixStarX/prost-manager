import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { buildBookmarklet } from '@/lib/oi-collector';

// ── Types ──────────────────────────────────────────────────────────────────

interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: string[];
}

interface WebhookEvent {
  id: string;
  source: string;
  event: string;
  status: string;
  error: string | null;
  createdAt: string;
  processedAt: string | null;
}

interface WebhookStats {
  total: number;
  processed: number;
  failed: number;
  ignored: number;
  received: number;
}

interface SyncResult {
  date: string;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

interface OiSyncJob {
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

interface OiStatus {
  configured: boolean;
  lastSync: OiSyncJob | null;
}

// ── Tab config ─────────────────────────────────────────────────────────────

type Tab = 'collector' | 'sync' | 'import' | 'export' | 'webhooks';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'collector', label: 'Coletor OI',     icon: '🤖' },
  { id: 'sync',      label: 'Sincronizar API', icon: '🔄' },
  { id: 'import',    label: 'Importar CSV',    icon: '📥' },
  { id: 'export',    label: 'Exportar CSV',    icon: '📤' },
  { id: 'webhooks',  label: 'Webhooks',         icon: '🔗' },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function syncStatusBadge(status: string) {
  const map: Record<string, 'done' | 'destructive'> = {
    DONE:   'done',
    FAILED: 'destructive',
  };
  return (
    <Badge variant={map[status] ?? 'default'}>
      {status === 'DONE' ? 'Concluído' : 'Falhou'}
    </Badge>
  );
}

function webhookStatusBadge(status: string) {
  const map: Record<string, 'done' | 'pending' | 'in-progress' | 'destructive'> = {
    PROCESSED: 'done',
    RECEIVED:  'in-progress',
    IGNORED:   'pending',
    FAILED:    'destructive',
  };
  const labels: Record<string, string> = {
    PROCESSED: 'Processado',
    RECEIVED:  'Recebido',
    IGNORED:   'Ignorado',
    FAILED:    'Falhou',
  };
  return <Badge variant={map[status] ?? 'default'}>{labels[status] ?? status}</Badge>;
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function todayISO() {
  return new Date().toISOString().split('T')[0]; // yyyy-MM-dd para <input type="date">
}

function isoToBR(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ── Stat chip ─────────────────────────────────────────────────────────────

function Stat({ label, value, color = 'text-t1' }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-xl font-black tabular-nums ${color}`}>{value}</span>
      <span className="text-[10px] font-medium text-t4 uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Coletor tab (bookmarklet) ───────────────────────────────────────────────

function CollectorTab() {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [history, setHistory] = useState<OiSyncJob[]>([]);

  // Backend roda na porta 3000; o bookmarklet (fora do app) precisa do endereço absoluto.
  const apiUrl = `${window.location.protocol}//${window.location.hostname}:3000/oi/scrape`;
  const bookmarklet = buildBookmarklet(apiUrl);

  // React sanitiza href="javascript:..."; injetamos via setAttribute para preservar o bookmarklet.
  useEffect(() => {
    if (linkRef.current) linkRef.current.setAttribute('href', bookmarklet);
  }, [bookmarklet]);

  useEffect(() => {
    fetch('/api/oi/history?limit=10')
      .then((r) => r.json())
      .then((all: OiSyncJob[]) => setHistory(all.filter((j) => j.source === 'scrape')))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-5">
      {/* Instalação */}
      <Card>
        <CardHeader><CardTitle>1. Instale o Coletor</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[13px] text-t3">
            O Coletor é um botão que fica na barra de favoritos do seu navegador. Como o painel da
            Oficina Inteligente não tem botão de exportar, este coletor lê os dados da tabela na tela
            e envia direto para o Prost.
          </p>

          <div className="bg-raised border border-white/[.08] rounded-sm p-4 flex items-center gap-4">
            <span className="text-[13px] text-t3">Arraste este botão para a barra de favoritos →</span>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              ref={linkRef}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toast.info('Não clique aqui — arraste este botão para a barra de favoritos do navegador.');
              }}
              draggable
              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-brand text-white font-bold text-[13px] cursor-grab active:cursor-grabbing
                         shadow-[0_0_20px_rgba(230,57,70,.3)] select-none"
            >
              🔧 Coletor Prost
            </a>
          </div>

          <p className="text-[11.5px] text-t4">
            Não vê a barra de favoritos? No Chrome/Edge pressione <kbd className="px-1.5 py-0.5 bg-overlay rounded-xs border border-white/[.1] text-t3">Ctrl</kbd> +
            <kbd className="px-1.5 py-0.5 bg-overlay rounded-xs border border-white/[.1] text-t3 ml-1">Shift</kbd> +
            <kbd className="px-1.5 py-0.5 bg-overlay rounded-xs border border-white/[.1] text-t3 ml-1">B</kbd> para exibi-la.
          </p>
        </CardContent>
      </Card>

      {/* Como usar */}
      <Card>
        <CardHeader><CardTitle>2. Como coletar os dados</CardTitle></CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {[
              'Faça login no painel da Oficina Inteligente normalmente (resolvendo o captcha).',
              'Abra o relatório que deseja trazer: Clientes, Veículos ou Ordens de Serviço.',
              'Se houver paginação, deixe a tabela mostrando o máximo de linhas por página.',
              'Clique no favorito "🔧 Coletor Prost". Um painel vai aparecer no canto da tela.',
              'No painel, encontre a tabela certa e clique no tipo de dado (Clientes / Veículos / Ordens).',
              'Pronto! Os dados são enviados ao Prost e o painel mostra quantos foram criados.',
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-brand/[.15] border border-brand/30 flex items-center justify-center text-[11px] font-black text-brand shrink-0">
                  {i + 1}
                </span>
                <span className="text-[13px] text-t2 pt-0.5">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-4 bg-raised border border-white/[.06] rounded-sm px-4 py-3 space-y-1">
            <p className="text-[12px] text-t3">
              <b className="text-t2">Ordem recomendada:</b> colete primeiro os <b>Clientes</b>, depois os <b>Veículos</b>,
              e por último as <b>Ordens de Serviço</b> — assim os vínculos (veículo→dono, OS→cliente) são montados corretamente.
            </p>
            <p className="text-[11.5px] text-t4">
              ⚠️ O backend do Prost precisa estar rodando em <code className="text-sky">localhost:3000</code> no mesmo computador.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de coletas */}
      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Histórico de coletas</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-sm border border-white/[.06]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Criados</TableHead>
                    <TableHead className="text-right">Atualizados</TableHead>
                    <TableHead className="text-right">Ignorados</TableHead>
                    <TableHead>Quando</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="text-[12px] text-t2 capitalize">{job.kind}</TableCell>
                      <TableCell>{syncStatusBadge(job.status)}</TableCell>
                      <TableCell className="text-right tabular-nums text-[12px] text-t3">{job.total}</TableCell>
                      <TableCell className="text-right tabular-nums text-[12px] text-ok">{job.created}</TableCell>
                      <TableCell className="text-right tabular-nums text-[12px] text-sky">{job.updated}</TableCell>
                      <TableCell className="text-right tabular-nums text-[12px] text-caution">{job.skipped}</TableCell>
                      <TableCell className="text-[12px] text-t4 whitespace-nowrap">{fmtDate(job.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── OI Sync tab ────────────────────────────────────────────────────────────

function SyncTab() {
  const [status, setStatus]   = useState<OiStatus | null>(null);
  const [history, setHistory] = useState<OiSyncJob[]>([]);
  const [date, setDate]       = useState(todayISO());
  const [syncing, setSyncing] = useState(false);
  const [result, setResult]   = useState<SyncResult | null>(null);

  useEffect(() => {
    fetch('/api/oi/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});

    fetch('/api/oi/history?limit=10')
      .then((r) => r.json())
      .then(setHistory)
      .catch(() => {});
  }, []);

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    try {
      const dateBR = isoToBR(date);
      const res = await fetch(`/api/oi/sync?date=${encodeURIComponent(dateBR)}`, {
        method: 'POST',
      });
      const data: SyncResult = await res.json();
      if (!res.ok) throw new Error((data as any)?.message ?? `HTTP ${res.status}`);
      setResult(data);
      toast.success(`Sync ${dateBR}: ${data.created} criadas, ${data.updated} atualizadas.`);

      // Recarrega status e histórico
      const [st, hist] = await Promise.all([
        fetch('/api/oi/status').then((r) => r.json()),
        fetch('/api/oi/history?limit=10').then((r) => r.json()),
      ]);
      setStatus(st);
      setHistory(hist);
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao sincronizar.');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-5">

      {/* Status do token */}
      <Card>
        <CardHeader>
          <CardTitle>Conexão com Oficina Inteligente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${status?.configured ? 'bg-ok shadow-[0_0_6px_rgba(52,211,153,.6)]' : 'bg-brand shadow-[0_0_6px_rgba(230,57,70,.4)]'}`} />
            <span className="text-[13px] text-t2 font-medium">
              {status?.configured
                ? 'TOKEN configurado — API pronta para sincronização'
                : 'TOKEN não configurado'}
            </span>
          </div>

          {!status?.configured && (
            <div className="bg-raised border border-white/[.06] rounded-sm px-4 py-3 space-y-1.5">
              <p className="text-[12.5px] text-t3">
                Solicite o TOKEN em{' '}
                <a href="mailto:suporte@oficinainteligente.com.br" className="text-sky underline underline-offset-2">
                  suporte@oficinainteligente.com.br
                </a>{' '}
                e defina no servidor:
              </p>
              <code className="block text-[12px] font-mono text-sky bg-overlay px-2.5 py-1.5 rounded-xs border border-white/[.06]">
                OI_TOKEN=seu_token_aqui
              </code>
            </div>
          )}

          {status?.lastSync && (
            <div className="flex items-center gap-4 pt-1 text-[12.5px] text-t3">
              <span>Última sync:</span>
              <span className="text-t2 font-medium">{status.lastSync.date}</span>
              {syncStatusBadge(status.lastSync.status)}
              <span className="text-t4">{fmtDate(status.lastSync.createdAt)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sincronização manual */}
      <Card>
        <CardHeader>
          <CardTitle>Sincronização manual por data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[13px] text-t3">
            Busca todas as Ordens de Serviço da Oficina Inteligente para a data selecionada
            e importa automaticamente clientes, veículos e OS no Prost.
          </p>

          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[.08em] text-t4">Data</label>
              <input
                type="date"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 rounded-sm border border-white/[.10] bg-surface px-3 text-[13px] text-t1
                           focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30
                           [color-scheme:dark]"
              />
            </div>
            <Button
              onClick={handleSync}
              disabled={syncing || !status?.configured}
              className="h-9"
            >
              {syncing ? (
                <><Spinner /><span className="ml-2">Sincronizando…</span></>
              ) : (
                '🔄 Sincronizar'
              )}
            </Button>
          </div>

          {/* Resultado */}
          {result && (
            <div className="rounded-sm border border-white/[.08] bg-raised overflow-hidden">
              <div className="flex items-center gap-6 px-4 py-3 border-b border-white/[.06]">
                <Stat label="Total OI"   value={result.total}   />
                <Stat label="Criadas"    value={result.created} color="text-ok"      />
                <Stat label="Atualizadas" value={result.updated} color="text-sky"    />
                <Stat label="Ignoradas"  value={result.skipped} color="text-caution" />
              </div>
              {result.errors.length > 0 && (
                <ul className="px-4 py-2 space-y-1 max-h-32 overflow-y-auto">
                  {result.errors.map((e, i) => (
                    <li key={i} className="text-[11.5px] text-t3 font-mono">{e}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de syncs */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de sincronizações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-sm border border-white/[.06]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Criadas</TableHead>
                    <TableHead className="text-right">Atualizadas</TableHead>
                    <TableHead className="text-right">Ignoradas</TableHead>
                    <TableHead>Executado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono text-[12px] text-t2">{job.date}</TableCell>
                      <TableCell>{syncStatusBadge(job.status)}</TableCell>
                      <TableCell className="text-right tabular-nums text-[12px] text-t3">{job.total}</TableCell>
                      <TableCell className="text-right tabular-nums text-[12px] text-ok">{job.created}</TableCell>
                      <TableCell className="text-right tabular-nums text-[12px] text-sky">{job.updated}</TableCell>
                      <TableCell className="text-right tabular-nums text-[12px] text-caution">{job.skipped}</TableCell>
                      <TableCell className="text-[12px] text-t4 whitespace-nowrap">{fmtDate(job.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Como funciona */}
      <Card>
        <CardHeader>
          <CardTitle>Como funciona a sincronização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: '1',
                title: 'Busca na API OI',
                desc: 'O servidor consulta a API da Oficina Inteligente para a data selecionada e retorna todas as OS do dia.',
              },
              {
                step: '2',
                title: 'Cria clientes e veículos',
                desc: 'Para cada OS, o cliente é localizado por CPF/CNPJ ou nome. Se não existir, é criado automaticamente junto com o veículo.',
              },
              {
                step: '3',
                title: 'Importa as OS',
                desc: 'Cada OS é criada no Prost com diagnóstico, itens e valor. Se já existir (mesmo ID), apenas o status e total são atualizados.',
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-brand/[.15] border border-brand/30 flex items-center justify-center text-[12px] font-black text-brand shrink-0 mt-0.5">
                  {s.step}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-t1">{s.title}</div>
                  <div className="text-[12px] text-t3 mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11.5px] text-t4 mt-4 border-t border-white/[.06] pt-3">
            ⚠️ A API da Oficina Inteligente bloqueia requisições com intervalo inferior a 5 minutos do mesmo token.
            Não execute múltiplas sincronizações em sequência rápida.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── CSV Upload card ────────────────────────────────────────────────────────

function UploadCard({
  title, description, endpoint, templateHint,
}: {
  title: string;
  description: string;
  endpoint: string;
  templateHint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<ImportResult | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/${endpoint}`, { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? `HTTP ${res.status}`);
      }
      const data: ImportResult = await res.json();
      setResult(data);
      toast.success(`${data.imported} registros importados com sucesso.`);
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao importar arquivo.');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-[13px] text-t3">{description}</p>
        <p className="text-[11.5px] text-t4 font-mono bg-raised rounded-xs px-2.5 py-2 border border-white/[.06]">
          {templateHint}
        </p>

        <div
          className="border-2 border-dashed border-white/[.10] rounded-sm flex flex-col items-center justify-center gap-2 py-8 px-4 text-center
                     transition-colors duration-150 hover:border-brand/40 hover:bg-brand/[.03] cursor-pointer"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
        >
          <span className="text-3xl">📄</span>
          <p className="text-[13px] font-medium text-t2">
            Arraste um CSV ou <span className="text-brand underline underline-offset-2">clique para selecionar</span>
          </p>
          <p className="text-[11px] text-t4">Máximo 5 MB · .csv ou .txt</p>
          <input
            ref={inputRef} type="file" accept=".csv,.txt" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-[13px] text-t3"><Spinner />Processando…</div>
        )}

        {result && (
          <div className="rounded-sm border border-white/[.08] bg-raised overflow-hidden">
            <div className="flex items-center gap-5 px-4 py-3 border-b border-white/[.06]">
              <Stat label="Total"      value={result.total}              />
              <Stat label="Importados" value={result.imported} color="text-ok"      />
              <Stat label="Ignorados"  value={result.skipped}  color="text-caution" />
              {result.errors.length > 0 && (
                <Stat label="Erros" value={result.errors.length} color="text-brand" />
              )}
            </div>
            {result.errors.length > 0 && (
              <ul className="px-4 py-2 space-y-1 max-h-36 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-[11.5px] text-t3 font-mono">{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Export tab ─────────────────────────────────────────────────────────────

function ExportTab() {
  const exports = [
    {
      label: 'Clientes',
      icon: '👥',
      description: 'Nome, telefone, e-mail e data de cadastro de todos os clientes.',
      href: '/api/integrations/export/clients',
      filename: 'prost-clientes.csv',
    },
    {
      label: 'Veículos',
      icon: '🚗',
      description: 'Placa, marca, modelo, ano e nome do proprietário.',
      href: '/api/integrations/export/vehicles',
      filename: 'prost-veiculos.csv',
    },
    {
      label: 'Ordens de Serviço',
      icon: '📋',
      description: 'Número, descrição, status, total e data de todas as OS.',
      href: '/api/integrations/export/service-orders',
      filename: 'prost-ordens-servico.csv',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {exports.map((ex) => (
        <Card key={ex.label}>
          <CardContent className="flex flex-col items-start gap-3 pt-5">
            <span className="text-3xl">{ex.icon}</span>
            <div>
              <div className="text-[14px] font-semibold text-t1">{ex.label}</div>
              <div className="text-[12.5px] text-t3 mt-0.5">{ex.description}</div>
            </div>
            <a href={ex.href} download={ex.filename} className="mt-auto">
              <Button size="sm" variant="secondary">⬇ Baixar CSV</Button>
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Webhooks tab ───────────────────────────────────────────────────────────

function WebhooksTab() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [stats, setStats]   = useState<WebhookStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded]   = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [evRes, stRes] = await Promise.all([
        fetch('/api/webhooks/events?limit=50'),
        fetch('/api/webhooks/stats'),
      ]);
      setEvents(await evRes.json());
      setStats(await stRes.json());
      setLoaded(true);
    } catch {
      toast.error('Erro ao carregar eventos de webhook.');
    } finally {
      setLoading(false);
    }
  }

  const webhookUrl = `${window.location.origin.replace('5173', '3000')}/webhooks/oficina-inteligente`;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader><CardTitle>Endpoint de recebimento</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-[13px] text-t3">
            Configure este URL na plataforma <strong className="text-t2">Oficina Inteligente</strong> como destino dos webhooks.
            Opcionalmente defina <code className="text-brand">OI_WEBHOOK_SECRET</code> para verificação HMAC-SHA256.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[12.5px] font-mono text-sky bg-raised border border-white/[.08] rounded-xs px-3 py-2 truncate">
              POST {webhookUrl}
            </code>
            <Button size="sm" variant="outline"
              onClick={() => { navigator.clipboard.writeText(`POST ${webhookUrl}`); toast.success('URL copiada!'); }}>
              Copiar
            </Button>
          </div>
          <div className="text-[11.5px] text-t4">
            Cabeçalhos suportados: <code className="text-sky">X-OI-Signature</code> (sha256=…) · <code className="text-sky">X-OI-Event</code>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Log de eventos</CardTitle>
          <Button size="sm" variant="secondary" onClick={load} disabled={loading}>
            {loading ? 'Carregando…' : loaded ? '↻ Atualizar' : '↻ Carregar eventos'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats && (
            <div className="flex gap-6 px-4 py-3 bg-raised rounded-sm border border-white/[.06]">
              <Stat label="Total"       value={stats.total}                          />
              <Stat label="Processados" value={stats.processed} color="text-ok"      />
              <Stat label="Falhas"      value={stats.failed}    color="text-brand"   />
              <Stat label="Ignorados"   value={stats.ignored}   color="text-caution" />
              <Stat label="Pendentes"   value={stats.received}  color="text-sky"     />
            </div>
          )}

          {!loaded && !loading && (
            <div className="py-10 text-center text-[13px] text-t4">
              Clique em "Carregar eventos" para visualizar o histórico de webhooks recebidos.
            </div>
          )}
          {loaded && events.length === 0 && (
            <div className="py-10 text-center text-[13px] text-t4">Nenhum evento recebido ainda.</div>
          )}
          {events.length > 0 && (
            <div className="overflow-x-auto rounded-sm border border-white/[.06]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recebido</TableHead>
                    <TableHead>Processado</TableHead>
                    <TableHead>Erro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell className="font-mono text-[12px] text-sky">{ev.event}</TableCell>
                      <TableCell className="text-[12px] text-t3">{ev.source}</TableCell>
                      <TableCell>{webhookStatusBadge(ev.status)}</TableCell>
                      <TableCell className="text-[12px] text-t3 whitespace-nowrap">{fmtDate(ev.createdAt)}</TableCell>
                      <TableCell className="text-[12px] text-t3 whitespace-nowrap">{fmtDate(ev.processedAt)}</TableCell>
                      <TableCell className="text-[11.5px] text-brand max-w-[200px] truncate" title={ev.error ?? undefined}>
                        {ev.error ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function Integrations() {
  const [tab, setTab] = useState<Tab>('collector');

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
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xs text-[13px] font-medium transition-all duration-150
              ${tab === t.id
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
      {tab === 'sync'     && <SyncTab />}
      {tab === 'import'   && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <UploadCard
            title="Importar Clientes"
            description="Importe clientes de um CSV. Clientes já existentes (mesmo nome) são ignorados."
            endpoint="integrations/import/clients"
            templateHint="Colunas: nome, telefone (ou celular), email"
          />
          <UploadCard
            title="Importar Veículos"
            description="Importe veículos com vínculo ao proprietário. Importe os clientes primeiro."
            endpoint="integrations/import/vehicles"
            templateHint="Colunas: placa, marca, modelo, ano, cliente (ou proprietario)"
          />
        </div>
      )}
      {tab === 'export'   && <ExportTab />}
      {tab === 'webhooks' && <WebhooksTab />}
    </div>
  );
}
