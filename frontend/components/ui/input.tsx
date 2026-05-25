import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Layout & sizing
        'h-9 w-full min-w-0 rounded-lg border px-3 py-1 text-sm',
        // Colors
        'border-input bg-transparent text-foreground',
        'placeholder:text-muted-foreground/50',
        'dark:bg-input/20',
        // File input
        'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        // Transitions
        'transition-[border-color,box-shadow] duration-150',
        // Focus — clean ring with primary color
        'outline-none',
        'focus-visible:border-primary/60 focus-visible:ring-3 focus-visible:ring-primary/15',
        // Invalid state
        'aria-invalid:border-destructive/70 aria-invalid:ring-3 aria-invalid:ring-destructive/15',
        // Disabled
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        // Shadow for depth
        'shadow-xs',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
