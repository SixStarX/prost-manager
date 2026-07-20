import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('card-industrial mb-4 overflow-hidden', className)}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between px-5 py-4 border-b border-border', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-2 text-lg font-bold uppercase tracking-[.025em] text-foreground', className)}
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
        'w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary',
        className
      )}
      {...props}
    >
      {Icon ? <Icon className="w-5 h-5" strokeWidth={2} /> : children}
    </span>
  )
)
CardTitleIcon.displayName = 'CardTitleIcon'

const CardCount = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'text-sm text-muted-foreground',
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
    <div ref={ref} className={cn('flex items-center px-5 py-4 border-t border-border', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardTitleIcon, CardCount, CardContent, CardFooter }
