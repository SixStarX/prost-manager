import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ClipboardList, ClipboardPlus, Plus } from 'lucide-react';
import api from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardTitleIcon, CardCount, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { SkeletonRows } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PlateBadge } from '@/components/common/PlateBadge';
import { statusLabel, statusVariant } from '@/lib/status';
import { clientProfilePath } from '@/lib/nav';
import type { Diagnostic, ServiceOrder } from '@/api/types';

const EMPTY = { diagnosticId: '', notes: '', expectedDeliveryDate: '' };

/** ISO → valor de <input type="date"> (yyyy-mm-dd) no fuso local. */
function toDateInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** yyyy-mm-dd → ISO ao meio-dia local (evita deslocar o dia por fuso). */
function toIsoOrNull(value: string): string | null {
  return value ? new Date(`${value}T12:00:00`).toISOString() : null;
}

export default function ServiceOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceOrder[] | null>(null);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/service-orders').then((r) => setOrders(r.data));
  useEffect(() => {
    load();
    api.get('/diagnostics').then((r) => setDiagnostics(r.data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/service-orders', {
        diagnosticId: form.diagnosticId,
        notes: form.notes || undefined,
        expectedDeliveryDate: toIsoOrNull(form.expectedDeliveryDate) ?? undefined,
      });
      setForm(EMPTY);
      await load();
      toast.success('Ordem de serviço criada!');
    } catch {
      toast.error('Erro ao criar ordem de serviço.');
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await api.patch(`/service-orders/${id}`, { status });
      await load();
      toast.success(`Status atualizado para "${statusLabel(status)}"`);
    } catch {
      toast.error('Erro ao atualizar status.');
    }
  }

  async function updateDelivery(id: string, value: string) {
    try {
      await api.patch(`/service-orders/${id}`, { expectedDeliveryDate: toIsoOrNull(value) });
      await load();
      toast.success(value ? 'Previsão de entrega atualizada' : 'Previsão de entrega removida');
    } catch {
      toast.error('Erro ao atualizar previsão de entrega.');
    }
  }

  const list = orders ?? [];
  const openCount = list.filter((o) => o.status === 'OPEN').length;
  const inProgCount = list.filter((o) => o.status === 'IN_PROGRESS').length;
  const doneCount = list.filter((o) => o.status === 'DONE').length;

  return (
    <>
      {/* Mini stats */}
      {list.length > 0 && (
        <div className="flex gap-3 mb-5 flex-wrap">
          {(
            [
              { label: 'Abertas', count: openCount, variant: 'open' },
              { label: 'Em andamento', count: inProgCount, variant: 'in-progress' },
              { label: 'Concluídas', count: doneCount, variant: 'done' },
            ] as const
          ).map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-surface border border-white/[.05] rounded-md text-[12.5px] font-medium text-t2 shadow-[0_1px_3px_rgba(0,0,0,.6)]"
            >
              <Badge variant={s.variant}>{s.count}</Badge>
              {s.label}
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            <CardTitleIcon icon={ClipboardPlus} />
            Nova Ordem de Serviço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[14px]">
              <div className="flex flex-col gap-1.5">
                <Label>
                  Diagnóstico <span className="text-brand">*</span>
                </Label>
                <Select required value={form.diagnosticId} onValueChange={(v) => setForm((p) => ({ ...p, diagnosticId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o diagnóstico…" />
                  </SelectTrigger>
                  <SelectContent>
                    {diagnostics.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        [{d.vehicle?.plate}] {d.description.slice(0, 55)}
                        {d.description.length > 55 ? '…' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Observações</Label>
                <Input
                  placeholder="Informações adicionais para o técnico…"
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Previsão de entrega</Label>
                <Input
                  type="date"
                  value={form.expectedDeliveryDate}
                  onChange={(e) => setForm((p) => ({ ...p, expectedDeliveryDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2.5 mt-[18px]">
              <Button type="submit" disabled={saving}>
                <Plus /> {saving ? 'Criando…' : 'Criar OS'}
              </Button>
              {!saving && form.diagnosticId && (
                <Button type="button" variant="secondary" onClick={() => setForm(EMPTY)}>
                  Limpar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <CardTitleIcon icon={ClipboardList} />
            Ordens de Serviço
          </CardTitle>
          {orders && <CardCount>{orders.length} total</CardCount>}
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Veículo</TableHead>
              <TableHead>Proprietário</TableHead>
              <TableHead>Diagnóstico</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead>Previsão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Atualizar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!orders ? (
              <SkeletonRows rows={4} cols={7} />
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-14">
                  <EmptyState icon={ClipboardList} text="Nenhuma ordem de serviço cadastrada" sub="Selecione um diagnóstico e crie a primeira OS" />
                </TableCell>
              </TableRow>
            ) : (
              orders.map((os) => {
                const vehicle = os.diagnostic?.vehicle;
                const client = vehicle?.client;
                return (
                <TableRow key={os.id}>
                  <TableCell>
                    <PlateBadge plate={vehicle?.plate} />
                    <span className="ml-2">
                      {vehicle?.brand} {vehicle?.model}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-t1">
                    {client?.id ? (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(clientProfilePath(client.id, { vehicleId: vehicle?.id }))
                        }
                        className="text-left underline-offset-4 transition-colors hover:text-primary hover:underline"
                        title={`Abrir perfil de ${client.name}`}
                      >
                        {client.name}
                      </button>
                    ) : (
                      client?.name
                    )}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate">{os.diagnostic?.description}</TableCell>
                  <TableCell>{os.notes || <span className="text-t3">—</span>}</TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={toDateInput(os.expectedDeliveryDate)}
                      onChange={(e) => updateDelivery(os.id, e.target.value)}
                      className="h-8 w-[150px] text-xs py-1"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(os.status)}>{statusLabel(os.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={os.status} onValueChange={(v) => updateStatus(os.id, v)}>
                      <SelectTrigger className="w-[140px] h-8 text-xs py-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Aberta</SelectItem>
                        <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
                        <SelectItem value="DONE">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
