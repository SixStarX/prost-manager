import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Stethoscope, FilePlus2, Plus } from 'lucide-react';
import api from '../api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardTitleIcon, CardCount, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SkeletonRows } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PlateBadge } from '@/components/common/PlateBadge';
import { DIAGNOSTIC_STATUS_LABEL, statusVariant } from '@/lib/status';
import { clientProfilePath } from '@/lib/nav';
import { formatDate } from '@/lib/format';
import type { Diagnostic, Vehicle } from '@/api/types';

const EMPTY = { description: '', vehicleId: '' };

export default function Diagnostics() {
  const navigate = useNavigate();
  const [diagnostics, setDiagnostics] = useState<Diagnostic[] | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/diagnostics').then((r) => setDiagnostics(r.data));
  useEffect(() => {
    load();
    api.get('/vehicles').then((r) => setVehicles(r.data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/diagnostics', form);
      setForm(EMPTY);
      await load();
      toast.success('Diagnóstico registrado!');
    } catch {
      toast.error('Erro ao registrar diagnóstico.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <CardTitleIcon icon={FilePlus2} />
            Novo Diagnóstico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[14px]">
              <div className="flex flex-col gap-1.5 col-span-2">
                <Label>
                  Descrição do problema <span className="text-brand">*</span>
                </Label>
                <Textarea
                  required
                  rows={3}
                  placeholder="Descreva detalhadamente o problema identificado no veículo…"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>
                  Veículo <span className="text-brand">*</span>
                </Label>
                <Select required value={form.vehicleId} onValueChange={(v) => setForm((p) => ({ ...p, vehicleId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o veículo…" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.plate} — {v.brand} {v.model} ({v.client?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2.5 mt-[18px]">
              <Button type="submit" disabled={saving}>
                <Plus /> {saving ? 'Salvando…' : 'Registrar Diagnóstico'}
              </Button>
              {!saving && form.description && (
                <Button type="button" variant="secondary" onClick={() => setForm(EMPTY)}>
                  Limpar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <CardTitleIcon icon={Stethoscope} />
            Diagnósticos Registrados
          </CardTitle>
          {diagnostics && <CardCount>{diagnostics.length} total</CardCount>}
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Problema</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Proprietário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!diagnostics ? (
              <SkeletonRows rows={4} cols={5} />
            ) : diagnostics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-14">
                  <EmptyState icon={Stethoscope} text="Nenhum diagnóstico registrado" sub="Use o formulário acima para registrar" />
                </TableCell>
              </TableRow>
            ) : (
              diagnostics.map((d) => (
                <TableRow
                  key={d.id}
                  onClick={() =>
                    d.vehicle?.client?.id &&
                    navigate(
                      clientProfilePath(d.vehicle.client.id, { vehicleId: d.vehicle.id }),
                    )
                  }
                  className={d.vehicle?.client?.id ? 'cursor-pointer' : undefined}
                  title={
                    d.vehicle?.client?.id
                      ? `Abrir perfil de ${d.vehicle.client.name}`
                      : undefined
                  }
                >
                  <TableCell className="max-w-[280px] truncate">{d.description}</TableCell>
                  <TableCell>
                    <PlateBadge plate={d.vehicle?.plate} />
                    <span className="ml-2">
                      {d.vehicle?.brand} {d.vehicle?.model}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-t1">{d.vehicle?.client?.name}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(d.status)}>{DIAGNOSTIC_STATUS_LABEL[d.status] ?? d.status}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[11.5px] text-t3 tracking-[.03em]">{formatDate(d.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
