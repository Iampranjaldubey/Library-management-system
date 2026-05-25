"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { useTransactions } from "@/hooks/use-transactions"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageTransition } from "@/components/ui/page-transition"
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton"
import { SmartErrorBanner } from "@/components/ui/error-state"
import { TransactionsFilters } from "@/components/transactions/transactions-filters"
import { TransactionsTable, TransactionsTableSkeleton } from "@/components/transactions/transactions-table"
import { Button } from "@/components/ui/button"
import {
  RefreshCw, ArrowLeftRight,
  BookOpen, RotateCcw, AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  variant = "default",
}: {
  icon: React.ElementType
  label: string
  value: number
  variant?: "default" | "success" | "warning"
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 sm:px-4 sm:py-3",
        "bg-card/60 backdrop-blur-sm transition-colors",
        variant === "warning"
          ? "border-destructive/20 hover:border-destructive/30"
          : variant === "success"
          ? "border-emerald-500/20 hover:border-emerald-500/30"
          : "border-border hover:border-primary/20"
      )}
    >
      <div
        className={cn(
          "flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg",
          variant === "warning"
            ? "bg-destructive/10"
            : variant === "success"
            ? "bg-emerald-500/10"
            : "bg-primary/10"
        )}
      >
        <Icon
          className={cn(
            "h-3.5 w-3.5 sm:h-4 sm:w-4",
            variant === "warning"
              ? "text-destructive"
              : variant === "success"
              ? "text-emerald-500"
              : "text-primary"
          )}
        />
      </div>
      <div className="min-w-0">
        <p className="text-base sm:text-lg font-bold text-foreground tabular-nums leading-none">
          {value}
        </p>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">{label}</p>
      </div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card/60 px-3 py-2.5 sm:px-4 sm:py-3">
      <ShimmerSkeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg shrink-0" />
      <div className="space-y-1.5">
        <ShimmerSkeleton className="h-4 sm:h-5 w-7 sm:w-8" />
        <ShimmerSkeleton className="h-2.5 sm:h-3 w-12 sm:w-16" />
      </div>
    </div>
  )
}



// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const { isLoading: authLoading } = useProtectedRoute({ allowedRoles: ["ADMIN", "LIBRARIAN"] })

  const {
    filtered,
    isLoading,
    fetchError,
    counts,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortField,
    sortDir,
    toggleSort,
    fetchTransactions,
  } = useTransactions()

  useEffect(() => {
    if (!authLoading) fetchTransactions()
  }, [authLoading, fetchTransactions])

  if (authLoading) return null

  const isFiltered = searchQuery.trim() !== "" || statusFilter !== "all"

  return (
    <PageTransition>
      <div className="space-y-6">
      {/* ── Page header ── */}
      <PageHeader
        title="Transactions"
        description="All book issue and return records"
      >
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 border-border"
          onClick={fetchTransactions}
          disabled={isLoading}
          aria-label="Refresh transactions"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </PageHeader>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
              <StatCard icon={ArrowLeftRight} label="Total" value={counts.total} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <StatCard icon={BookOpen} label="Active" value={counts.active} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <StatCard icon={RotateCcw} label="Returned" value={counts.returned} variant="success" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <StatCard icon={AlertTriangle} label="Overdue" value={counts.overdue} variant="warning" />
            </motion.div>
          </>
        )}
      </div>

      {/* ── Error banner ── */}
      {fetchError && !isLoading && (
        <SmartErrorBanner
          message={fetchError}
          onRetry={fetchTransactions}
        />
      )}

      {/* ── Filters ── */}
      <TransactionsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        resultCount={filtered.length}
        totalCount={counts.total}
        disabled={isLoading}
      />

      {/* ── Table / skeleton ── */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <TransactionsTableSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <TransactionsTable
              transactions={filtered}
              totalCount={counts.total}
              sortField={sortField}
              sortDir={sortDir}
              onSort={toggleSort}
              isFiltered={isFiltered}
            />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </PageTransition>
  )
}
