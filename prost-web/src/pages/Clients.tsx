import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardTitleIcon, CardCount, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { EmptyState } from './Dashboard';

const EMPTY = { name: '', phone: '', email: '' };

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);

  const load = () => api.get('/clients').then((r) => setClients(r.data));
  useEffect(() => { load(); }, []);

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [f]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/clients', form);
      setForm(EMPTY);
      await load();
      toast.success('Cliente adicionado com sucesso!');
    } catch {
      toast.error('Erro ao adicionar cliente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle><CardTitleIcon>➕</CardTitleIcon>Novo Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[14px]">
              <Field label="Nome" req>
                <Input required placeholder="Nome completo" value={form.name} onChange={set('name')} />
              </Field>
              <Field label="Telefone" req>
                <Input required placeholder="(11) 99999-0000" value={form.phone} onChange={set('phone')} />
              </Field>
              <Field label="Email">
                <Input type="email" placeholder="opcional" value={form.email} onChange={set('email')} />
              </Field>
            </div>
            <div className="flex items-center gap-2.5 mt-[18px]">
              <Button type="submit" disabled={saving}>
                {saving ? '…' : '+'}&nbsp;{saving ? 'Salvando...' : 'Adicionar Cliente'}
              </Button>
              {!saving && form.name && (
                <Button type="button" variant="secondary" onClick={() => setForm(EMPTY)}>Limpar</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle><CardTitleIcon>👥</CardTitleIcon>Clientes Cadastrados</CardTitle>
          <CardCount>{clients.length} total</CardCount>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cadastrado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-14">
                  <EmptyState icon="👥" text="Nenhum cliente cadastrado" sub="Use o formulário acima para adicionar" />
                </TableCell>
              </TableRow>
            ) : clients.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-semibold text-t1">{c.name}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>{c.email || <span className="text-t3">—</span>}</TableCell>
                <TableCell className="font-mono text-[11.5px] text-t3 tracking-[.03em]">
                  {new Date(c.createdAt).toLocaleDateString('pt-BR')}
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
