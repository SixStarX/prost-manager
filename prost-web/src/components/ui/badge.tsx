import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-[5px] px-[9px] py-0.5 rounded-full text-[11px] font-bold ' +
  'tracking-[.03em] whitespace-nowrap border ' +
  'before:content-[""] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current before:shrink-0',
  {
    variants: {
      variant: {
        default:     'bg-raised text-t1 border-white/[.12]',
        open:        'bg-sky/[.12] text-[#60a5fa] border-sky/20',
        'in-progress':'bg-caution/[.12] text-[#fbbf24] border-caution/20',
        done:        'bg-ok/[.12] text-[#34d399] border-ok/20',
        pending:     'bg-overlay text-t2 border-white/[.14]',
        brand:       'bg-brand/[.15] text-[#b3a8ff] border-brand/25',
        destructive: 'bg-destructive/15 text-[#f87171] border-destructive/20',
        // ── Situação temporal (Tabela Temporal de Veículos) ──
        overdue:     'bg-destructive/[.14] text-[#f87171] border-destructive/25',
        duetoday:    'bg-caution/[.15] text-[#fbbf24] border-caution/25',
        soon:        'bg-sky/[.12] text-[#60a5fa] border-sky/20',
        fresh:       'bg-ok/[.12] text-[#34d399] border-ok/20',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
