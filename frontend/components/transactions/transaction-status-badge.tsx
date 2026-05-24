import { cn } from "@/lib/utils"
import type { TransactionRow } from "@/lib/transaction-service"

// ─── Config ───────────────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  TransactionRow["status"],
  { label: string; dot: string; badge: string }
> = {
  ACTIVE: {
    label: "Active",
    dot: "bg-primary",
    badge: "bg-primary/10 text-primary border-primary/20",
  },
  RETURNED: {
    label: "Returned",
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  OVERDUE: {
    label: "Overdue",
    dot: "bg-destructive animate-pulse",
    badge: "bg-destructive/10 text-destructive border-destructive/20",
  },
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionStatusBadgeProps {
  status: TransactionRow["status"]
  size?: "sm" | "md"
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TransactionStatusBadge({
  status,
  size = "md",
}: TransactionStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.ACTIVE

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        cfg.badge
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  )
}
