import type { LucideIcon } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardTitleIcon,
  CardContent,
} from '@/components/ui/card';

interface ChecklistSectionProps {
  icon: LucideIcon;
  title: string;
  /** Conteúdo à direita do cabeçalho (badge, contador…). */
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Card de seção do checklist — padroniza cabeçalho + ícone da marca. */
export function ChecklistSection({
  icon,
  title,
  aside,
  className,
  children,
}: ChecklistSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <CardTitleIcon icon={icon} />
          {title}
        </CardTitle>
        {aside}
      </CardHeader>
      <CardContent className={className}>{children}</CardContent>
    </Card>
  );
}

/** Par rótulo/valor para exibição de dados (read-only). */
export function InfoItem({
  label,
  value,
  mono,
}: {
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
}) {
  const empty = value === null || value === undefined || value === '';
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10.5px] font-semibold uppercase tracking-[.08em] text-t4">
        {label}
      </span>
      <span
        className={
          'text-[13.5px] text-t1 ' + (mono ? 'font-mono tracking-[.02em]' : '')
        }
      >
        {empty ? <span className="text-t3">—</span> : value}
      </span>
    </div>
  );
}

/** Grade responsiva de InfoItems. */
export function InfoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-x-5 gap-y-4">
      {children}
    </div>
  );
}
