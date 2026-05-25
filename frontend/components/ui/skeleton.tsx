import { cn } from '@/lib/utils'

/**
 * Base skeleton component with premium shimmer effect.
 * Uses a CSS-only shimmer sweep (no JS animation overhead).
 * Falls back gracefully when reduced-motion is preferred.
 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'shimmer rounded-md',
        // Reduced-motion: fall back to simple pulse
        'motion-reduce:animate-pulse motion-reduce:bg-muted/60',
        className
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

export { Skeleton }
