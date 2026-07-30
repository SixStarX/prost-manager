import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, ClipboardCheck, Plus } from 'lucide-react';
import api from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardTitleIcon, CardCount, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { SkeletonRows } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PlateBadge } from '@/components/common/PlateBadge';
import { formatDate } from '@/lib/format';
import { clientProfilePath } from '@/lib/nav';
import type { Vehicle } from '@/api/types';

export default function Vehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);

  useEffect(() => {
    api.get('/vehicles').then((r) => setVehicles(r.data));
  }, []);

  return (
    <>
      {/* O cadastro de veículo passou a acontecer dentro do Novo Check-list,
          que registra cliente e veículo de uma vez a partir da vistoria. */}
      <Card>
        <CardHeader>
          <CardTitle>
            <CardTitleIcon icon={ClipboardCheck} />
            Novo Veículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[13px] text-t2">
              O cadastro de veículos é feito pelo <strong className="text-t1">Novo Check-list</strong>,
              que registra cliente e veículo junto com a vistoria de entrada.
            </p>
            <Button onClick={() => navigate('/checklist/new')}>
              <Plus /> Novo Check-list
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <CardTitleIcon icon={Car} />
            Veículos Cadastrados
          </CardTitle>
          {vehicles && <CardCount>{vehicles.length} total</CardCount>}
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Marca / Modelo</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Proprietário</TableHead>
              <TableHead>Cadastrado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!vehicles ? (
              <SkeletonRows rows={4} cols={5} />
            ) : vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-14">
                  <EmptyState
                    icon={Car}
                    text="Nenhum veículo cadastrado"
                    sub="Crie um Novo Check-list para registrar o primeiro veículo"
                  />
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((v) => (
                <TableRow
                  key={v.id}
                  onClick={() =>
                    v.client?.id &&
                    navigate(clientProfilePath(v.client.id, { vehicleId: v.id }))
                  }
                  className={v.client?.id ? 'cursor-pointer' : undefined}
                  title={v.client?.id ? `Abrir perfil de ${v.client.name}` : undefined}
                >
                  <TableCell>
                    <PlateBadge plate={v.plate} />
                  </TableCell>
                  <TableCell className="font-semibold text-t1">
                    {v.brand} {v.model}
                  </TableCell>
                  <TableCell>{v.year}</TableCell>
                  <TableCell>{v.client?.name}</TableCell>
                  <TableCell className="font-mono text-[11.5px] text-t3 tracking-[.03em]">{formatDate(v.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
