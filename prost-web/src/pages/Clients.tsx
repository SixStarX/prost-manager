import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Users, ChevronRight } from 'lucide-react';
import api from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardTitleIcon, CardCount } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { SkeletonRows } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/format';
import type { Client } from '@/api/types';

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[] | null>(null);

  const load = () => api.get('/clients').then((r) => setClients(r.data));
  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[17px] font-bold leading-tight text-t1">Clientes</h1>
          <p className="mt-0.5 text-[12px] text-t3">Gerencie os clientes cadastrados</p>
        </div>
        {/* Cadastro de cliente acontece no Novo Check-list, junto do veículo. */}
        <Button onClick={() => navigate('/checklist/new')}>
          <ClipboardCheck /> Novo Check-list
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <CardTitleIcon icon={Users} />
            Clientes Cadastrados
          </CardTitle>
          {clients && <CardCount>{clients.length} total</CardCount>}
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cadastrado em</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!clients ? (
              <SkeletonRows rows={4} cols={5} />
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-14">
                  <EmptyState icon={Users} text="Nenhum cliente cadastrado" sub="Clique em “Novo Check-list” para começar" />
                </TableCell>
              </TableRow>
            ) : (
              clients.map((c) => (
                <TableRow
                  key={c.id}
                  onClick={() => navigate(`/clients/${c.id}`)}
                  className="cursor-pointer group hover:bg-white/[.03]"
                >
                  <TableCell className="font-semibold text-t1 group-hover:text-brand transition-colors">{c.name}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.email || <span className="text-t3">—</span>}</TableCell>
                  <TableCell className="font-mono text-[11.5px] text-t3 tracking-[.03em]">{formatDate(c.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <ChevronRight className="w-4 h-4 text-t4 group-hover:text-brand transition-colors inline" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
