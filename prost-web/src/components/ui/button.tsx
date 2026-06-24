import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold ' +
  'rounded-sm transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed ' +
  'active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
  '[&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-brand text-white shadow-[0_1px_3px_rgba(230,57,70,.3)] ' +
          'hover:bg-brand-dark hover:shadow-[0_4px_16px_rgba(230,57,70,.25)]',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-white/[.12] bg-raised text-t2 hover:bg-overlay hover:text-t1',
        secondary:
          'bg-raised text-t2 border border-white/[.08] hover:bg-overlay hover:border-white/[.12] hover:text-t1',
        ghost:
          'text-t2 hover:bg-white/[.05] hover:text-t1',
        link:
          'text-brand underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm:      'h-8 px-3 text-xs',
        lg:      'h-10 px-6',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
