"use client"

import { useState, useEffect, useCallback } from "react"
import { booksApi, transactionsApi, dedupeBooks, ApiError, type BookDto } from "@/lib/api"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { useAuth } from "@/context/auth-context"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { DataTable, type Book } from "@/components/dashboard/data-table"
import { StatsCardSkeleton, TableSkeleton } from "@/components/dashboard/skeletons"
import { Button } from "@/components/ui/button"
import { BookOpen, BookCheck, BookX, ArrowLeftRight, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

function mapBookDto(b: BookDto): Book {
  return {
    id: String(b.id),
    title: b.title || "Unknown",
    author: b.author || "Unknown",
    isbn: b.isbn || "N/A",
    category: b.category || "Uncategorized",
    status: b.available ? "available" : "issued",
    copies: 1,
  }
}

export default function DashboardPage() {
  const { isLoading: authLoading } = useProtectedRoute()
  const { isAdmin, isLibrarian } = useAuth()
  // USER role has no access to transactions — never fetch it for them
  const canViewTransactions = isAdmin || isLibrarian

  const [recentBooks, setRecentBooks] = useState<Book[]>([])
  const [totalBooks, setTotalBooks] = useState(0)
  const [issuedBooks, setIssuedBooks] = useState(0)
  const [availableBooks, setAvailableBooks] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Always fetch books — all authenticated roles can read them
      // Only fetch transactions for ADMIN / LIBRARIAN — USER role has no access
      const requests: [Promise<unknown>, Promise<unknown>] = [
        booksApi.getAll(),
        canViewTransactions ? transactionsApi.getAll() : Promise.resolve(null),
      ]

      const [booksRes, txRes] = await Promise.allSettled(requests)

      // ── Books ──────────────────────────────────────────────────────────────
      if (booksRes.status === "fulfilled") {
        const value = booksRes.value as Awaited<ReturnType<typeof booksApi.getAll>>
        const raw = Array.isArray(value?.data) ? value.data.map(mapBookDto) : []
        const unique = dedupeBooks(raw)
        setTotalBooks(unique.length)
        setIssuedBooks(unique.filter((b) => b.status === "issued").length)
        setAvailableBooks(unique.filter((b) => b.status === "available").length)
        setRecentBooks(unique.slice(0, 6))
      } else {
        const err = booksRes.reason
        const isOffline = err instanceof ApiError && err.status === 0
        const msg = isOffline
          ? "Backend is not running. Start the Spring Boot server and refresh."
          : err instanceof ApiError
          ? `${err.message} (HTTP ${err.status})`
          : String(err)
        if (!isOffline) toast.error("Failed to load books", { description: msg })
        setError(msg)
      }

      // ── Transactions (ADMIN / LIBRARIAN only) ──────────────────────────────
      if (!canViewTransactions) {
        // USER role — skip silently, stat card is hidden for them
        setTotalTransactions(0)
      } else if (txRes.status === "fulfilled") {
        const value = txRes.value as Awaited<ReturnType<typeof transactionsApi.getAll>>
        setTotalTransactions(Array.isArray(value?.data) ? value.data.length : 0)
      } else {
        const err = txRes.reason
        // Network error is already surfaced by the books banner — skip toast
        if (!(err instanceof ApiError && err.status === 0)) {
          const msg = err instanceof ApiError
            ? `${err.message} (HTTP ${err.status})`
            : String(err)
          toast.error("Failed to load transactions", { description: msg })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [canViewTransactions])

  useEffect(() => {
    if (!authLoading) fetchData()
  }, [authLoading, fetchData])

  if (authLoading) return null

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your library management system"
      >
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 border-border"
          onClick={fetchData}
          disabled={isLoading}
          aria-label="Refresh dashboard"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </PageHeader>

      {/* Error banner — shown when books fetch fails */}
      {error && !isLoading && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive">
              {error.includes("not running") ? "Backend server is offline" : "Failed to load data"}
            </p>
            <p className="text-xs text-destructive/80 mt-0.5">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2 text-xs shrink-0"
            onClick={fetchData}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: canViewTransactions ? 4 : 3 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : (
          <>
            <StatsCard
              title="Total Books"
              value={totalBooks}
              icon={BookOpen}
              description="in catalogue"
            />
            <StatsCard
              title="Available"
              value={availableBooks}
              icon={BookCheck}
              description="ready to issue"
            />
            <StatsCard
              title="Issued"
              value={issuedBooks}
              icon={BookX}
              description="currently out"
            />
            {canViewTransactions && (
              <StatsCard
                title="Transactions"
                value={totalTransactions}
                icon={ArrowLeftRight}
                description="all time"
              />
            )}
          </>
        )}
      </div>

      {/* Recent books */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Recent Books</h2>
          <Link
            href="/dashboard/books"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            View all →
          </Link>
        </div>
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : (
          <DataTable books={recentBooks} onRefresh={fetchData} />
        )}
      </div>
    </div>
  )
}
