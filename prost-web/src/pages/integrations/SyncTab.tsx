import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getErrorMessage } from '@/lib/errors';
import type { OiStatus, OiSyncJob, SyncResult } from './types';
import { fmtDate, isoToBR, todayISO } from './format';
import { SyncStatusBadge, Stat, Spinner } from './ui';

/** Aba de sincronização por data via API da Oficina Inteligente. */
export function SyncTab() {
  const [status, setStatus] = useState<OiStatus | null>(null);
  const [history, setHistory] = useState<OiSyncJob[]>([]);
  const [date, setDate] = useState(todayISO());
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);

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
      const data = (await res.json()) as SyncResult & { message?: string };
      if (!res.ok) throw new Error(data.message ?? `HTTP ${res.status}`);
      setResult(data);
      toast.success(`Sync ${dateBR}: ${data.created} criadas, ${data.updated} atualizadas.`);

      // Recarrega status e histórico
      const [st, hist] = await Promise.all([
        fetch('/api/oi/status').then((r) => r.json()),
        fetch('/api/oi/history?limit=10').then((r) => r.json()),
      ]);
      setStatus(st);
      setHistory(hist);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao sincronizar.'));
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
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${status?.configured ? 'bg-ok shadow-[0_0_6px_rgba(16,185,129,.6)]' : 'bg-brand shadow-[0_0_6px_rgba(124,108,255,.45)]'}`} />
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
              <SyncStatusBadge status={status.lastSync.status} />
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
            <Button onClick={handleSync} disabled={syncing || !status?.configured} className="h-9">
              {syncing ? (
                <>
                  <Spinner />
                  <span className="ml-2">Sincronizando…</span>
                </>
              ) : (
                '🔄 Sincronizar'
              )}
            </Button>
          </div>

          {/* Resultado */}
          {result && (
            <div className="rounded-sm border border-white/[.08] bg-raised overflow-hidden">
              <div className="flex items-center gap-6 px-4 py-3 border-b border-white/[.06]">
                <Stat label="Total OI" value={result.total} />
                <Stat label="Criadas" value={result.created} color="text-ok" />
                <Stat label="Atualizadas" value={result.updated} color="text-sky" />
                <Stat label="Ignoradas" value={result.skipped} color="text-caution" />
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
                      <TableCell>
                        <SyncStatusBadge status={job.status} />
                      </TableCell>
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
