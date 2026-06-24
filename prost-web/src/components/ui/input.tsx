import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex w-full px-3 py-[9px] bg-raised border border-white/[.08] rounded-sm ' +
        'text-[13.5px] font-sans text-t1 outline-none transition-all duration-150 ' +
        'placeholder:text-t4 appearance-none ' +
        'hover:border-white/[.12] hover:bg-overlay ' +
        'focus:border-brand focus:bg-overlay focus:shadow-[0_0_0_3px_rgba(230,57,70,.15)] ' +
        'disabled:opacity-50 disabled:cursor-not-allowed ' +
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
