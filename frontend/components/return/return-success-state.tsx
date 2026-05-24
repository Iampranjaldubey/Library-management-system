"use client"

import { motion } from "framer-motion"
import {
  CheckCircle2, BookOpen, User, Calendar,
  IndianRupee, RotateCcw, AlertTriangle, Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ReturnedResult } from "@/hooks/use-return-form"

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReturnSuccessStateProps {
  result: ReturnedResult
  onReturnAnother: () => void
}

// ─── Detail row ───────────────────────────────────────────────────────────────

function ReceiptRow({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ElementType
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/60">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn("text-xs font-semibold text-right", valueClassName ?? "text-foreground")}>
          {value}
        </span>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReturnSuccessState({ result, onReturnAnother }: ReturnSuccessStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "rounded-2xl border overflow-hidden",
        result.wasOverdue
          ? "border-destructive/20"
          : "border-primary/20"
      )}
    >
      {/* ── Top gradient band ── */}
      <div
        className={cn(
          "px-8 pt-10 pb-8 text-center",
          result.wasOverdue
            ? "bg-gradient-to-b from-destructive/8 via-destructive/4 to-transparent"
            : "bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"
        )}
      >
        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 14 }}
          className="flex justify-center mb-5"
        >
          <div className="relative">
            <div
              className={cn(
                "flex h-20 w-20 items-center justify-center rounded-3xl border shadow-xl",
                result.wasOverdue
                  ? "bg-destructive/10 border-destructive/25 shadow-destructive/10"
                  : "bg-primary/10 border-primary/25 shadow-primary/15"
              )}
            >
              <CheckCircle2
                className={cn(
                  "h-10 w-10",
                  result.wasOverdue ? "text-destructive" : "text-primary"
                )}
              />
            </div>
            {/* Sparkle badge */}
            {!result.wasOverdue && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                className="absolute -top-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary border-2 border-background shadow-md"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-foreground tracking-tight">
            Book Returned
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5">
            {result.wasOverdue
              ? "Return processed — a late fine has been recorded"
              : "Return processed successfully — no fine applied"}
          </p>
        </motion.div>
      </div>

      {/* ── Receipt card ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mx-6 mb-6 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden"
      >
        {/* Receipt header */}
        <div className="px-4 py-3 border-b border-border/60 bg-muted/20 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Return Receipt
          </p>
        </div>

        {/* Receipt rows */}
        <div className="px-4 py-4 space-y-3">
          <ReceiptRow icon={BookOpen} label="Book" value={result.bookTitle} />
          <ReceiptRow icon={User} label="Member" value={result.userName} />
          <ReceiptRow
            icon={Calendar}
            label="Return date"
            value={result.returnDate}
            valueClassName="text-primary"
          />

          {/* Fine row */}
          <div className="border-t border-border/50 pt-3 mt-1">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                  result.wasOverdue ? "bg-destructive/10" : "bg-emerald-500/10"
                )}
              >
                <IndianRupee
                  className={cn(
                    "h-3.5 w-3.5",
                    result.wasOverdue ? "text-destructive" : "text-emerald-500"
                  )}
                />
              </div>
              <div className="flex-1 flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Fine charged</span>
                {result.wasOverdue ? (
                  <span className="text-sm font-bold text-destructive tabular-nums">
                    ₹{result.fine.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-sm font-bold text-emerald-500 tabular-nums">
                    ₹0.00
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Fine warning (overdue only) ── */}
      {result.wasOverdue && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mx-6 mb-6 flex items-start gap-3 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3.5"
        >
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Late return fine applied</p>
            <p className="text-xs text-destructive/70 mt-0.5">
              ₹{result.fine.toFixed(2)} has been recorded against this transaction.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Action ── */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.44 }}
        className="px-6 pb-8 flex justify-center"
      >
        <Button
          onClick={onReturnAnother}
          variant="outline"
          className="gap-2 border-border text-foreground hover:bg-muted/50 px-6"
        >
          <RotateCcw className="h-4 w-4" />
          Return another book
        </Button>
      </motion.div>
    </motion.div>
  )
}
