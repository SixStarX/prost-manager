import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  // Pill sólido do app antigo: px-2 py-0.5 rounded-full text-xs font-medium text-white
  'inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default:     'bg-secondary text-secondary-foreground',
        open:        'bg-blue-500 text-white',
        'in-progress':'bg-yellow-500 text-white',
        done:        'bg-green-500 text-white',
        pending:     'bg-secondary text-muted-foreground',
        brand:       'bg-primary text-primary-foreground',
        destructive: 'bg-red-500 text-white',
        // ── Situação temporal (Tabela Temporal de Veículos) ──
        overdue:     'bg-red-500 text-white',
        duetoday:    'bg-yellow-500 text-white',
        soon:        'bg-blue-500 text-white',
        fresh:       'bg-green-500 text-white',
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
