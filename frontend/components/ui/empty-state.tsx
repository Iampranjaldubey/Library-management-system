"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations"
import {
  BookOpen, Search, Inbox, ArrowLeftRight,
  Plus, SlidersHorizontal, RefreshCw,
} from "lucide-react"

// ─── SVG Illustrations ────────────────────────────────────────────────────────
// Lightweight inline SVGs — no external deps, theme-aware via currentColor

function IllustrationBooks({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full", className)}
      aria-hidden="true"
    >
      {/* Shelf */}
      <rect x="8" y="62" width="104" height="4" rx="2" fill="currentColor" opacity="0.12" />
      {/* Book 1 — tall, primary */}
      <rect x="18" y="22" width="16" height="40" rx="2" fill="currentColor" opacity="0.18" />
      <rect x="18" y="22" width="4" height="40" rx="1" fill="currentColor" opacity="0.28" />
      <rect x="22" y="30" width="8" height="1.5" rx="0.75" fill="currentColor" opacity="0.35" />
      <rect x="22" y="34" width="6" height="1.5" rx="0.75" fill="currentColor" opacity="0.25" />
      {/* Book 2 — medium */}
      <rect x="38" y="30" width="14" height="32" rx="2" fill="currentColor" opacity="0.14" />
      <rect x="38" y="30" width="3.5" height="32" rx="1" fill="currentColor" opacity="0.22" />
      <rect x="43" y="38" width="6" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
      {/* Book 3 — short, accent */}
      <rect x="56" y="38" width="12" height="24" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="56" y="38" width="3" height="24" rx="1" fill="currentColor" opacity="0.32" />
      {/* Book 4 — tall */}
      <rect x="72" y="18" width="15" height="44" rx="2" fill="currentColor" opacity="0.15" />
      <rect x="72" y="18" width="4" height="44" rx="1" fill="currentColor" opacity="0.25" />
      <rect x="77" y="28" width="7" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
      <rect x="77" y="32" width="5" height="1.5" rx="0.75" fill="currentColor" opacity="0.2" />
      {/* Book 5 — medium */}
      <rect x="91" y="34" width="13" height="28" rx="2" fill="currentColor" opacity="0.16" />
      <rect x="91" y="34" width="3.5" height="28" rx="1" fill="currentColor" opacity="0.26" />
      {/* Floating sparkle dots */}
      <circle cx="60" cy="10" r="2" fill="currentColor" opacity="0.2" />
      <circle cx="50" cy="14" r="1.5" fill="currentColor" opacity="0.15" />
      <circle cx="70" cy="12" r="1" fill="currentColor" opacity="0.12" />
    </svg>
  )
}

function IllustrationSearch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full", className)}
      aria-hidden="true"
    >
      {/* Magnifier circle */}
      <circle cx="50" cy="36" r="22" stroke="currentColor" strokeWidth="3.5" opacity="0.2" />
      <circle cx="50" cy="36" r="14" stroke="currentColor" strokeWidth="2" opacity="0.12" />
      {/* Handle */}
      <line x1="66" y1="52" x2="82" y2="68" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.2" />
      {/* Inner lines — "no results" cross */}
      <line x1="43" y1="29" x2="57" y2="43" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
      <line x1="57" y1="29" x2="43" y2="43" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
      {/* Dots */}
      <circle cx="90" cy="20" r="2.5" fill="currentColor" opacity="0.15" />
      <circle cx="98" cy="30" r="1.5" fill="currentColor" opacity="0.1" />
      <circle cx="20" cy="55" r="2" fill="currentColor" opacity="0.12" />
    </svg>
  )
}

function IllustrationInbox({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full", className)}
      aria-hidden="true"
    >
      {/* Inbox tray */}
      <rect x="20" y="44" width="80" height="24" rx="4" fill="currentColor" fillOpacity="0.12" />
      <rect x="20" y="44" width="80" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" />
      {/* Inbox divider */}
      <line x1="20" y1="56" x2="100" y2="56" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
      {/* Envelope */}
      <rect x="34" y="20" width="52" height="36" rx="3" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.18" />
      <path d="M34 23 L60 40 L86 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.22" />
      {/* Floating dots */}
      <circle cx="22" cy="28" r="2" fill="currentColor" opacity="0.15" />
      <circle cx="98" cy="36" r="2.5" fill="currentColor" opacity="0.12" />
      <circle cx="60" cy="10" r="1.5" fill="currentColor" opacity="0.1" />
    </svg>
  )
}

function IllustrationTransactions({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full", className)}
      aria-hidden="true"
    >
      {/* Left arrow (issue) */}
      <rect x="12" y="28" width="40" height="10" rx="5" fill="currentColor" opacity="0.12" />
      <path d="M46 24 L56 33 L46 42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
      {/* Right arrow (return) */}
      <rect x="68" y="42" width="40" height="10" rx="5" fill="currentColor" opacity="0.12" />
      <path d="M74 38 L64 47 L74 56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
      {/* Book icon center */}
      <rect x="48" y="26" width="24" height="28" rx="3" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" />
      <rect x="48" y="26" width="6" height="28" rx="1.5" fill="currentColor" opacity="0.22" />
      <line x1="57" y1="34" x2="68" y2="34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
      <line x1="57" y1="39" x2="65" y2="39" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.15" />
      {/* Dots */}
      <circle cx="20" cy="60" r="2" fill="currentColor" opacity="0.12" />
      <circle cx="100" cy="20" r="2.5" fill="currentColor" opacity="0.1" />
    </svg>
  )
}

// ─── Base EmptyState ──────────────────────────────────────────────────────────

interface EmptyStateProps {
  /** Illustration variant — renders a themed SVG above the icon */
  illustration?: "books" | "search" | "inbox" | "transactions" | "none"
  /** Lucide icon shown in the icon badge */
  icon?: React.ElementType
  title: string
  description: string
  /** Primary CTA */
  action?: { label: string; onClick: () => void; icon?: React.ElementType }
  /** Secondary CTA */
  secondaryAction?: { label: string; onClick: () => void }
  /** Hint chips shown below the description */
  hints?: string[]
  className?: string
  /** Compact mode — less vertical padding, smaller illustration */
  compact?: boolean
}

export function EmptyState({
  illustration = "none",
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  hints,
  className,
  compact = false,
}: EmptyStateProps) {
  const IllustrationMap = {
    books: IllustrationBooks,
    search: IllustrationSearch,
    inbox: IllustrationInbox,
    transactions: IllustrationTransactions,
    none: null,
  }
  const Illustration = IllustrationMap[illustration]

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-10 px-4" : "py-16 px-6",
        className
      )}
    >
      {/* Illustration + icon stack */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "relative flex items-center justify-center mb-6",
          compact ? "w-28 h-20" : "w-36 h-24"
        )}
      >
        {/* Illustration layer */}
        {Illustration && (
          <div className="absolute inset-0 text-primary">
            <Illustration />
          </div>
        )}

        {/* Icon badge — sits in front of illustration */}
        {Icon && (
          <div className={cn(
            "relative z-10 flex items-center justify-center rounded-2xl",
            "bg-card border border-border shadow-sm",
            "ring-4 ring-background",
            compact ? "h-11 w-11" : "h-14 w-14"
          )}>
            <div className="absolute inset-0 rounded-2xl bg-primary/8" />
            <Icon className={cn(
              "relative text-primary/70",
              compact ? "h-5 w-5" : "h-7 w-7"
            )} />
          </div>
        )}

        {/* Glow */}
        <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl -z-10" />
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="space-y-2 max-w-sm"
      >
        <h3 className={cn(
          "font-semibold text-foreground",
          compact ? "text-base" : "text-lg"
        )}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* Hint chips */}
      {hints && hints.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-4"
        >
          {hints.map((hint) => (
            <span
              key={hint}
              className="inline-flex items-center rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground"
            >
              {hint}
            </span>
          ))}
        </motion.div>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-2 mt-6"
        >
          {action && (
            <Button
              onClick={action.onClick}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="gap-2 border-border text-foreground"
            >
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Preset: No Books ─────────────────────────────────────────────────────────

export function EmptyStateNoBooks({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      illustration="books"
      icon={BookOpen}
      title="No books in the catalogue"
      description="Your library catalogue is empty. Add your first book to get started managing your collection."
      action={onAdd ? { label: "Add First Book", onClick: onAdd, icon: Plus } : undefined}
      hints={["Title & author", "ISBN number", "Category"]}
    />
  )
}

// ─── Preset: No Search Results ────────────────────────────────────────────────

export function EmptyStateNoResults({
  onClear,
  query,
}: {
  onClear?: () => void
  query?: string
}) {
  return (
    <EmptyState
      illustration="search"
      icon={Search}
      title="No results found"
      description={
        query
          ? `No matches for "${query}". Try a different search term or adjust your filters.`
          : "No items match your current filters. Try broadening your search."
      }
      action={onClear ? { label: "Clear filters", onClick: onClear, icon: SlidersHorizontal } : undefined}
      hints={["Check spelling", "Try fewer keywords", "Remove filters"]}
    />
  )
}

// ─── Preset: No Transactions ──────────────────────────────────────────────────

export function EmptyStateNoTransactions({
  isFiltered,
  onClear,
}: {
  isFiltered?: boolean
  onClear?: () => void
}) {
  if (isFiltered) {
    return (
      <EmptyState
        illustration="search"
        icon={Search}
        title="No matching transactions"
        description="No transactions match your current search or filter. Try adjusting your criteria."
        action={onClear ? { label: "Clear filters", onClick: onClear, icon: SlidersHorizontal } : undefined}
        hints={["Try a different status", "Search by book title", "Search by member name"]}
      />
    )
  }

  return (
    <EmptyState
      illustration="transactions"
      icon={ArrowLeftRight}
      title="No transactions yet"
      description="Transaction history will appear here once books are issued to library members."
      hints={["Issue a book to create the first transaction"]}
    />
  )
}

// ─── Preset: No Data (generic) ────────────────────────────────────────────────

export function EmptyStateNoData({
  title = "Nothing here yet",
  description = "Data will appear here once it's available.",
  action,
}: {
  title?: string
  description?: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <EmptyState
      illustration="inbox"
      icon={Inbox}
      title={title}
      description={description}
      action={action}
    />
  )
}

// ─── Preset: Error ────────────────────────────────────────────────────────────

export function EmptyStateError({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={RefreshCw}
      title="Something went wrong"
      description="We couldn't load this data. This is usually a temporary issue."
      action={onRetry ? { label: "Try again", onClick: onRetry, icon: RefreshCw } : undefined}
    />
  )
}

// ─── Compact inline variant ───────────────────────────────────────────────────

/**
 * Smaller empty state for use inside cards, panels, and table bodies.
 * No illustration — just icon + text + optional action.
 */
export function InlineEmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ElementType
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  className?: string
}) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 px-4 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60 border border-border">
        <Icon className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">{description}</p>
        )}
      </div>
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="mt-1 gap-1.5 h-8 text-xs border-border"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}
