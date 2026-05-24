"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { TransactionStatusBadge } from "@/components/transactions/transaction-status-badge"
import { TransactionDetailModal } from "@/components/transactions/transaction-detail-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowUpDown, ArrowUp, ArrowDown,
  ArrowLeftRight, BookOpen, User,
  Calendar, IndianRupee, ChevronLeft,
  ChevronRight, Eye,
} from "lucide-react"
import { format, parseISO, differenceInCalendarDays } from "date-fns"
import type { TransactionRow } from "@/lib/transaction-service"
import type { SortField, SortDir } from "@/hooks/use-transactions"

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

// ─── Column config ────────────────────────────────────────────────────────────

interface Column {
  key: SortField | "returnDate" | "fine" | "actions"
  label: string
  sortable: boolean
  hideClass?: string
  align?: "right"
}

const COLUMNS: Column[] = [
  { key: "id",         label: "ID",          sortable: true  },
  { key: "bookTitle",  label: "Book",         sortable: true  },
  { key: "userName",   label: "Member",       sortable: true  },
  { key: "issueDate",  label: "Issue Date",   sortable: true,  hideClass: "hidden md:table-cell" },
  { key: "dueDate",    label: "Due Date",     sortable: true,  hideClass: "hidden md:table-cell" },
  { key: "returnDate", label: "Return Date",  sortable: false, hideClass: "hidden lg:table-cell" },
  { key: "status",     label: "Status",       sortable: true  },
  { key: "fine",       label: "Fine",         sortable: false, hideClass: "hidden lg:table-cell", align: "right" },
  { key: "actions",    label: "",             sortable: false, align: "right" },
]

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ field, activeField, dir }: { field: string; activeField: SortField; dir: SortDir }) {
  if (field !== activeField) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/40 ml-1 inline shrink-0" />
  return dir === "asc"
    ? <ArrowUp className="h-3 w-3 text-primary ml-1 inline shrink-0" />
    : <ArrowDown className="h-3 w-3 text-primary ml-1 inline shrink-0" />
}

// ─── Table skeleton ───────────────────────────────────────────────────────────

export function TransactionsTableSkeleton() {
  return (
    <div className="space-y-3">
      {/* Desktop skeleton */}
      <div className="hidden md:block rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/20 flex gap-4">
          {[60, 180, 120, 100, 100, 100, 80, 60].map((w, i) => (
            <Skeleton key={i} className="h-3 rounded" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-4 py-3.5 border-b border-border/50 last:border-0 flex gap-4 items-center">
            {[60, 180, 120, 100, 100, 100, 80, 60].map((w, j) => (
              <Skeleton key={j} className="h-4 rounded" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>

      {/* Mobile skeleton */}
      <div className="md:hidden space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-3 w-24" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 py-20 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 border border-border">
        <ArrowLeftRight className="h-8 w-8 text-muted-foreground/30" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          {isFiltered ? "No matching transactions" : "No transactions yet"}
        </p>
        <p className="text-xs text-muted-foreground max-w-xs">
          {isFiltered
            ? "Try adjusting your search or filter to find what you're looking for."
            : "Transactions will appear here once books are issued to members."}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Mobile card ─────────────────────────────────────────────────────────────

function TransactionCard({
  tx,
  index,
  onView,
}: {
  tx: TransactionRow
  index: number
  onView: (tx: TransactionRow) => void
}) {
  const isOverdue = tx.status === "OVERDUE"
  const overdueDays = isOverdue
    ? differenceInCalendarDays(new Date(), parseISO(tx.dueDate))
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      onClick={() => onView(tx)}
      className={cn(
        "rounded-2xl border bg-card/60 backdrop-blur-sm p-4 space-y-3 cursor-pointer",
        "transition-all duration-150 active:scale-[0.99]",
        isOverdue
          ? "border-destructive/25 hover:border-destructive/40 hover:bg-destructive/5"
          : "border-border hover:border-primary/30 hover:bg-muted/30"
      )}
    >
      {/* Top row: book + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5",
              isOverdue ? "bg-destructive/10" : "bg-primary/10"
            )}
          >
            <BookOpen
              className={cn("h-4 w-4", isOverdue ? "text-destructive" : "text-primary")}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate leading-snug">
              {tx.bookTitle}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <User className="h-3 w-3 shrink-0" />
              {tx.userName}
            </p>
          </div>
        </div>
        <TransactionStatusBadge status={tx.status} size="sm" />
      </div>

      {/* Overdue warning strip */}
      {isOverdue && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/8 border border-destructive/15 px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse shrink-0" />
          <p className="text-xs text-destructive font-medium">
            {overdueDays} day{overdueDays !== 1 ? "s" : ""} overdue
          </p>
          {tx.fine > 0 && (
            <span className="ml-auto text-xs font-bold text-destructive tabular-nums">
              ₹{tx.fine.toFixed(2)}
            </span>
          )}
        </div>
      )}

      {/* Date grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-muted-foreground/60 shrink-0" />
          <span className="text-[11px] text-muted-foreground">
            Issued {format(parseISO(tx.issueDate), "dd MMM yy")}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-muted-foreground/60 shrink-0" />
          <span className={cn("text-[11px]", isOverdue ? "text-destructive font-medium" : "text-muted-foreground")}>
            Due {format(parseISO(tx.dueDate), "dd MMM yy")}
          </span>
        </div>
        {tx.returnDate && (
          <div className="flex items-center gap-1.5 col-span-2">
            <Calendar className="h-3 w-3 text-emerald-500/60 shrink-0" />
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
              Returned {format(parseISO(tx.returnDate), "dd MMM yy")}
            </span>
          </div>
        )}
      </div>

      {/* Footer: ID + fine */}
      <div className="flex items-center justify-between pt-1 border-t border-border/40">
        <span className="font-mono text-[11px] text-muted-foreground/60">#{tx.id}</span>
        {tx.fine > 0 ? (
          <span className="flex items-center gap-1 text-xs font-bold text-destructive">
            <IndianRupee className="h-3 w-3" />
            {tx.fine.toFixed(2)} fine
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground/40">No fine</span>
        )}
      </div>
    </motion.div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number
  totalPages: number
  onPage: (p: number) => void
}) {
  if (totalPages <= 1) return null

  // Build page numbers with ellipsis
  const pages: (number | "…")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push("…")
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push("…")
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-between gap-2 pt-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="h-8 gap-1.5 border-border text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Prev
      </Button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={cn(
                "h-8 w-8 rounded-lg text-xs font-medium transition-all",
                p === page
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {p}
            </button>
          )
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="h-8 gap-1.5 border-border text-foreground"
      >
        Next
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionsTableProps {
  transactions: TransactionRow[]
  totalCount: number
  sortField: SortField
  sortDir: SortDir
  onSort: (field: SortField) => void
  isFiltered: boolean
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TransactionsTable({
  transactions,
  totalCount,
  sortField,
  sortDir,
  onSort,
  isFiltered,
}: TransactionsTableProps) {
  const [page, setPage] = useState(1)
  const [selectedTx, setSelectedTx] = useState<TransactionRow | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = transactions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleView = (tx: TransactionRow) => {
    setSelectedTx(tx)
    setModalOpen(true)
  }

  const handleSort = (field: SortField) => {
    setPage(1)
    onSort(field)
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
        <EmptyState isFiltered={isFiltered} />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* ── Desktop table ── */}
        <div className="hidden md:block rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent bg-muted/20">
                {COLUMNS.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      "text-muted-foreground font-semibold text-[11px] uppercase tracking-wider select-none py-3",
                      col.hideClass,
                      col.sortable && "cursor-pointer hover:text-foreground transition-colors",
                      col.align === "right" && "text-right"
                    )}
                    onClick={col.sortable ? () => handleSort(col.key as SortField) : undefined}
                  >
                    {col.label}
                    {col.sortable && (
                      <SortIcon field={col.key} activeField={sortField} dir={sortDir} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              <AnimatePresence initial={false}>
                {paginated.map((tx, i) => {
                  const isOverdue = tx.status === "OVERDUE"
                  return (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => handleView(tx)}
                      className={cn(
                        "border-border transition-colors cursor-pointer group",
                        isOverdue
                          ? "hover:bg-destructive/5"
                          : "hover:bg-muted/30"
                      )}
                    >
                      {/* ID */}
                      <TableCell className="font-mono text-xs text-muted-foreground/60 w-14 py-3.5">
                        #{tx.id}
                      </TableCell>

                      {/* Book */}
                      <TableCell className="py-3.5 max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                            isOverdue ? "bg-destructive/10" : "bg-primary/10"
                          )}>
                            <BookOpen className={cn("h-3.5 w-3.5", isOverdue ? "text-destructive" : "text-primary")} />
                          </div>
                          <span className="text-sm font-medium text-foreground truncate">
                            {tx.bookTitle}
                          </span>
                        </div>
                      </TableCell>

                      {/* Member */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                          <span className="text-sm text-muted-foreground">{tx.userName}</span>
                        </div>
                      </TableCell>

                      {/* Issue date */}
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell tabular-nums py-3.5">
                        {format(parseISO(tx.issueDate), "dd MMM yyyy")}
                      </TableCell>

                      {/* Due date */}
                      <TableCell
                        className={cn(
                          "hidden md:table-cell tabular-nums text-sm py-3.5",
                          isOverdue ? "text-destructive font-semibold" : "text-muted-foreground"
                        )}
                      >
                        {format(parseISO(tx.dueDate), "dd MMM yyyy")}
                        {isOverdue && (
                          <span className="ml-1.5 text-[10px] font-normal opacity-70">
                            ({differenceInCalendarDays(new Date(), parseISO(tx.dueDate))}d)
                          </span>
                        )}
                      </TableCell>

                      {/* Return date */}
                      <TableCell className="hidden lg:table-cell tabular-nums text-sm py-3.5">
                        {tx.returnDate ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {format(parseISO(tx.returnDate), "dd MMM yyyy")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3.5">
                        <TransactionStatusBadge status={tx.status} />
                      </TableCell>

                      {/* Fine */}
                      <TableCell className="hidden lg:table-cell tabular-nums text-right py-3.5">
                        {tx.fine > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-full px-2 py-0.5">
                            <IndianRupee className="h-3 w-3" />
                            {tx.fine.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30 text-sm">—</span>
                        )}
                      </TableCell>

                      {/* View action */}
                      <TableCell className="text-right py-3.5 w-10">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                          <Eye className="h-3.5 w-3.5" />
                        </span>
                      </TableCell>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* ── Mobile cards ── */}
        <div className="md:hidden space-y-3">
          <AnimatePresence initial={false}>
            {paginated.map((tx, i) => (
              <TransactionCard key={tx.id} tx={tx} index={i} onView={handleView} />
            ))}
          </AnimatePresence>
        </div>

        {/* ── Pagination ── */}
        <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
      </div>

      {/* ── Detail modal ── */}
      <TransactionDetailModal
        transaction={selectedTx}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
