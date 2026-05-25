"use client"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

// ─── Base shimmer skeleton ────────────────────────────────────────────────────

interface ShimmerSkeletonProps {
  className?: string
  variant?: "default" | "text" | "circular" | "rectangular"
  width?: string | number
  height?: string | number
  /** @deprecated animate is always true — shimmer is CSS-driven */
  animate?: boolean
}

/**
 * Enhanced skeleton loader with premium shimmer effect.
 * Wraps the base Skeleton with variant presets and inline sizing.
 */
export function ShimmerSkeleton({
  className,
  variant = "default",
  width,
  height,
}: ShimmerSkeletonProps) {
  const variantStyles = {
    default:     "rounded-md",
    text:        "rounded h-4",
    circular:    "rounded-full",
    rectangular: "rounded-none",
  }

  return (
    <Skeleton
      className={cn(variantStyles[variant], className)}
      style={{
        width:  typeof width  === "number" ? `${width}px`  : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  )
}

// ─── Preset: text lines ───────────────────────────────────────────────────────

export function SkeletonText({
  className,
  lines = 1,
}: {
  className?: string
  lines?: number
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <ShimmerSkeleton
          key={i}
          variant="text"
          className={i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}
        />
      ))}
    </div>
  )
}

// ─── Preset: stat / analytics card ───────────────────────────────────────────

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <ShimmerSkeleton className="h-4 w-24" />
          <ShimmerSkeleton className="h-8 w-16" />
        </div>
        <ShimmerSkeleton variant="circular" className="h-12 w-12" />
      </div>
      <ShimmerSkeleton className="h-3 w-32" />
    </div>
  )
}

// ─── Preset: data table ───────────────────────────────────────────────────────

export function SkeletonTable({
  rows = 5,
  cols = 6,
}: {
  rows?: number
  cols?: number
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-muted/20 p-4">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="border-b border-border last:border-0 p-4"
          style={{ animationDelay: `${rowIndex * 60}ms` }}
        >
          <div className="flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <ShimmerSkeleton
                key={colIndex}
                className={cn(
                  "h-4 flex-1",
                  // Vary widths for a more natural look
                  colIndex === 0 && "max-w-[48px]",
                  colIndex === cols - 1 && "max-w-[80px]"
                )}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Preset: form submission overlay ─────────────────────────────────────────

export function FormSubmitLoader({
  message = "Saving…",
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-8",
        className
      )}
    >
      {/* Indeterminate progress bar */}
      <div className="w-48 h-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full w-1/2 rounded-full bg-primary progress-bar-indeterminate" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
