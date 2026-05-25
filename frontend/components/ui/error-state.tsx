"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  AlertCircle, RefreshCw, WifiOff, ServerCrash,
  AlertTriangle, X, ChevronDown, ChevronUp,
  ShieldAlert, Clock,
} from "lucide-react"
import { fadeInUp } from "@/lib/animations"

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Detect error category from the message string */
function detectErrorType(message: string): "offline" | "server" | "auth" | "timeout" | "error" {
  const m = message.toLowerCase()
  if (m.includes("cannot reach") || m.includes("network") || m.includes("offline") || m.includes("econnrefused"))
    return "offline"
  if (m.includes("500") || m.includes("502") || m.includes("503") || m.includes("backend"))
    return "server"
  if (m.includes("401") || m.includes("403") || m.includes("unauthorized") || m.includes("forbidden"))
    return "auth"
  if (m.includes("timeout") || m.includes("timed out"))
    return "timeout"
  return "error"
}

// ─── Full-section ErrorState ──────────────────────────────────────────────────

interface ErrorStateProps {
  title?: string
  message: string
  type?: "error" | "warning" | "offline" | "server" | "auth" | "timeout"
  onRetry?: () => void
  isRetrying?: boolean
  className?: string
}

const ERROR_CONFIG = {
  error: {
    icon: AlertCircle,
    color: "text-destructive",
    iconBg: "bg-destructive/10",
    iconBorder: "border-destructive/20",
    glow: "bg-destructive/8",
    title: "Something went wrong",
    hint: "This is usually a temporary issue. Try refreshing.",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10",
    iconBorder: "border-amber-500/20",
    glow: "bg-amber-500/8",
    title: "Warning",
    hint: "Please review the details below.",
  },
  offline: {
    icon: WifiOff,
    color: "text-muted-foreground",
    iconBg: "bg-muted/60",
    iconBorder: "border-border",
    glow: "bg-muted/20",
    title: "Backend server is offline",
    hint: "Make sure the Spring Boot server is running on port 8080.",
  },
  server: {
    icon: ServerCrash,
    color: "text-destructive",
    iconBg: "bg-destructive/10",
    iconBorder: "border-destructive/20",
    glow: "bg-destructive/8",
    title: "Server error",
    hint: "The server returned an unexpected response. Try again in a moment.",
  },
  auth: {
    icon: ShieldAlert,
    color: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10",
    iconBorder: "border-amber-500/20",
    glow: "bg-amber-500/8",
    title: "Access denied",
    hint: "You don't have permission to view this resource.",
  },
  timeout: {
    icon: Clock,
    color: "text-muted-foreground",
    iconBg: "bg-muted/60",
    iconBorder: "border-border",
    glow: "bg-muted/20",
    title: "Request timed out",
    hint: "The server took too long to respond. Check your connection and try again.",
  },
}

export function ErrorState({
  title,
  message,
  type,
  onRetry,
  isRetrying = false,
  className,
}: ErrorStateProps) {
  // Auto-detect type from message if not provided
  const resolvedType = type ?? detectErrorType(message)
  const cfg = ERROR_CONFIG[resolvedType]
  const Icon = cfg.icon

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className={cn(
        "flex flex-col items-center justify-center py-14 px-6 text-center",
        className
      )}
    >
      {/* Icon with glow */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-6"
      >
        <div className={cn("absolute inset-0 rounded-full blur-2xl scale-150", cfg.glow)} />
        <div className={cn(
          "relative flex h-16 w-16 items-center justify-center rounded-2xl border",
          cfg.iconBg, cfg.iconBorder
        )}>
          <Icon className={cn("h-8 w-8", cfg.color)} />
        </div>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.3 }}
        className="space-y-2 max-w-sm"
      >
        <h3 className={cn("text-lg font-semibold", cfg.color)}>
          {title ?? cfg.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
        <p className="text-xs text-muted-foreground/60 leading-relaxed">{cfg.hint}</p>
      </motion.div>

      {/* Retry */}
      {onRetry && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.3 }}
          className="mt-6"
        >
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            variant="outline"
            className="gap-2 border-border"
          >
            <RefreshCw className={cn("h-4 w-4", isRetrying && "animate-spin")} />
            {isRetrying ? "Retrying…" : "Try again"}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Inline ErrorBanner ───────────────────────────────────────────────────────

interface ErrorBannerProps {
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  type?: "error" | "warning"
  /** Show a collapsible technical detail section */
  detail?: string
}

export function ErrorBanner({
  message,
  onRetry,
  onDismiss,
  type = "error",
  detail,
}: ErrorBannerProps) {
  const [expanded, setExpanded] = useState(false)
  const [retrying, setRetrying] = useState(false)

  const isError = type === "error"
  const autoType = detectErrorType(message)

  // Pick icon based on auto-detected type
  const Icon =
    autoType === "offline" ? WifiOff
    : autoType === "server" ? ServerCrash
    : autoType === "auth"   ? ShieldAlert
    : isError               ? AlertCircle
    :                         AlertTriangle

  const handleRetry = async () => {
    if (!onRetry) return
    setRetrying(true)
    try {
      await onRetry()
    } finally {
      setRetrying(false)
    }
  }

  // Friendly title based on detected type
  const friendlyTitle =
    autoType === "offline" ? "Backend server is offline"
    : autoType === "server" ? "Server error"
    : autoType === "auth"   ? "Access denied"
    : autoType === "timeout"? "Request timed out"
    : isError               ? "Failed to load data"
    :                         "Warning"

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.22 }}
        className="overflow-hidden"
      >
        <div className={cn(
          "rounded-xl border overflow-hidden",
          isError
            ? "border-destructive/25 bg-destructive/6"
            : "border-amber-500/25 bg-amber-500/6"
        )}>
          {/* Main row */}
          <div className="flex items-start gap-3 px-4 py-3.5">
            {/* Icon */}
            <div className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5",
              isError ? "bg-destructive/12" : "bg-amber-500/12"
            )}>
              <Icon className={cn(
                "h-3.5 w-3.5",
                isError ? "text-destructive" : "text-amber-600 dark:text-amber-400"
              )} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-semibold leading-snug",
                isError ? "text-destructive" : "text-amber-600 dark:text-amber-400"
              )}>
                {friendlyTitle}
              </p>
              <p className={cn(
                "text-xs mt-0.5 leading-relaxed",
                isError ? "text-destructive/70" : "text-amber-600/70 dark:text-amber-400/70"
              )}>
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {detail && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                    isError
                      ? "text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                      : "text-amber-600/60 hover:text-amber-600 hover:bg-amber-500/10"
                  )}
                  aria-label={expanded ? "Hide details" : "Show details"}
                >
                  {expanded
                    ? <ChevronUp className="h-3.5 w-3.5" />
                    : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              )}
              {onRetry && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetry}
                  disabled={retrying}
                  className={cn(
                    "h-7 px-2.5 text-xs gap-1.5",
                    isError
                      ? "text-destructive hover:text-destructive hover:bg-destructive/10"
                      : "text-amber-600 hover:text-amber-600 hover:bg-amber-500/10"
                  )}
                >
                  <RefreshCw className={cn("h-3 w-3", retrying && "animate-spin")} />
                  {retrying ? "Retrying…" : "Retry"}
                </Button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                    isError
                      ? "text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                      : "text-amber-600/60 hover:text-amber-600 hover:bg-amber-500/10"
                  )}
                  aria-label="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Expandable detail */}
          <AnimatePresence>
            {expanded && detail && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className={cn(
                  "px-4 py-3 border-t text-xs font-mono leading-relaxed",
                  isError
                    ? "border-destructive/15 text-destructive/60 bg-destructive/4"
                    : "border-amber-500/15 text-amber-600/60 bg-amber-500/4"
                )}>
                  {detail}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Offline Banner ───────────────────────────────────────────────────────────

/**
 * Specialised banner for backend-offline scenarios.
 * Shows a pulsing indicator and clear instructions.
 */
export function OfflineBanner({ onRetry }: { onRetry?: () => void }) {
  const [retrying, setRetrying] = useState(false)

  const handleRetry = async () => {
    if (!onRetry) return
    setRetrying(true)
    try { await onRetry() } finally { setRetrying(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-amber-500/25 bg-amber-500/6 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Pulsing dot */}
        <div className="relative shrink-0">
          <span className="absolute inset-0 rounded-full bg-amber-500/40 animate-ping" />
          <span className="relative flex h-2.5 w-2.5 rounded-full bg-amber-500" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            Backend server is offline
          </p>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">
            Start the Spring Boot server on port 8080, then retry.
          </p>
        </div>

        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            disabled={retrying}
            className="h-7 px-2.5 text-xs gap-1.5 text-amber-600 hover:text-amber-600 hover:bg-amber-500/10 shrink-0"
          >
            <RefreshCw className={cn("h-3 w-3", retrying && "animate-spin")} />
            {retrying ? "Checking…" : "Retry"}
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Smart ErrorBanner (auto-selects Offline vs generic) ─────────────────────

/**
 * Drop-in replacement that auto-detects offline vs generic errors
 * and renders the appropriate banner variant.
 */
export function SmartErrorBanner({
  message,
  onRetry,
  onDismiss,
}: {
  message: string
  onRetry?: () => void
  onDismiss?: () => void
}) {
  const type = detectErrorType(message)
  if (type === "offline") {
    return <OfflineBanner onRetry={onRetry} />
  }
  return (
    <ErrorBanner
      message={message}
      onRetry={onRetry}
      onDismiss={onDismiss}
      type="error"
    />
  )
}
