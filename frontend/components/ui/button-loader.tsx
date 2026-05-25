"use client"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import type { VariantProps } from "class-variance-authority"

// ─── Types ────────────────────────────────────────────────────────────────────

type NativeButtonProps = React.ComponentProps<"button">
type ButtonVariantProps = VariantProps<typeof buttonVariants>

interface LoadingButtonProps extends NativeButtonProps, ButtonVariantProps {
  /** When true, shows spinner + loadingText and disables the button */
  isLoading?: boolean
  /** Text shown while loading */
  loadingText?: string
  /** Show an indeterminate progress bar below the button while loading */
  showProgress?: boolean
}

// ─── LoadingButton ────────────────────────────────────────────────────────────

/**
 * Drop-in replacement for Button that handles loading state consistently.
 * Shows a spinner icon, replaces label text, and optionally renders a
 * progress bar beneath the button.
 */
export function LoadingButton({
  isLoading = false,
  loadingText,
  showProgress = false,
  children,
  disabled,
  className,
  variant,
  size,
  ...props
}: LoadingButtonProps) {
  const label = isLoading
    ? (loadingText ?? (typeof children === "string" ? `${children}…` : children))
    : children

  return (
    <div className="relative inline-flex">
      <Button
        variant={variant}
        size={size}
        disabled={disabled || isLoading}
        className={cn("relative overflow-hidden transition-all", className)}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
        )}
        {label}

        {/* Subtle shimmer sweep on the button itself while loading */}
        {isLoading && (
          <span
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent progress-bar-indeterminate"
            aria-hidden="true"
          />
        )}
      </Button>

      {/* Indeterminate progress bar beneath the button */}
      {showProgress && isLoading && (
        <div
          className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary/20 overflow-hidden"
          role="progressbar"
          aria-label="Loading"
        >
          <div className="h-full w-1/2 rounded-full bg-primary progress-bar-indeterminate" />
        </div>
      )}
    </div>
  )
}

// ─── InlineLoader ─────────────────────────────────────────────────────────────

/**
 * Small inline spinner + label for use inside cards, table cells, etc.
 */
export function InlineLoader({
  label = "Loading…",
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}
      role="status"
    >
      <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
      {label}
    </span>
  )
}

// ─── FullPageLoader ───────────────────────────────────────────────────────────

/**
 * Centered full-area loader for page-level transitions.
 * Use when you need a non-skeleton fallback (e.g. auth hydration).
 */
export function FullPageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[40vh] gap-4"
      role="status"
      aria-label={label}
    >
      {/* Pulsing logo-style ring */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border-2 border-primary/40" />
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
