import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    // Base layout
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium',
    // Transitions — smooth but snappy
    'transition-all duration-150',
    // SVG handling
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
    // Disabled
    'disabled:pointer-events-none disabled:opacity-50',
    // Focus ring
    'outline-none focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
    // Invalid
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
    // Active press feedback
    'active:scale-[0.97]',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-primary text-primary-foreground shadow-sm',
          'hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20',
        ].join(' '),
        destructive: [
          'bg-destructive text-white shadow-sm',
          'hover:bg-destructive/90 hover:shadow-md hover:shadow-destructive/20',
          'focus-visible:ring-destructive/30 dark:bg-destructive/70',
        ].join(' '),
        outline: [
          'border border-border bg-background shadow-xs',
          'hover:bg-accent hover:text-accent-foreground hover:border-border/80',
          'dark:bg-input/20 dark:border-input dark:hover:bg-input/40',
        ].join(' '),
        secondary: [
          'bg-secondary text-secondary-foreground shadow-xs',
          'hover:bg-secondary/80',
        ].join(' '),
        ghost: [
          'hover:bg-accent hover:text-accent-foreground',
          'dark:hover:bg-accent/40',
        ].join(' '),
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm:      'h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5',
        lg:      'h-10 rounded-lg px-6 has-[>svg]:px-4',
        icon:    'size-9',
        'icon-sm':  'size-8',
        'icon-lg':  'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
