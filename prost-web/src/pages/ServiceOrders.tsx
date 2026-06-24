import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardTitleIcon, CardCount, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlateBadge, EmptyState } from './Dashboard';

const EMPTY = { diagnosticId: '', notes: '' };

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Aberta', IN_PROGRESS: 'Em andamento', DONE: 'Concluída',
};
const STATUS_VARIANT: Record<string, 'open' | 'in-progress' | 'done'> = {
  OPEN: 'open', IN_PROGRESS: 'in-progress', DONE: 'done',
};

export default function ServiceOrders() {
  const [orders, setOrders]           = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [form, setForm]               = useState(EMPTY);
  const [saving, setSaving]           = useState(false);

  const load = () => api.get('/service-orders').then((r) => setOrders(r.data));
  useEffect(() => {
    load();
    api.get('/diagnostics').then((r) => setDiagnostics(r.data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/service-orders', form);
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
      toast.success(`Status atualizado para "${STATUS_LABEL[status]}"`);
    } catch {
      toast.error('Erro ao atualizar status.');
    }
  }

  const openCount   = orders.filter((o) => o.status === 'OPEN').length;
  const inProgCount = orders.filter((o) => o.status === 'IN_PROGRESS').length;
  const doneCount   = orders.filter((o) => o.status === 'DONE').length;

  return (
    <>
      {/* Mini stats */}
      {orders.length > 0 && (
        <div className="flex gap-3 mb-5 flex-wrap">
          {([
            { label: 'Abertas',      count: openCount,   variant: 'open'        },
            { label: 'Em andamento', count: inProgCount, variant: 'in-progress' },
            { label: 'Concluídas',   count: doneCount,   variant: 'done'        },
          ] as const).map((s) => (
            <div key={s.label}
                 className="flex items-center gap-2.5 px-4 py-2.5 bg-surface border border-white/[.05]
                            rounded-md text-[12.5px] font-medium text-t2 shadow-[0_1px_3px_rgba(0,0,0,.6)]">
              <Badge variant={s.variant}>{s.count}</Badge>
              {s.label}
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle><CardTitleIcon>➕</CardTitleIcon>Nova Ordem de Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[14px]">
              <div className="flex flex-col gap-1.5">
                <Label>Diagnóstico <span className="text-brand">*</span></Label>
                <Select
                  required
                  value={form.diagnosticId}
                  onValueChange={(v) => setForm((p) => ({ ...p, diagnosticId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o diagnóstico..." />
                  </SelectTrigger>
                  <SelectContent>
                    {diagnostics.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        [{d.vehicle?.plate}] {d.description.slice(0, 55)}{d.description.length > 55 ? '…' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Observações</Label>
                <Input
                  placeholder="Informações adicionais para o técnico..."
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2.5 mt-[18px]">
              <Button type="submit" disabled={saving}>
                {saving ? '…' : '+'}&nbsp;{saving ? 'Criando...' : 'Criar OS'}
              </Button>
              {!saving && form.diagnosticId && (
                <Button type="button" variant="secondary" onClick={() => setForm(EMPTY)}>Limpar</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle><CardTitleIcon>📋</CardTitleIcon>Ordens de Serviço</CardTitle>
          <CardCount>{orders.length} total</CardCount>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Veículo</TableHead><TableHead>Proprietário</TableHead>
              <TableHead>Diagnóstico</TableHead><TableHead>Observações</TableHead>
              <TableHead>Status</TableHead><TableHead>Atualizar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-14">
                  <EmptyState icon="📋" text="Nenhuma ordem de serviço cadastrada" sub="Selecione um diagnóstico e crie a primeira OS" />
                </TableCell>
              </TableRow>
            ) : orders.map((os) => (
              <TableRow key={os.id}>
                <TableCell>
                  <PlateBadge plate={os.diagnostic?.vehicle?.plate} />
                  <span className="ml-2">{os.diagnostic?.vehicle?.brand} {os.diagnostic?.vehicle?.model}</span>
                </TableCell>
                <TableCell className="font-semibold text-t1">{os.diagnostic?.vehicle?.client?.name}</TableCell>
                <TableCell className="max-w-[220px] truncate">{os.diagnostic?.description}</TableCell>
                <TableCell>{os.notes || <span className="text-t3">—</span>}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[os.status] ?? 'default'}>
                    {STATUS_LABEL[os.status] ?? os.status}
                  </Badge>
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
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
