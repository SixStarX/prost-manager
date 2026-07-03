import { useEffect, useState } from 'react';
import { Users, Car, Stethoscope, ClipboardList, type LucideIcon } from 'lucide-react';
import api from '../api';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardTitleIcon, CardCount } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton, SkeletonRows } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PlateBadge } from '@/components/common/PlateBadge';
import { statusLabel, statusVariant } from '@/lib/status';
import { formatDate } from '@/lib/format';

interface StatCard {
  label: string;
  value: number;
  icon: LucideIcon;
  tint: string;
  glow: string;
  sub: string;
}

const buildStats = (data: any): StatCard[] => [
  { label: 'Clientes',          value: data.totals.clients,      icon: Users,         tint: 'bg-sky',     glow: 'rgba(59,130,246,.3)',  sub: 'cadastrados' },
  { label: 'Veículos',          value: data.totals.vehicles,     icon: Car,           tint: 'bg-ok',      glow: 'rgba(16,185,129,.3)',  sub: 'na frota'    },
  { label: 'Diagnósticos',      value: data.totals.diagnostics,  icon: Stethoscope,   tint: 'bg-caution', glow: 'rgba(245,158,11,.3)',  sub: 'registrados' },
  { label: 'Ordens de Serviço', value: data.totals.serviceOrders,icon: ClipboardList, tint: 'bg-grape',   glow: 'rgba(168,85,247,.3)',  sub: 'no sistema'  },
];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get('/dashboard')
      .then((r) => active && setData(r.data))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <Card>
        <div className="py-16">
          <EmptyState text="Não foi possível carregar o dashboard" sub="Verifique sua conexão e tente novamente." />
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[14px] mb-[22px]">
        {data
          ? buildStats(data).map((s) => <StatCardView key={s.label} {...s} />)
          : Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface border border-white/[.08] rounded-md px-5 py-[18px]">
                <Skeleton className="h-3 w-20 mb-4" />
                <Skeleton className="h-7 w-12 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
      </div>

      {/* Recent service orders */}
      <Card>
        <CardHeader>
          <CardTitle>
            <CardTitleIcon icon={ClipboardList} />
            Ordens de Serviço Recentes
          </CardTitle>
          {data && <CardCount>{data.recentServiceOrders.length} registros</CardCount>}
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Veículo</TableHead>
              <TableHead>Proprietário</TableHead>
              <TableHead>Diagnóstico</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data ? (
              <SkeletonRows rows={5} cols={5} />
            ) : data.recentServiceOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-14">
                  <EmptyState
                    icon={ClipboardList}
                    text="Nenhuma ordem de serviço ainda"
                    sub="Crie diagnósticos e gere OS para vê-las aqui"
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.recentServiceOrders.map((os: any) => (
                <TableRow key={os.id}>
                  <TableCell>
                    <PlateBadge plate={os.diagnostic.vehicle.plate} />
                    <span className="ml-2 text-t2">
                      {os.diagnostic.vehicle.brand} {os.diagnostic.vehicle.model}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-t1">{os.diagnostic.vehicle.client.name}</TableCell>
                  <TableCell className="max-w-[260px] truncate">{os.diagnostic.description}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(os.status)}>{statusLabel(os.status)}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[11.5px] text-t3 tracking-[.03em]">
                    {formatDate(os.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function StatCardView({ label, value, icon: Icon, tint, glow, sub }: StatCard) {
  return (
    <div
      className="bg-surface border border-white/[.08] rounded-md px-5 py-[18px] relative overflow-hidden cursor-default transition-all duration-300 hover:border-white/[.12] hover:shadow-[0_4px_16px_rgba(0,0,0,.6)] hover:-translate-y-px"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)' }}
    >
      <div className={`absolute top-0 left-0 right-0 h-[2px] rounded-t-md ${tint}`} style={{ boxShadow: `0 0 12px ${glow}` }} />
      <div className={`absolute right-[-20px] top-[-20px] w-20 h-20 rounded-full opacity-[.04] ${tint}`} />
      <div className="flex items-center justify-between mb-[14px]">
        <span className="text-[11px] font-semibold text-t3 uppercase tracking-[.08em]">{label}</span>
        <span className="w-8 h-8 rounded-sm flex items-center justify-center bg-raised border border-white/[.08]">
          <Icon className="w-4 h-4 text-t2" strokeWidth={2} />
        </span>
      </div>
      <div className="text-[30px] font-black tracking-[-0.8px] text-t1 leading-none">{value}</div>
      <div className="text-[11px] text-t3 mt-[5px]">{sub}</div>
    </div>
  );
}
