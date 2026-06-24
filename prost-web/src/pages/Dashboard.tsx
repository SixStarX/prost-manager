import { useEffect, useState } from 'react';
import api from '../api';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardTitleIcon, CardCount } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Aberta', IN_PROGRESS: 'Em andamento', DONE: 'Concluída', PENDING: 'Pendente',
};
const STATUS_VARIANT: Record<string, 'open' | 'in-progress' | 'done' | 'pending'> = {
  OPEN: 'open', IN_PROGRESS: 'in-progress', DONE: 'done', PENDING: 'pending',
};

const statCards = (data: any) => [
  { label: 'Clientes',          value: data.totals.clients,      icon: '👥', top: 'bg-sky',     glow: 'rgba(59,130,246,.3)',  sub: 'cadastrados' },
  { label: 'Veículos',          value: data.totals.vehicles,      icon: '🚗', top: 'bg-ok',      glow: 'rgba(16,212,142,.3)',  sub: 'na frota'    },
  { label: 'Diagnósticos',      value: data.totals.diagnostics,   icon: '🔍', top: 'bg-caution', glow: 'rgba(245,158,11,.3)',  sub: 'registrados' },
  { label: 'Ordens de Serviço', value: data.totals.serviceOrders, icon: '📋', top: 'bg-grape',   glow: 'rgba(139,92,246,.3)',  sub: 'no sistema'  },
];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => { api.get('/dashboard').then((r) => setData(r.data)); }, []);

  if (!data) return (
    <div className="flex items-center justify-center gap-3 py-16 text-[13px] text-t3">
      <span className="w-5 h-5 border-2 border-white/[.08] border-t-brand rounded-full animate-spin shrink-0" />
      Carregando dashboard...
    </div>
  );

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-[14px] mb-[22px]">
        {statCards(data).map((s) => (
          <div key={s.label}
               className="bg-surface border border-white/[.08] rounded-md px-5 py-[18px] relative overflow-hidden
                          cursor-default transition-all duration-300
                          hover:border-white/[.12] hover:shadow-[0_4px_16px_rgba(0,0,0,.6)] hover:-translate-y-px"
               style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)' }}>
            <div className={`absolute top-0 left-0 right-0 h-[2px] rounded-t-md ${s.top}`}
                 style={{ boxShadow: `0 0 12px ${s.glow}` }} />
            <div className={`absolute right-[-20px] top-[-20px] w-20 h-20 rounded-full opacity-[.04] ${s.top}`} />
            <div className="flex items-center justify-between mb-[14px]">
              <span className="text-[11px] font-semibold text-t3 uppercase tracking-[.08em]">{s.label}</span>
              <span className="w-8 h-8 rounded-sm flex items-center justify-center text-[15px] bg-raised border border-white/[.08]">
                {s.icon}
              </span>
            </div>
            <div className="text-[30px] font-black tracking-[-0.8px] text-t1 leading-none">{s.value}</div>
            <div className="text-[11px] text-t3 mt-[5px]">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent service orders */}
      <Card>
        <CardHeader>
          <CardTitle>
            <CardTitleIcon>📋</CardTitleIcon>
            Ordens de Serviço Recentes
          </CardTitle>
          <CardCount>{data.recentServiceOrders.length} registros</CardCount>
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
            {data.recentServiceOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-14">
                  <EmptyState icon="📋" text="Nenhuma ordem de serviço ainda" sub="Crie diagnósticos e gere OS para vê-las aqui" />
                </TableCell>
              </TableRow>
            ) : (
              data.recentServiceOrders.map((os: any) => (
                <TableRow key={os.id}>
                  <TableCell>
                    <PlateBadge plate={os.diagnostic.vehicle.plate} />
                    <span className="ml-2 text-t2">{os.diagnostic.vehicle.brand} {os.diagnostic.vehicle.model}</span>
                  </TableCell>
                  <TableCell className="font-semibold text-t1">{os.diagnostic.vehicle.client.name}</TableCell>
                  <TableCell className="max-w-[260px] truncate">{os.diagnostic.description}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[os.status]}>
                      {STATUS_LABEL[os.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[11.5px] text-t3 tracking-[.03em]">
                    {new Date(os.createdAt).toLocaleDateString('pt-BR')}
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

/* ── Exported micro-components (shared across pages) ── */
export function PlateBadge({ plate }: { plate: string }) {
  return (
    <span className="inline-flex items-center bg-overlay text-t1 font-mono text-[11px] font-bold
                     px-2 py-0.5 rounded-xs tracking-[.1em] uppercase border border-white/[.12]">
      {plate}
    </span>
  );
}

export function EmptyState({ icon, text, sub }: { icon: string; text: string; sub: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-[28px] opacity-20 grayscale">{icon}</div>
      <div className="text-[13px] font-semibold text-t3 mt-1">{text}</div>
      <div className="text-xs text-t4">{sub}</div>
    </div>
  );
}
