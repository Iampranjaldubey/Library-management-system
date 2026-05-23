"use client"

import { useState, useEffect, useCallback } from "react"
import { transactionsApi, ApiError, type TransactionDto } from "@/lib/api"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { PageHeader } from "@/components/dashboard/page-header"
import { TableSkeleton } from "@/components/dashboard/skeletons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { RefreshCw, Search, ArrowLeftRight, AlertCircle } from "lucide-react"
import { format, parseISO } from "date-fns"
import { toast } from "sonner"

// Backend status values — use these directly instead of recomputing
type BackendStatus = TransactionDto["status"]
type StatusFilter = "all" | BackendStatus

const STATUS_CONFIG: Record<
  BackendStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Active",
    className: "bg-primary/15 text-primary border-primary/20",
  },
  RETURNED: {
    label: "Returned",
    className: "bg-muted text-muted-foreground border-border",
  },
  OVERDUE: {
    label: "Overdue",
    className: "bg-destructive/15 text-destructive border-destructive/20",
  },
}

export default function TransactionsPage() {
  const { isLoading: authLoading } = useProtectedRoute({ allowedRoles: ["ADMIN", "LIBRARIAN"] })

  const [transactions, setTransactions] = useState<TransactionDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const res = await transactionsApi.getAll()
      if (res.success && Array.isArray(res.data)) {
        setTransactions(res.data)
      }
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? `${err.message} (HTTP ${err.status})`
          : String(err)
      setFetchError(msg)
      toast.error("Failed to load transactions", { description: msg })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) fetchTransactions()
  }, [authLoading, fetchTransactions])

  const filtered = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      tx.bookTitle.toLowerCase().includes(q) ||
      tx.userName.toLowerCase().includes(q)
    const matchesStatus =
      statusFilter === "all" || tx.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (authLoading) return null

  return (
    <div className="space-y-6">
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
          aria-label="Refresh"
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
        </Button>
      </PageHeader>

      {/* Error banner */}
      {fetchError && !isLoading && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive">
              Failed to load transactions
            </p>
            <p className="text-xs text-destructive/80 mt-0.5">{fetchError}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2 text-xs shrink-0"
            onClick={fetchTransactions}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by book or member…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-40 bg-input border-border text-foreground">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="RETURNED">Returned</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={8} />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ArrowLeftRight />
              </EmptyMedia>
              <EmptyTitle>No transactions found</EmptyTitle>
              <EmptyDescription>
                {searchQuery || statusFilter !== "all"
                  ? "No transactions match your current filters."
                  : "No transactions have been recorded yet."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent bg-muted/20">
                {[
                  "ID",
                  "Book",
                  "Member",
                  "Issue Date",
                  "Due Date",
                  "Return Date",
                  "Status",
                  "Fine",
                ].map((h, i) => (
                  <TableHead
                    key={h}
                    className={`text-muted-foreground font-medium text-xs uppercase tracking-wide${
                      i >= 3 && i <= 5
                        ? i <= 4
                          ? " hidden md:table-cell"
                          : " hidden lg:table-cell"
                        : i === 7
                        ? " hidden lg:table-cell"
                        : ""
                    }`}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tx) => {
                const cfg = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.ACTIVE
                return (
                  <TableRow
                    key={tx.id}
                    className="border-border hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{tx.id}
                    </TableCell>
                    <TableCell className="font-medium text-foreground max-w-[160px] truncate">
                      {tx.bookTitle}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tx.userName}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {format(parseISO(tx.issueDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {format(parseISO(tx.dueDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell">
                      {tx.returnDate
                        ? format(parseISO(tx.returnDate), "dd MMM yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cfg.className}>
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell">
                      {tx.fine && tx.fine > 0 ? (
                        <span className="text-destructive font-medium">
                          ₹{tx.fine.toFixed(2)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} of {transactions.length} transactions
        </p>
      )}
    </div>
  )
}
