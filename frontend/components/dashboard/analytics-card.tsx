"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { cardEntrance, cardHover, cardTap } from "@/lib/animations"
import { Skeleton } from "@/components/ui/skeleton"
import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsCardProps {
  title: string
  value: number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "primary" | "success" | "warning" | "danger"
  delay?: number
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AnalyticsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
  delay = 0,
  className,
}: AnalyticsCardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  // Animated counter
  useEffect(() => {
    const duration = 1000 // 1 second
    const steps = 60
    const increment = value / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(current + increment, value)
      setDisplayValue(Math.floor(current))

      if (step >= steps || current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  const variantStyles = {
    default: {
      bg: "bg-card",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      border: "border-border",
    },
    primary: {
      bg: "bg-primary/5",
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
      border: "border-primary/20",
    },
    success: {
      bg: "bg-emerald-500/5",
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/20",
    },
    warning: {
      bg: "bg-amber-500/5",
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/20",
    },
    danger: {
      bg: "bg-destructive/5",
      iconBg: "bg-destructive/15",
      iconColor: "text-destructive",
      border: "border-destructive/20",
    },
  }

  const styles = variantStyles[variant]

  return (
    <motion.div
      variants={cardEntrance}
      initial="initial"
      animate="animate"
      whileHover={cardHover}
      whileTap={cardTap}
      transition={{ delay }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border backdrop-blur-sm",
        styles.bg,
        styles.border,
        className
      )}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1 pr-2">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
            <motion.p
              key={displayValue}
              initial={{ scale: 1.1, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground tabular-nums"
            >
              {displayValue.toLocaleString()}
            </motion.p>
          </div>

          {/* Icon */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className={cn(
              "flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl transition-colors",
              styles.iconBg
            )}
          >
            <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", styles.iconColor)} />
          </motion.div>
        </div>

        {/* Footer */}
        {(description || trend) && (
          <div className="mt-3 sm:mt-4 flex items-center gap-2">
            {trend && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.2 }}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                  trend.isPositive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </motion.span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </motion.div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function AnalyticsCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1 pr-2">
          <Skeleton className="h-3.5 w-20 sm:w-24" />
          <Skeleton className="h-8 sm:h-10 w-16 sm:w-20" />
        </div>
        <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl" />
      </div>
      <div className="mt-3 sm:mt-4">
        <Skeleton className="h-3 w-24 sm:w-32" />
      </div>
    </div>
  )
}
