import { Inbox, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Ícone (lucide). Padrão: Inbox. */
  icon?: LucideIcon;
  text: string;
  sub?: string;
  /** Ação opcional (ex.: botão "Adicionar"). */
  action?: React.ReactNode;
  className?: string;
}

/** Estado vazio padronizado — ícone discreto + mensagem amigável. */
export function EmptyState({ icon: Icon = Inbox, text, sub, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 py-4', className)}>
      <div className="w-12 h-12 rounded-full bg-raised border border-white/[.06] flex items-center justify-center mb-1">
        <Icon className="w-5 h-5 text-t3" strokeWidth={1.75} />
      </div>
      <div className="text-[13px] font-semibold text-t2">{text}</div>
      {sub && <div className="text-xs text-t3 max-w-[320px] text-center">{sub}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
