"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  RotateCcw, BookOpen, User, Calendar, Clock,
  AlertTriangle, IndianRupee, CheckCircle2,
} from "lucide-react"
import { format, parseISO, differenceInCalendarDays } from "date-fns"
import { cn } from "@/lib/utils"
import type { ActiveTransaction } from "@/hooks/use-return-form"

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReturnSummaryCardProps {
  transaction: ActiveTransaction | null
  previewFine: (dueDate: string) => number
}

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
  valueClassName,
  delay = 0,
}: {
  icon: React.ElementType
  label: string
  value: string
  valueClassName?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.2 }}
      className="flex items-center gap-3"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/60">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
        <span className="text-xs text-muted-foreground shrink-0">{label}</span>
        <span className={cn("text-xs font-semibold text-right truncate", valueClassName ?? "text-foreground")}>
          {value}
        </span>
      </div>
    </motion.div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReturnSummaryCard({ transaction, previewFine }: ReturnSummaryCardProps) {
  return (
    <AnimatePresence mode="wait">
      {transaction ? (
        <motion.div
          key={transaction.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* ── Overdue banner (shown above card when overdue) ── */}
          {transaction.status === "OVERDUE" && (() => {
            const days = differenceInCalendarDays(new Date(), parseISO(transaction.dueDate))
            const fine = previewFine(transaction.dueDate)
            return (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.2 }}
                className="mb-3 overflow-hidden"
              >
                <div className="rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 flex items-center gap-3">
                  {/* Pulsing dot */}
                  <div className="relative shrink-0">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive/15 border border-destructive/25">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </span>
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-destructive">
                      {days} day{days !== 1 ? "s" : ""} overdue
                    </p>
                    <p className="text-xs text-destructive/70 mt-0.5">
                      Estimated fine will be applied on return
                    </p>
                  </div>
                  {/* Fine badge */}
                  <div className="shrink-0 flex items-center gap-1 rounded-xl bg-destructive/15 border border-destructive/25 px-3 py-1.5">
                    <IndianRupee className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-sm font-bold text-destructive tabular-nums">
                      {fine.toFixed(0)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })()}

          {/* ── Main summary card ── */}
          <div
            className={cn(
              "rounded-2xl border overflow-hidden",
              transaction.status === "OVERDUE"
                ? "border-destructive/20 bg-gradient-to-br from-destructive/5 via-card/60 to-card/40"
                : "border-primary/20 bg-gradient-to-br from-primary/5 via-card/60 to-card/40",
              "backdrop-blur-sm"
            )}
          >
            {/* Card header */}
            <div
              className={cn(
                "flex items-start gap-3 px-5 py-4 border-b",
                transaction.status === "OVERDUE"
                  ? "border-destructive/15 bg-destructive/5"
                  : "border-primary/15 bg-primary/5"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                  transaction.status === "OVERDUE"
                    ? "bg-destructive/10 border-destructive/20"
                    : "bg-primary/10 border-primary/20"
                )}
              >
                <BookOpen
                  className={cn(
                    "h-5 w-5",
                    transaction.status === "OVERDUE" ? "text-destructive" : "text-primary"
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground leading-snug line-clamp-2">
                  {transaction.bookTitle}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Issued to{" "}
                  <span className="font-medium text-foreground">{transaction.userName}</span>
                </p>
              </div>
              {/* Status pill */}
              <div
                className={cn(
                  "shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold border",
                  transaction.status === "OVERDUE"
                    ? "bg-destructive/15 border-destructive/25 text-destructive"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                )}
              >
                {transaction.status === "OVERDUE" ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                    OVERDUE
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    ACTIVE
                  </>
                )}
              </div>
            </div>

            {/* Detail rows */}
            <div className="px-5 py-4 space-y-3">
              <DetailRow
                icon={User}
                label="Member"
                value={transaction.userName}
                delay={0.05}
              />
              <div className="border-t border-border/40" />
              <DetailRow
                icon={Calendar}
                label="Issue date"
                value={format(parseISO(transaction.issueDate), "MMM d, yyyy")}
                delay={0.1}
              />
              <DetailRow
                icon={Clock}
                label="Due date"
                value={format(parseISO(transaction.dueDate), "MMM d, yyyy")}
                valueClassName={
                  transaction.status === "OVERDUE"
                    ? "text-destructive"
                    : "text-foreground"
                }
                delay={0.15}
              />
              <DetailRow
                icon={Calendar}
                label="Return date"
                value={format(new Date(), "MMM d, yyyy") + " (today)"}
                valueClassName="text-primary"
                delay={0.2}
              />

              {/* Fine row — only when overdue */}
              {transaction.status === "OVERDUE" && (
                <>
                  <div className="border-t border-destructive/15" />
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                      <IndianRupee className="h-3.5 w-3.5 text-destructive" />
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-4">
                      <span className="text-xs text-muted-foreground shrink-0">
                        Estimated fine
                      </span>
                      <span className="text-sm font-bold text-destructive tabular-nums">
                        ₹{previewFine(transaction.dueDate).toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                  <p className="text-[11px] text-muted-foreground/60 pl-10">
                    ₹5 per day · final amount confirmed on return
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        /* ── Empty placeholder ── */
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="rounded-2xl border border-dashed border-border/50 bg-muted/10 p-10 flex flex-col items-center gap-3 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
            <RotateCcw className="h-6 w-6 text-muted-foreground/30" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              No book selected
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Select an issued book above to preview return details
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
