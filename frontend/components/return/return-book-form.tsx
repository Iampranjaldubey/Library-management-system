"use client"

import { motion, AnimatePresence } from "framer-motion"
import { TransactionSelect } from "@/components/return/transaction-select"
import { ReturnSummaryCard } from "@/components/return/return-summary-card"
import { ReturnSuccessState } from "@/components/return/return-success-state"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  RotateCcw, Loader2, BookOpen, Check,
  AlertTriangle, BookCheck,
} from "lucide-react"
import type { useReturnForm } from "@/hooks/use-return-form"

// ─── Props ────────────────────────────────────────────────────────────────────

type ReturnFormState = ReturnType<typeof useReturnForm>
interface ReturnBookFormProps extends ReturnFormState {}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({
  icon: Icon,
  label,
  value,
  variant = "default",
}: {
  icon: React.ElementType
  label: string
  value: number
  variant?: "default" | "warning"
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1",
        variant === "warning"
          ? "bg-destructive/10 border-destructive/20"
          : "bg-primary/10 border-primary/20"
      )}
    >
      <Icon
        className={cn(
          "h-3 w-3",
          variant === "warning" ? "text-destructive" : "text-primary"
        )}
      />
      <span
        className={cn(
          "text-xs font-semibold tabular-nums",
          variant === "warning" ? "text-destructive" : "text-primary"
        )}
      >
        {value}
      </span>
      <span
        className={cn(
          "text-[10px]",
          variant === "warning" ? "text-destructive/70" : "text-primary/70"
        )}
      >
        {label}
      </span>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReturnBookForm({
  activeTransactions,
  selectedTransactionId,
  setSelectedTransactionId,
  isSubmitting,
  returnedResult,
  selectedTransaction,
  previewFine,
  onSubmit,
  resetForm,
}: ReturnBookFormProps) {
  const overdueCount = activeTransactions.filter((t) => t.status === "OVERDUE").length
  const activeCount = activeTransactions.filter((t) => t.status === "ACTIVE").length

  return (
    <AnimatePresence mode="wait">
      {returnedResult ? (
        /* ── Success state ── */
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.25 }}
          className="max-w-lg mx-auto"
        >
          <ReturnSuccessState result={returnedResult} onReturnAnother={resetForm} />
        </motion.div>
      ) : (
        /* ── Form ── */
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <form onSubmit={onSubmit} noValidate>
            {/* ── Two-column grid on lg+ ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">

              {/* ── Left column: form card ── */}
              <div className="space-y-5">

                {/* Overdue alert strip */}
                <AnimatePresence>
                  {overdueCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3">
                        <div className="relative shrink-0">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                        </div>
                        <p className="text-sm text-destructive font-medium flex-1">
                          {overdueCount} book{overdueCount !== 1 ? "s are" : " is"} overdue
                          {" "}— fines will be applied on return
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main form card */}
                <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">

                  {/* Card header */}
                  <div className="flex flex-wrap items-center gap-3 px-6 py-5 border-b border-border bg-muted/20">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                      <RotateCcw className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-foreground">Return Details</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Select an issued book to process the return
                      </p>
                    </div>
                    {/* Stats pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {activeCount > 0 && (
                        <StatPill icon={BookOpen} label="active" value={activeCount} />
                      )}
                      {overdueCount > 0 && (
                        <StatPill
                          icon={AlertTriangle}
                          label="overdue"
                          value={overdueCount}
                          variant="warning"
                        />
                      )}
                    </div>
                  </div>

                  {/* Form body */}
                  <div className="px-6 py-6">
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 }}
                    >
                      <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <BookCheck className="h-3.5 w-3.5 text-muted-foreground" />
                        Issued Book
                        <span className="text-destructive" aria-hidden>*</span>
                      </Label>
                      <TransactionSelect
                        transactions={activeTransactions}
                        value={selectedTransactionId}
                        onChange={setSelectedTransactionId}
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-muted-foreground pt-0.5">
                        Only active and overdue transactions are shown
                      </p>
                    </motion.div>
                  </div>

                  {/* Card footer / actions */}
                  <div className="flex items-center gap-3 px-6 py-4 border-t border-border bg-muted/10">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-border text-foreground hover:bg-muted/50"
                      onClick={resetForm}
                      disabled={isSubmitting}
                    >
                      Reset
                    </Button>

                    <Button
                      type="submit"
                      disabled={!selectedTransactionId || isSubmitting}
                      className={cn(
                        "gap-2 min-w-[160px] transition-all",
                        selectedTransaction?.status === "OVERDUE"
                          ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing…
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          {selectedTransaction?.status === "OVERDUE"
                            ? "Return & Apply Fine"
                            : "Process Return"}
                        </>
                      )}
                    </Button>

                    {/* Overdue fine preview next to button */}
                    <AnimatePresence>
                      {selectedTransaction?.status === "OVERDUE" && (
                        <motion.span
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          className="text-xs text-destructive font-medium tabular-nums"
                        >
                          ₹{previewFine(selectedTransaction.dueDate).toFixed(0)} fine
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* ── Right column: live preview ── */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.22 }}
                className="lg:sticky lg:top-6"
              >
                <div className="space-y-2 mb-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
                    Return Preview
                  </p>
                </div>
                <ReturnSummaryCard
                  transaction={selectedTransaction}
                  previewFine={previewFine}
                />
              </motion.div>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
