'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        // Base
        'flex items-center gap-1.5 text-sm font-medium leading-none select-none',
        // Color — slightly muted by default, full foreground when active
        'text-foreground/80',
        // Disabled peer
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Label }
