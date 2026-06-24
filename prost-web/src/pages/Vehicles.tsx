import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardTitleIcon, CardCount, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlateBadge, EmptyState } from './Dashboard';

const EMPTY = { plate: '', brand: '', model: '', year: '', clientId: '' };

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [clients, setClients]   = useState<any[]>([]);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  const load = () => api.get('/vehicles').then((r) => setVehicles(r.data));
  useEffect(() => {
    load();
    api.get('/clients').then((r) => setClients(r.data));
  }, []);

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [f]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/vehicles', { ...form, year: Number(form.year) });
      setForm(EMPTY);
      await load();
      toast.success('Veículo adicionado com sucesso!');
    } catch {
      toast.error('Erro ao adicionar veículo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle><CardTitleIcon>➕</CardTitleIcon>Novo Veículo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[14px]">
              <Field label="Placa" req>
                <Input required placeholder="ABC1234" value={form.plate}
                       onChange={set('plate')} className="uppercase font-mono tracking-[.05em]" />
              </Field>
              <Field label="Marca" req>
                <Input required placeholder="Honda" value={form.brand} onChange={set('brand')} />
              </Field>
              <Field label="Modelo" req>
                <Input required placeholder="Civic" value={form.model} onChange={set('model')} />
              </Field>
              <Field label="Ano" req>
                <Input required type="number" placeholder="2020" min={1900} max={2100}
                       value={form.year} onChange={set('year')} />
              </Field>
              <Field label="Proprietário" req>
                <Select
                  required
                  value={form.clientId}
                  onValueChange={(v) => setForm((p) => ({ ...p, clientId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="flex items-center gap-2.5 mt-[18px]">
              <Button type="submit" disabled={saving}>
                {saving ? '…' : '+'}&nbsp;{saving ? 'Salvando...' : 'Adicionar Veículo'}
              </Button>
              {!saving && form.plate && (
                <Button type="button" variant="secondary" onClick={() => setForm(EMPTY)}>Limpar</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle><CardTitleIcon>🚗</CardTitleIcon>Veículos Cadastrados</CardTitle>
          <CardCount>{vehicles.length} total</CardCount>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead><TableHead>Marca / Modelo</TableHead>
              <TableHead>Ano</TableHead><TableHead>Proprietário</TableHead>
              <TableHead>Cadastrado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-14">
                  <EmptyState icon="🚗" text="Nenhum veículo cadastrado" sub="Cadastre um cliente primeiro, depois adicione o veículo" />
                </TableCell>
              </TableRow>
            ) : vehicles.map((v) => (
              <TableRow key={v.id}>
                <TableCell><PlateBadge plate={v.plate} /></TableCell>
                <TableCell className="font-semibold text-t1">{v.brand} {v.model}</TableCell>
                <TableCell>{v.year}</TableCell>
                <TableCell>{v.client?.name}</TableCell>
                <TableCell className="font-mono text-[11.5px] text-t3 tracking-[.03em]">
                  {new Date(v.createdAt).toLocaleDateString('pt-BR')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

function Field({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}{req && <span className="text-brand ml-0.5">*</span>}</Label>
      {children}
    </div>
  );
}
