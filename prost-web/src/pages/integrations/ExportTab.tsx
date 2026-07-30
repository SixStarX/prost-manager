import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const EXPORTS = [
  {
    label: 'Clientes',
    icon: '👥',
    description: 'Nome, telefone, e-mail e data de cadastro de todos os clientes.',
    href: '/api/integrations/export/clients',
    filename: 'prost-clientes.csv',
  },
  {
    label: 'Veículos',
    icon: '🚗',
    description: 'Placa, marca, modelo, ano e nome do proprietário.',
    href: '/api/integrations/export/vehicles',
    filename: 'prost-veiculos.csv',
  },
  {
    label: 'Ordens de Serviço',
    icon: '📋',
    description: 'Número, descrição, status, total e data de todas as OS.',
    href: '/api/integrations/export/service-orders',
    filename: 'prost-ordens-servico.csv',
  },
];

/** Aba de exportação: um card por tipo de dado, cada um com link de download. */
export function ExportTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {EXPORTS.map((ex) => (
        <Card key={ex.label}>
          <CardContent className="flex flex-col items-start gap-3 pt-5">
            <span className="text-3xl">{ex.icon}</span>
            <div>
              <div className="text-[14px] font-semibold text-t1">{ex.label}</div>
              <div className="text-[12.5px] text-t3 mt-0.5">{ex.description}</div>
            </div>
            <a href={ex.href} download={ex.filename} className="mt-auto">
              <Button size="sm" variant="secondary">⬇ Baixar CSV</Button>
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
