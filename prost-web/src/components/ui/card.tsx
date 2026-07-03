import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-surface border border-white/[.08] rounded-md mb-4 overflow-hidden ' +
        'shadow-[0_1px_3px_rgba(0,0,0,.6),inset_0_1px_0_rgba(255,255,255,.06)]',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between px-5 py-4 border-b border-white/[.05]', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-2 text-[13px] font-bold text-t1 tracking-tight', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

interface CardTitleIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Ícone lucide (preferencial). Alternativamente passe `children`. */
  icon?: LucideIcon
}

const CardTitleIcon = React.forwardRef<HTMLSpanElement, CardTitleIconProps>(
  ({ className, icon: Icon, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'w-[26px] h-[26px] rounded-xs flex items-center justify-center text-[13px] ' +
        'bg-brand/[.10] border border-brand/40 text-brand',
        className
      )}
      {...props}
    >
      {Icon ? <Icon className="w-3.5 h-3.5" strokeWidth={2} /> : children}
    </span>
  )
)
CardTitleIcon.displayName = 'CardTitleIcon'

const CardCount = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'text-[11px] font-semibold text-t3 px-2 py-0.5 rounded-full bg-raised border border-white/[.05]',
        className
      )}
      {...props}
    />
  )
)
CardCount.displayName = 'CardCount'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center px-5 py-4 border-t border-white/[.05]', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardTitleIcon, CardCount, CardContent, CardFooter }
