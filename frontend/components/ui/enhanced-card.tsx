"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { components, animations } from "@/lib/design-system"
import { hoverLift, fadeInUp } from "@/lib/animations"

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnhancedCardProps {
  children: React.ReactNode
  className?: string
  variant?: "base" | "elevated" | "glass" | "outline"
  hover?: boolean
  animate?: boolean
  onClick?: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Enhanced card component with consistent styling and animations.
 * Uses the centralized design system for consistent appearance.
 */
export function EnhancedCard({
  children,
  className,
  variant = "elevated",
  hover = true,
  animate = true,
  onClick,
}: EnhancedCardProps) {
  const baseClasses = components.card[variant]
  const hoverClasses = hover ? animations.hover.lift : ""
  const transitionClasses = animations.transition.normal
  
  const cardClasses = cn(
    baseClasses,
    hoverClasses,
    transitionClasses,
    onClick && "cursor-pointer",
    className
  )

  if (animate) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        whileHover={hover ? hoverLift : undefined}
        className={cardClasses}
        onClick={onClick}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  )
}

// ─── Card Header ──────────────────────────────────────────────────────────────

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between p-6 pb-4", className)}>
      {children}
    </div>
  )
}

// ─── Card Content ─────────────────────────────────────────────────────────────

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("px-6 pb-6", className)}>
      {children}
    </div>
  )
}

// ─── Card Footer ──────────────────────────────────────────────────────────────

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn("flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20", className)}>
      {children}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <EnhancedCard variant="elevated" className={className}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              {icon}
            </div>
          )}
        </div>
        
        {trend && (
          <div className="mt-4 flex items-center gap-2">
            <span className={cn(
              "text-xs font-medium",
              trend.positive ? "text-emerald-600" : "text-red-600"
            )}>
              {trend.positive ? "+" : ""}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </div>
    </EnhancedCard>
  )
}