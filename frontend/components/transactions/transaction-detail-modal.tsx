"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { TransactionStatusBadge } from "@/components/transactions/transaction-status-badge"
import {
  BookOpen, User, Calendar, Clock,
  RotateCcw, IndianRupee, Hash, ArrowLeftRight,
} from "lucide-react"
import { format, parseISO, differenceInCalendarDays } from "date-fns"
import { cn } from "@/lib/utils"
import type { TransactionRow } from "@/lib/transaction-service"

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  valueClassName?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/60 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
        <span className="text-xs text-muted-foreground shrink-0 pt-0.5">{label}</span>
        <span className={cn("text-xs font-semibold text-right", valueClassName ?? "text-foreground")}>
          {value}
        </span>
      </div>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionDetailModalProps {
  transaction: TransactionRow | null
  open: boolean
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TransactionDetailModal({
  transaction: tx,
  open,
  onClose,
}: TransactionDetailModalProps) {
  if (!tx) return null

  const overdueDays =
    tx.status === "OVERDUE"
      ? differenceInCalendarDays(new Date(), parseISO(tx.dueDate))
      : 0

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-md p-0 overflow-hidden">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* ── Header ── */}
              <div
                className={cn(
                  "flex items-center gap-3 px-6 pt-6 pb-5 border-b border-border",
                  tx.status === "OVERDUE" ? "bg-destructive/5" : "bg-muted/20"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                    tx.status === "OVERDUE"
                      ? "bg-destructive/10 border-destructive/20"
                      : "bg-primary/10 border-primary/20"
                  )}
                >
                  <ArrowLeftRight
                    className={cn(
                      "h-5 w-5",
                      tx.status === "OVERDUE" ? "text-destructive" : "text-primary"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold text-foreground leading-tight">
                      Transaction #{tx.id}
                    </DialogTitle>
                  </DialogHeader>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Full transaction details
                  </DialogDescription>
                </div>
                <TransactionStatusBadge status={tx.status} />
              </div>

              {/* ── Body ── */}
              <div className="px-6 py-5 space-y-5">

                {/* Overdue alert */}
                {tx.status === "OVERDUE" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-start gap-3 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3"
                  >
                    <div className="relative shrink-0 mt-0.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-destructive/15">
                        <Clock className="h-3.5 w-3.5 text-destructive" />
                      </span>
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive border border-card animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-destructive">
                        {overdueDays} day{overdueDays !== 1 ? "s" : ""} overdue
                      </p>
                      <p className="text-xs text-destructive/70 mt-0.5">
                        Fine accruing at ₹5 per day
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Book section */}
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Book
                  </p>
                  <DetailRow icon={BookOpen} label="Title" value={tx.bookTitle} />
                  <DetailRow
                    icon={Hash}
                    label="Book ID"
                    value={`#${tx.bookId}`}
                    valueClassName="text-muted-foreground font-mono"
                  />
                </div>

                <div className="border-t border-border/50" />

                {/* Member section */}
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Member
                  </p>
                  <DetailRow icon={User} label="Name" value={tx.userName} />
                  <DetailRow
                    icon={Hash}
                    label="User ID"
                    value={`#${tx.userId}`}
                    valueClassName="text-muted-foreground font-mono"
                  />
                </div>

                <div className="border-t border-border/50" />

                {/* Dates section */}
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Dates
                  </p>
                  <DetailRow
                    icon={Calendar}
                    label="Issue date"
                    value={format(parseISO(tx.issueDate), "dd MMM yyyy")}
                  />
                  <DetailRow
                    icon={Clock}
                    label="Due date"
                    value={format(parseISO(tx.dueDate), "dd MMM yyyy")}
                    valueClassName={
                      tx.status === "OVERDUE" ? "text-destructive" : "text-foreground"
                    }
                  />
                  <DetailRow
                    icon={RotateCcw}
                    label="Return date"
                    value={
                      tx.returnDate
                        ? format(parseISO(tx.returnDate), "dd MMM yyyy")
                        : <span className="text-muted-foreground/40 font-normal">Not returned</span>
                    }
                    valueClassName={tx.returnDate ? "text-emerald-500" : undefined}
                  />
                </div>

                {/* Fine section — only when a fine exists */}
                {tx.fine > 0 && (
                  <>
                    <div className="border-t border-border/50" />
                    <div
                      className="flex items-center gap-3 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-destructive/15">
                        <IndianRupee className="h-3.5 w-3.5 text-destructive" />
                      </div>
                      <div className="flex-1 flex items-center justify-between gap-2">
                        <span className="text-xs text-destructive/80">Fine charged</span>
                        <span className="text-sm font-bold text-destructive tabular-nums">
                          ₹{tx.fine.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
