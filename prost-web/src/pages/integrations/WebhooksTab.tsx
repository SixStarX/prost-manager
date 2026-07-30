import { useState } from 'react';
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
import type { WebhookEvent, WebhookStats } from './types';
import { fmtDate } from './format';
import { WebhookStatusBadge, Stat } from './ui';

/** Aba de webhooks: URL do endpoint + log de eventos recebidos (carregado sob demanda). */
export function WebhooksTab() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [stats, setStats] = useState<WebhookStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

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
        <CardHeader>
          <CardTitle>Endpoint de recebimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-[13px] text-t3">
            Configure este URL na plataforma <strong className="text-t2">Oficina Inteligente</strong> como destino dos webhooks.
            Opcionalmente defina <code className="text-brand">OI_WEBHOOK_SECRET</code> para verificação HMAC-SHA256.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[12.5px] font-mono text-sky bg-raised border border-white/[.08] rounded-xs px-3 py-2 truncate">
              POST {webhookUrl}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(`POST ${webhookUrl}`);
                toast.success('URL copiada!');
              }}
            >
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
              <Stat label="Total" value={stats.total} />
              <Stat label="Processados" value={stats.processed} color="text-ok" />
              <Stat label="Falhas" value={stats.failed} color="text-brand" />
              <Stat label="Ignorados" value={stats.ignored} color="text-caution" />
              <Stat label="Pendentes" value={stats.received} color="text-sky" />
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
                      <TableCell>
                        <WebhookStatusBadge status={ev.status} />
                      </TableCell>
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
